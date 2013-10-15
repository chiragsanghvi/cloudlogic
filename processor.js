var MessageProcessor = require('./messageProcessor.js');
var messageCodes = require('./ipcMessageCodes.js');
var log = require('./logger.js').log;
var defaultOptions = require('./config/processorConfig.js');

var Processor = function(options) {

	options = options || {};

	var that = this;

	// extend the defaults
	for (var key in options) {
		this.options[key] = options[key];
	}

	this.id = this.options.id;

	log('Processor> Starting processor #' + this.id);

	// public members
	this.threads = [];
	this.stats = { waitingForDispatch: 0, processing: 0, numThreads: 0, numberProcessed: 0};
	this.logs = {};
	this.pings = {};
	this.messageBuffer = [];
	this.messageThreads = {};
	this.callbacks = {};
	this._lastThreadId = 0;
	this.timeOutFunctions = {};
	this.fileVersion = {};
	this.processing = {};

	this.idleThreads = [];

	// message processing from threads
	this.messageProcessor = new MessageProcessor(this);

	for (var i = 0; i < this.options.numThreads; i = i+1) {
		this.startThread();
	}

	// Message handlers :

	// 1. to respond to messages from threads signifying completion of execution
	this.messageProcessor.register(messageCodes.EXECUTION_COMPLETED, function (message) {
		log('Processor> Some thread got done with execution, there are ' + this.messageBuffer.length + ' messages in queue.', 'debug');
		try { 
			clearTimeout(this.pings[message.threadId]);
			delete this.pings[message.threadId];
			delete this.messageThreads[message.threadId]; 
		} catch(e) {}
		

		var filterDelegate = function (thread) {
			return thread._threadId == message.threadId;
		};

		var cp = this.threads.filter(filterDelegate);
		
		if (cp.length > 0) {
			cp[0].count++;
			if (message.terminate || cp[0].recycle) {
				cp[0].recycle = true;
				setTimeout(function() {
					that.recycleThreads();
				}, 20);
			} else {
				this.idleThreads.push(cp[0]);
			}
		}
		this.executeCallbacks(message.messageId, message.response);
		this.flush();
	});

	//2. to respond to termination requests from threads
	this.messageProcessor.register(messageCodes.TERMINATE_THREAD, function(message){
		console.log("Processor> Child process termination request");

		var filterDelegate = function (thread) {
			return thread._threadId == message.threadId;
		};

		var cp = this.threads.filter(filterDelegate);
		if (cp.length > 0) cp[0].recycle = true;
		
		this.recycleThreads();
	});

	this.clearUnusedThreads = function(all) {
		if (this.idleThreads.length > 0 && (all || this.stats.waitingForDispatch == 0)) {
			var count = all ? this.idleThreads.length : (this.idleThreads.length - this.options.numThreads);
			if (count > 0) {
				this.idleThreads.forEach(function(thread) {
					if (--count >= 0 && !that.messageThreads[thread._threadId]) {
						that.terminateThread({ threadId: thread._threadId });
					}
				});
			}
		}
	};

	this.recycleThreads = function() {
		this.threads.forEach(function(thread) {
			if (thread.recycle && !that.messageThreads[thread._threadId]) {
				that.terminateThread({ threadId: thread._threadId, kill: true });
			}
		});
	};

	setInterval(function() {
		that.clearUnusedThreads();
	}, this.options.clearThreadInterval);
};

Processor.prototype.options = defaultOptions;

