var cluster = require('cluster');
var numCPUs = require('os').cpus().length * 2;

var Master = function () {
    
	"use strict";

	var MessageProcessor = require('./messageProcessor.js'),
	messageCodes = require('./ipcMessageCodes.js'),
	log = require('./logger.js').log;

	var self = this;

	this.messageProcessor = new MessageProcessor(this);

	//create an s3Logger child process to log output of handler to s3
	var s3Logger = require('child_process').fork('./s3Logger.js',[],{});
	
	//put an handler
	s3Logger.on('exit',function () {
		log('S3 Logger ' + s3Logger.pid + ' died', 'error');
	    s3Logger = require('child_process').fork('./s3Logger.js',[],{});
	});

	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
	  	cluster.fork();
	}
    
    // Send message to s3 logger for logging
	this.messageProcessor.register(messageCodes.NEW_MESSAGE_FOR_LOG, function (message) {
		try {
           s3Logger.send(message);
        } catch(e) {}
	});

	// In case the worker dies!
	cluster.on('exit', function(worker, code, signal) {
		log('worker ' + worker.process.pid + ' died with code : ' + code + ' and signal : ' + signal, 'error');
		cluster.fork();
	});

	// As workers come up.
	cluster.on('listening', function(worker, address) {
		log("A worker with #" + worker.id + " is now connected to " + address.address + ":" + address.port);
		//add message handler
		worker.on('message', function(message) {
			self.messageProcessor.getMessageProcessor(message)();
		});
	});
    
};

module.exports = Master;

