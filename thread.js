var MessageProcessor = require('./messageProcessor.js');
var messageCodes = require('./ipcMessageCodes.js');
var Runner = require('./runner.js');
//var debugLog = require('./logger.js').log;
var thread = {};
var memwatch = require('memwatch');
var options = JSON.parse(process.env.options);
var timerMap = {};

var Thread = function(options) {

	"use strict";

	this.id = options.threadId;
	delete options.threadId;

	this.options = options;
	
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

Thread.prototype.execute = function(message) {
	var that = this;

	console.log(this.options.sdkLatestVersion);

	var runner = new Runner({
		baseUrl: this.options.apiBaseUrl,
		baseDirectory: this.options.baseDirectory,
		sdkPath: this.options.sdkPath,
		sdkLatestVersion: this.options.sdkLatestVersion || "1",
		baseHandlerPath: this.options.baseHandlerPath,
		posixTime: this.options.posixTime,
		message: message,
		cb: function(messageId, response) {
			that.onHandlerCompleted(messageId, response);
			runner.dispose();
		}
	});

	timerMap[message.id] = new Date().getTime();
	this.currentlyExecuting = true;

	runner.run();
	//debugLog('Thread #' + this.id + '> Executing client code...');
};

Thread.prototype.onHandlerCompleted = function(messageId, response) {

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