Processor.prototype.process = function(message, callback) {
	//Check for change in file versions and reset timeout functions
	if (this.fileVersion[message.dpid] != message.cf.v) {
		this.fileVersion[message.dpid] = message.cf.v;
		this.timeOutFunctions[message.dpid] = { };
		this.timeOutFunctions[message.dpid][message.cf.fn] = { count: 0 } ;
	} else {
		//If the function name exists in timeoutFunctions object and its count is greater than or equal to 10
		if (this.timeOutFunctions[message.dpid] && this.timeOutFunctions[message.dpid][message.cf.fn]) {
			if (this.timeOutFunctions[message.dpid][message.cf.fn].count >= this.options.timeoutCounts) {
				setTimeout(function() {
					callback({
						headers: {},
						data: "Malicious code block detected, causing timeouts. Please verify your code and redeploy",
						code: "508",
						log: [{ time: new Date().toISOString(), msg : "Malicious code block detected, causing timeouts. Please verify your code and redeploy" }]
					});
				}, 0);
				return;
			}
		} else {
			if (!this.timeOutFunctions[message.dpid]) this.timeOutFunctions[message.dpid] = {};
			this.timeOutFunctions[message.dpid][message.cf.fn] = { count: 0 };
		}
	}

	this.stats.waitingForDispatch += 1;
	log('Processor #' + this.id + '> New work available.', 'debug');
	this.enqueue(message);
	this.registerCallback(message.id, callback);
	this.flush();
};

// do this async, the request has been processed
// sending the response isnt super critical
// and it has to travel up the stack a few layers (in-process though)
Processor.prototype.executeCallbacks = function(messageId, response) {
	var that = this;
	setTimeout(function() {
		that.stats.processing = that.stats.processing - 1;
		delete that.processing[messageId];
		var callback = that.callbacks[messageId];
		if (!callback) return;

		if (callback.executed) {
			delete that.callbacks[messageId];
			return;
		}
		callback.executed = true;
		callback(response);
		delete that.callbacks[messageId];
	}, 0);
};

// broadcast to all the threads
// there there are new messages to pick up
Processor.prototype.flush = function() {

	if (this.messageBuffer.length === 0) return;
	var thread = this.idleThreads.pop();
	
	//If no thread found 
	if (!thread) {
		//create a thread if numThreads is less than max threads
		if (this.stats.numThreads < this.options.maxThreads && this.stats.waitingForDispatch > 0) {
			this.startThread();
			this.flush();
		}
		return;
	}

	if (this.messageThreads[thread._threadId] || !thread.connected || thread.recycle || thread.count >= this.options.maxThreadExecutionCount) {
		if (thread.count >= this.options.maxThreadExecutionCount) thread.recycle = true;
		if (thread.recycle) this.recycleThreads();
		this.flush();
		return;
	}

	var messageToSend = this.messageBuffer.pop();

	if (!messageToSend) return;

	this.stats.processing += 1;
	this.stats.waitingForDispatch = this.stats.waitingForDispatch - 1;
	
	// add mapping for threadId and message
	this.messageThreads[thread._threadId] = messageToSend;
	
	// add mapping for message and threadid
	this.processing[messageToSend.id] =  thread._threadId;

	//Setup timeout handling
	this.setupPinging(thread, thread._threadId, messageToSend.timeoutInterval);

	//send message to thread for execution
	thread.send(messageToSend);

    log('Processor> Served request for message, ' + this.messageBuffer.length + ' messages in queue', 'debug');
};

Processor.prototype.enqueue = function(message) {
	message.type = messageCodes.NEW_MESSAGE_FOR_THREAD;
	this.messageBuffer.push(message);
};

Processor.prototype.registerCallback = function(messageId, callback) {
	if (typeof callback != 'function') return;
	this.callbacks[messageId] = callback;
};

Processor.prototype.terminateThread = function(options) {
	threadId = options.threadId;

	var filterDelegate = function (thread) {
		return thread._threadId == threadId;
	};
	var removeDelegate = function (thread) {
		return thread._threadId != cp._threadId;
	};
	// disconnect and kill the process
	var cp = this.threads.filter(filterDelegate);
	if (cp.length == 1) {
		cp = cp[0];
		clearTimeout(this.pings[threadId]);
		delete this.pings[threadId];
		this.threads = this.threads.filter(removeDelegate);
		this.idleThreads = this.idleThreads.filter(removeDelegate);
		if (cp.connected == true ) {
			cp.disconnect();
			if (options.isTimeout) {
				if (options.kill) cp.kill("SIGXCPU");
				log('\n\nProcessor> Detected lockup or memory overflow in thread #' + threadId + '.\n\n', 'warn');
			} else if(options.kill) {
				log('\n\nProcessor> Cleaning idle thread #' + threadId, 'warn');
				cp.kill("SIGQUIT");
			} else {	
				log('\n\nProcessor> Cleaning idle thread #' + threadId, 'warn');
				cp.kill();
			}
		}
	}
};

