var vm = require('vm');
//var contextify = require('contextify');
var MessageProcessor = require('./messageProcessor.js');
var messageCodes = require('./ipcMessageCodes.js');
var debugLog = require('./logger.js').log;
var config = require('./config/contextConfig.js');
var logStorage = "";
var thread = {};
var memwatch = require('memwatch');

var logLevels = {
	DEBUG: 0,
	LOG: 1,
	WARN: 2,
	ERROR: 3
};
var posix = require('posix');

var logMessage = function(lvl, msg) {
	msg = new Date().toISOString() + " => " + msg;
	switch (lvl) {
		case logLevels.LOG:
			logStorage +=  msg + '\n';
			//console.log(msg);
			break;
		default: console.log(msg);
	}
};

var log = function() {
	if (arguments.length == 2) {
		logMessage(arguments[0], arguments[1]);
	} else {
		logMessage(logLevels.LOG, arguments[0]);
	}
};

var init = function () {

	var path = './sdk/sdkv1.js';
	delete require.cache[require.resolve(path)];

	var Appacitive = require(path);
	delete require.cache[require.resolve(path)];

	return Appacitive;
};

var Thread = function(options) {
	this.id = options.threadId;
	this.numberOfTaksExecuted = 0;

    var that = this;

	memwatch.on('leak', function(info) { 
		console.log("======" + options.threadId + "======");
		console.dir(info);
		console.log("============");
		that.terminate = true;
	 });
};

var sendErrorResponse = function(error, messageId) {
	var resp = {
		data: { 
			status : {
				code: error.code, 
				message: error.message,
				referenceid: messageId
			},
			body : null
		},
		log: logStorage
	};
	thread.onHandlerCompleted(messageId, resp);
};

var sendSuccesResponse = function(response, messageId) {
	var resp = {
		data: { 
			status : {
				code: '200', 
				message: 'successful',
				referenceid: messageId
			},
			body : response
		},
		log: logStorage
	};
	thread.onHandlerCompleted(messageId, resp);
};

var timerMap = {};
Thread.prototype.execute = function(message) {

	logStorage = '';
	timerMap[message.id] = new Date().getTime();
	this.currentlyExecuting = true;
	//debugLog('Thread #' + this.id + '> Executing client code...');

	//console.log('Thread #' + this.id + '> Executing client code...');

	this.setContext(message);

	try { vm.createScript(message.file, './' + message.cf.fn + '.vm'); } catch(e) { sendErrorResponse({code: '400', message: e.message }, message.id); return; }
	
	var serverDomain = require('domain').create();
	var that = this;
	serverDomain.on('error', function(e) {
	    sendErrorResponse({code: 400, message: e.message }, message.id);
	    serverDomain.dispose();
	});

	var script = message.file + '\n\n';
	script = script + 'Appacitive.Cloud.execute("' + message.cf.fn + '", { request: request, response: response });'

	serverDomain.run(function() {
		posix.setrlimit('cpu', { soft: 3 });
		try { 
			vm.runInNewContext(script, that.ctx, './' + message.cf.fn + '.vm'); 
		} catch(e) { 
			sendErrorResponse({code: '400', message: e.message }, message.id); 
		}
		
		/*try { 
			that.ctx.run(script, './' + message.cf.fn + '.vm'); 
		} catch(e) { 
			if (that.ctx) { 
				that.ctx.dispose();
				that.ctx = null;
			}
			sendErrorResponse({code: '400', message: e.message }, message.id); 
		}*/
	});
};

Thread.prototype.setContext = function(message) {
	var ctx = vm.createContext({
		console: { log: log, dir: console.dir },
		Appacitive : init()
	});

	this.ctx = ctx;
	
	ctx.Appacitive.config.apiBaseUrl = config.baseUrl;

	ctx.Appacitive.initialize({ apikey: message["ak"], env: message["e"], userToken: message["ut"], user: message["u"], appId: message["apid"] });

	ctx.request = {}; ctx.response = {};
	
    var that = this;

    ctx.response.error = function(msg) { 
      	msg = msg || "Error";
      	try { 
      		if (typeof msg == 'object') {
      	 		msg = JSON.stringify(msg); 
  	 		}
      	} catch(e) {}

      	sendErrorResponse({ code: 9200, message: msg }, message.id);
      	return;
    };
	
	this.setApiContext(message, ctx);
	
	return ctx;
};

Thread.prototype.setApiContext = function(message, ctx) {
    ctx.response.success = function (response) {
    	response = response || '';
    	var resp = {};
    	try {
        	JSON.stringify(response);
        	resp = response;
        } catch (e) { 
        	debugLog("Error encountered while stringifying result for transcationid " + message.id + " : ", e.message);
        	ctx.response.error("Error encountered while stringifying result : " + e.message);
        	return;
        }
        resp.body = response.body;
        resp.headers = response.headers || [];
        sendSuccesResponse(resp, message.id);
        return;
    };
    ctx.request.body = message['b'];
    ctx.request.headers = message['h'];
    ctx.request.query = message['q'];
};

Thread.prototype.onHandlerCompleted = function(messageId, response) {
	if (this.ctx) this.ctx = null;
	posix.setrlimit('cpu', { soft: null });
	
	//console.log('Thread #' + this.id + '> Done executing');
	response.data["timeTaken"] = new Date().getTime() - timerMap[messageId];
	delete timerMap[messageId];
	process.send({
		type: messageCodes.EXECUTION_COMPLETED,
		threadId: this.id,
		messageId: messageId,
		response: response
	});
	this.currentlyExecuting = false;
};

var options = JSON.parse(process.env.options);
thread = new Thread(options);

thread.messageProcessor = new MessageProcessor(thread);

// when notified that there is a new message 
// in the queue, ask the processor for a message
thread.messageProcessor.register(messageCodes.NEW_MESSAGE_IN_QUEUE, function(message) {
	//console.log('Thread #' + this.id + '> Got notification of new work item.');
	if (this.currentlyExecuting) return;

	if (this.terminate) {
		if (!this.terminateSend) {
			process.send({
				type: messageCodes.TERMINATE_THREAD,
				threadId: this.id
			});
			this.terminateSend = true;
		}
		return;
	}
	//console.log('Thread #' + this.id + '> Requesting work from processor.');
	process.send({
		type: messageCodes.REQUEST_FOR_MESSAGE,
		threadId: this.id
	});
});

//listen for new message when ready to execute
thread.messageProcessor.register(messageCodes.NEW_MESSAGE_FOR_THREAD, function(message) {
	//console.log('Thread> Thread #' + this.id + ' received message #' + message.id);
	this.execute(message);
});

process.on('message', function(message) {
	thread.messageProcessor.getMessageProcessor(message)();
});
