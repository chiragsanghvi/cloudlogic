var vm = require('vm');
var MessageProcessor = require('./messageProcessor.js');
var messageCodes = require('./ipcMessageCodes.js');
//var debugLog = require('./logger.js').log;
var config = require('./config/contextConfig.js');
var logStorage = [];
var thread = {};
var memwatch = require('memwatch');

var logLevels = {
	DEBUG: 0,
	LOG: 1,
	WARN: 2,
	ERROR: 3
};
var loadTime = 0;
var posix = require('posix');

var logMessage = function(lvl, msg) {
	if (typeof msg === 'object') {
		try { msg = JSON.stringify(msg, undefined, 3); } catch(e){}
	}
	switch (lvl) {
		case logLevels.LOG:
			logStorage.push({ time: new Date().toISOString(), msg:  ('' + msg) });
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

	loadTime = new Date().getTime();

	var path = './sdk/sdkv1.js';
	delete require.cache[require.resolve(path)];

	var Appacitive = require(path);
	delete require.cache[require.resolve(path)];

	loadTime = new Date().getTime() - loadTime;

	return Appacitive;
};

var Thread = function(options) {
	this.id = options.threadId;
	this.options = { posixTime: options.posixTime };

    var that = this;

	memwatch.on('leak', function(info) { 
		console.log("\n======" + options.threadId + "======");
		console.dir(info);
		console.log("============\n");

		process.send({
			type: messageCodes.TERMINATE_THREAD,
			threadId: that.id
		});
	 });
};

var sendErrorResponse = function(error, messageId, headers) {
	var resp = {
		data: error.body || '',
		code: error.statusCode, 
		log: logStorage,
		headers: error.headers
	};
	thread.onHandlerCompleted(messageId, resp);
};

var sendSuccesResponse = function(response, messageId) {
	var resp = {
		data: response.body || '',
		code: response.statusCode, 
		log: logStorage,
		headers: response.headers
	};
	thread.onHandlerCompleted(messageId, resp);
};

var timerMap = {};
Thread.prototype.execute = function(message) {

	logStorage.length = [];
	timerMap[message.id] = new Date().getTime();
	this.currentlyExecuting = true;
	//debugLog('Thread #' + this.id + '> Executing client code...');

	//console.log('Thread #' + this.id + '> Executing client code...');

	this.setContext(message);

	try { vm.createScript(message.file, './' + message.cf.fn + '.vm'); } catch(e) { sendErrorResponse({ statusCode: '500', body: e.message, headers: {}}, message.id); return; }
	
	var serverDomain = require('domain').create();
	var that = this;
	serverDomain.on('error', function(e) {
	    sendErrorResponse({statusCode: '500', body: e.message, headers: {}}, message.id);
	    serverDomain.dispose();
	});

	var script = message.file + '\n\n';
	script = script + 'Appacitive.Cloud.execute("' + message.cf.fn + '", { request: request, response: response });'

	serverDomain.run(function() {
		posix.setrlimit('cpu', { soft: that.options.posixTime });
		try { 
			vm.runInNewContext(script, that.ctx, './' + message.cf.fn + '.vm'); 
		} catch(e) { 
			sendErrorResponse({ statusCode: '500', body: e.message, headers: {}}, message.id); 
		}
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

      	var err = {
      		statusCode: ctx.response.statusCode || 500,
        	body: msg || '',
        	headers: ctx.response.headers || {}
        };

      	sendErrorResponse(err, message.id);
      	return;
    };
	
	this.setApiContext(message, ctx);
	
	return ctx;
};

Thread.prototype.setApiContext = function(message, ctx) {
	ctx.response.headers = {};
	ctx.response.success = function (response) {
    	response = response || '';
    	var resp = {
        	statusCode: ctx.response.statusCode || 200,
        	body: response || '',
       		headers: ctx.response.headers || {}
       	};

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
	
	response.headers["sdkloadtime"] = loadTime;

	//console.log('Thread #' + this.id + '> Done executing');
	delete timerMap[messageId];
	process.send({
		type: messageCodes.EXECUTION_COMPLETED,
		threadId: this.id,
		messageId: messageId,
		response: response,
		terminate: this.terminate
	});
	this.currentlyExecuting = false;
};

var options = JSON.parse(process.env.options);
thread = new Thread(options);

thread.messageProcessor = new MessageProcessor(thread);

//listen for new message when ready to execute
thread.messageProcessor.register(messageCodes.NEW_MESSAGE_FOR_THREAD, function(message) {
	//console.log('Thread> Thread #' + this.id + ' received message #' + message.id);
	this.execute(message);
});

process.on('message', function(message) {
	thread.messageProcessor.getMessageProcessor(message)();
});