Processor.prototype.setupPinging = function(thread, threadId, timeoutInterval) {
	var that = this;
	if (!timeoutInterval) timeoutInterval = 15000;
	try { clearTimeout(this.pings[threadId]); } catch(e) {}
	
	//console.log(this.stats);

	// set up pinging
	this.pings[threadId] = setTimeout(function() {
		that.terminateThread({ threadId: threadId, isTimeout: true, kill: true });
	}, timeoutInterval);
};


Processor.prototype.setupThreadRespawn = function(thread, threadId) {
	var that = this;

	thread.on('exit', function (code, signal) {

		//if any message was being processed by thread then execute its callback
		var message = that.messageThreads[threadId];
		
		if (message) {

			log('Processor> Child process terminated due to receipt of code ' + code + ' and signal ' + signal + '', 'warn');

			var timeOut = 0;
			var statusMessage = 'Server Error';
			var	statusCode = '500';
			
			//If the thread was aborted due to POSIX resource limitation then let the response wait for 12 seconds and then return;
			//If the thread was aborted due to timeout
			if (signal == 'SIGXCPU') {
				timeOut = that.options.sendTimeoutInterval;
				statusMessage = 'Execution timed out';
				statusCode = '508';
				if (!that.timeOutFunctions[message.dpid]) that.timeOutFunctions[message.dpid] = {};
				if (!that.timeOutFunctions[message.dpid][message.cf.fn]) that.timeOutFunctions[message.dpid][message.cf.fn] = { count: 0 };
				that.timeOutFunctions[message.dpid][message.cf.fn]['count']++;
			}
			setTimeout(function() {
				console.log("=========sending time out response for " + message.id + "=========");
				that.executeCallbacks(message.id, { 
					headers: {},
					data: statusMessage,
					code: statusCode,
					log: [{ time: new Date().toISOString(), msg : statusMessage }]
				});
			}, timeOut);
			that.terminateThread({ threadId: threadId, isTimeout: (signal == 'SIGXCPU') ? true : false });
			try { delete that.messageThreads[threadId] } catch(e) {}
		}

		// Clean up timers
		// 1. ping 
		clearTimeout(that.pings[threadId]);
		delete that.pings[threadId];

		// 2. decrement numthreads count
		that.stats.numThreads -= 1;

		// 3. respawn thread
		if (signal == 'SIGQUIT' || signal == 'SIGXCPU') that.startThread();
		
		// 4. flush the queue if requests have piled up
		that.flush();
	});
};

Processor.prototype.startThread = function() {
	var options = { }, that = this;
	options.threadId = this.id + '-' + this._lastThreadId++;
	options.posixTime = this.options.posixTime;

	log('Processor> Starting thread ', 'debug');

	var childProcess = require('child_process').fork('./thread.js', [], {
		env: {
			options: JSON.stringify(options)
		}
	});
	childProcess._threadId = options.threadId;
	childProcess.count = 0;
	this.pings[options.threadId] = null;

	this.stats.numThreads += 1;

	// set up stat handling
	childProcess.on('message', function (message) {
		that.messageProcessor.getMessageProcessor(message)();
	});

	// set up respawn
	this.setupThreadRespawn(childProcess, options.threadId);

	this.threads.push(childProcess);
	this.idleThreads.push(childProcess);


	return childProcess;
};

Processor.prototype.getStats = function() {
	return this.stats;
};

Processor.prototype.getLogs = function() {
	return this.logs;
};

Processor.prototype.getMessages = function() {
	var messages = [];
	for (var mt in this.messageThreads) {
		messages.push({ id: this.messageThreads[mt].id, cf: this.messageThreads[mt].cf });
	};
	return messages;
};

module.exports = Processor;