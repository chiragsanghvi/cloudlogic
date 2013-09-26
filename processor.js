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
	this.stats = { waitingForDispatch: 0, processing: 0, numThreads: 0};
	this.logs = {};
	this.pings = { };
	this.messageBuffer = [];
	this.messageThreadIds = {};
	this.callbacks = {};
	this._lastThreadId = 0;

	console.log(this.options.numThreads);

	// boot up the threads
	for (var x = 0; x < this.options.numThreads; x += 1) {
		this.threads.push(this.startThread());
	}

	// message processing from threads
	this.messageProcessor = new MessageProcessor(this);

	// Message handlers :

	// 1. to respond to requests for messages from threads
	this.messageProcessor.register(messageCodes.REQUEST_FOR_MESSAGE, function (message) {
		log('Processor #' + this.id + '> Received request for message from thread #' + message.threadId + ', ' + this.messageBuffer.length + ' messages in queue', 'debug');
		if (this.messageBuffer.length === 0) return;
		var thread = this.threads.filter(function (thread) {
			return thread._threadId == message.threadId;
		})[0];
		var messageToSend = this.messageBuffer.pop();

		this.stats.processing += 1;
		this.stats.waitingForDispatch = this.stats.waitingForDispatch - 1;
		
		this.messageThreadIds[message.threadId] = messageToSend.id;
		
		//send message to thread for execution
		thread.send(messageToSend);

		//Setup timeout handling
		this.setupPinging(thread, message.threadId, messageToSend.timeoutInterval);

        log('Processor> Served request for message, ' + this.messageBuffer.length + ' messages in queue', 'debug');
	});

	// 2. to respond to messages from threads signifying completion of execution
	this.messageProcessor.register(messageCodes.EXECUTION_COMPLETED, function (message) {
		log('Processor> Some thread got done with execution, there are ' + this.messageBuffer.length + ' messages in queue.', 'debug');
		try { 
			clearTimeout(this.pings[message.threadId]);
			delete this.pings[message.threadId];
			delete this.messageThreadIds[message.threadId]; 
		} catch(e) {}
		
		this.executeCallbacks(message.messageId, message.response);
		
		if (this.messageBuffer.length === 0) return;
		var messageToSend = this.messageBuffer.shift();
		var thread = this.threads.filter(function (thread) {
			return thread._threadId == message.threadId;
		})[0];
		thread.send(messageToSend);
	});
};

Processor.prototype.options = defaultOptions;

Processor.prototype.process = function(message, callback) {
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
		var callback = that.callbacks[messageId];
		if (!callback) return;
		callback(response);
		delete that.callbacks[messageId];
	}, 0);
};

// broadcast to all the threads
// there there are new messages to pick up
Processor.prototype.flush = function() {
	this.broadcast({
		type: messageCodes.NEW_MESSAGE_IN_QUEUE
	});
};

Processor.prototype.broadcast = function(message) {
	this.threads.forEach(function (thread) {
		if (thread.connected == true)
		   thread.send(message);
	});
};

Processor.prototype.enqueue = function(message) {
	message.type = messageCodes.NEW_MESSAGE_FOR_THREAD;
	this.messageBuffer.push(message);
};

Processor.prototype.registerCallback = function(messageId, callback) {
	if (typeof callback != 'function') return;
	this.callbacks[messageId] = callback;
};

Processor.prototype.setupPinging = function(thread, threadId, timeoutInterval) {
	var that = this;
	if (!timeoutInterval) timeoutInterval = 15000;
	try { clearTimeout(this.pings[threadId]); } catch(e) {}
	
	console.log(this.stats);

	// set up pinging
	this.pings[threadId] = setTimeout(function() {
		var filterDelegate = function (thread) {
			return thread._threadId == threadId;
		};
		var removeDelegate = function (thread) {
			return thread._threadId != cp._threadId;
		};
		// disconnect and kill the process
		var cp = that.threads.filter(filterDelegate);
		if (cp.length == 1) {
			cp = cp[0];
			delete that.pings[threadId];
			that.threads = that.threads.filter(removeDelegate);
			if (cp.connected == true ) {
				cp.disconnect();
				cp.kill();
				log('\n\nProcessor> Detected lockup in thread #' + threadId + '.\n\n', 'warn');
			}
		} else {
			log('\n\nCould not find locked up thread #' + threadId +'\n\n', 'warn');
		}
	}, timeoutInterval);
};


Processor.prototype.setupThreadRespawn = function(thread, threadId) {
	var that = this;
	thread.on('exit', function (code, signal) {

		log('Processor> Child process terminated due to receipt of signal ' + signal + ', respawning...', 'warn');

		//if any message was being processed by thread then execute its callback
		var messageId = that.messageThreadIds[threadId];

		if (messageId) {
			var timeOut = 0;
			//If the thread was aborted due to POSIX resource limitation then let the response wait for 12 seconds and then return;
			if (signal == 'SIGXCPU') timeOut = 12000;

			setTimeout(function() {
				console.log("=========sending time out response for " + messageId + "=========");
				that.executeCallbacks(messageId, { 
					data: { 
						status : {
							code: '508',
							message: 'Execution timed out',
							referenceid: messageId
						},
						payload : null
					},
					log: new Date().toISOString() + " => Execution timed out"
				});
			}, timeOut);
			try { delete that.messageThreadIds[threadId] } catch(e) {}
		}

		// Clean up timers
		// 1. ping 
		delete that.pings[threadId];

		// 2. decrement numthreads count
		that.stats.numThreads -= 1;

		// 3. respawn thread
		that.threads.push(that.startThread());

		// 4. flush the queue if requests have piled up
		that.flush();
	});
};

Processor.prototype.startThread = function() {
	var options = { }, that = this;
	options.threadId = this.id + '-' + this._lastThreadId++;
	
	log('Processor> Starting thread ', 'debug');

	var childProcess = require('child_process').fork('./thread.js', [], {
		env: {
			options: JSON.stringify(options)
		}
	});
	childProcess._threadId = options.threadId;
	this.pings[options.threadId] = new Date().getTime();

	this.stats.numThreads += 1;

	// set up stat handling
	childProcess.on('message', function (message) {
		that.messageProcessor.getMessageProcessor(message)();
	});

	// set up respawn
	this.setupThreadRespawn(childProcess, options.threadId);

	return childProcess;
};

Processor.prototype.getStats = function() {
	return this.stats;
};

Processor.prototype.getLogs = function() {
	return this.logs;
}

module.exports = Processor;