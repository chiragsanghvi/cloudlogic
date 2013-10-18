var vm = require('vm');
var MessageProcessor = require('./messageProcessor.js');
var messageCodes = require('./ipcMessageCodes.js');
//var debugLog = require('./logger.js').log;
var logStorage = [];
var thread = {};
var memwatch = require('memwatch');
var _eval = require('eval');
var options = JSON.parse(process.env.options);
var config = {};
config.baseUrl = options.apiBaseUrl;
config.baseDirectory = options.baseDirectory;
config.sdkPath = options.sdkPath;
config.sdkLatestVersion = options.sdkLatestVersion;

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
			console.log(msg);
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

var init = function (version) {

	if (!version) version = config.sdkLatestVersion;

	loadTime = new Date().getTime();

	var path = '.' + config.sdkPath + version + '.js';

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

var getErrorMessage = function(e, includedModules) {

	if (!e.stack && e.code) return e.message;

	console.log(e.stack);

	var stack = e.stack;
	var lines = stack.split('\n');

	if (lines.length <= 1) return e.toString();
	else {
		var msg = lines[0].toString();
		for (var i = 1; i < lines.length; i = i + 1) {
			var set = false;
			for (var name in includedModules) {
				if (lines[i].indexOf(name) != -1) {
					msg += '\n' + lines[i];
					break;
				}
			}
		}
	  	return msg;
	}
};

var request = function(body, headers, query) {
	this.body = body;
	this.headers = headers;
	this.query = query;
};

var response = function(messageId) {
	var messageId = messageId;
	
	this.headers = {};
	
	this.statusCode = '';

	this.success = function (data) {
    	data = data || '';
    	var resp = {
        	statusCode: this.statusCode || 200,
        	body: data || '',
       		headers: this.headers || {}
       	};

        sendSuccesResponse(resp, messageId);
        return;
    };

    this.error = function(msg) { 
      	msg = msg || "Error";

      	var err = {
      		statusCode: this.statusCode || 500,
        	body: msg || '',
        	headers: this.headers || {}
        };

      	sendErrorResponse(err, messageId);
      	return;
    };
};

var timerMap = {};

Thread.prototype.execute = function(message) {

	logStorage.length = [];
	this.includedModules = {};
	timerMap[message.id] = new Date().getTime();
	this.currentlyExecuting = true;
	//debugLog('Thread #' + this.id + '> Executing client code...');

	var serverDomain = require('domain').create();
	var that = this;

	serverDomain.on('error', function(e) {
	    sendErrorResponse({statusCode: '500', body: getErrorMessage(e, that.includedModules), headers: {}}, message.id);
	    serverDomain.dispose();
	});

	message.file = '"use strict";\n\n' + message.file;

	serverDomain.run(function() {
		that.ctx = that.getContext(message);

		that.includedModules[message.cf.n + '.js'] = message.file;

		posix.setrlimit('cpu', { soft: that.options.posixTime });
		try { 
			_eval(message.file , message.cf.n + '.js', that.ctx, false);
			var req = new request(message['b'], message['h'], message['q']);
		    var res = new response(message.id);

			that.ctx.Appacitive.Cloud.execute( message.cf.fn , { request: req, response: res });

		} catch(e) { 
			sendErrorResponse({ statusCode: '500', body: getErrorMessage(e, that.includedModules), headers: {}}, message.id); 
		}
	});
};


Thread.prototype.getContext = function(message) {

    var that = this;

	var ctx = vm.createContext({
		console: { log: log, dir: console.dir },
		Appacitive : init(),
		setTimeout: setTimeout,
		require: function(module) {

			if (that.includedModules[module]) {
				return _eval(that.includedModules[module] , module, that.ctx, false);
			}

			if (require('fs').existsSync('./handlers/' + module)) {
				var data = require('fs').readFileSync('./handlers/' + module, 'UTF-8');
				data = '"use strict";\n\n' + data;
				that.includedModules[module] = data;

				return _eval(data , module, that.ctx, false);
			}
			return {};
		}
	});

	ctx.Appacitive.config.apiBaseUrl = config.baseUrl;

	ctx.Appacitive.initialize({ apikey: message["ak"], env: message["e"], userToken: message["ut"], user: message["u"], appId: message["apid"] });
	
	return ctx;
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
