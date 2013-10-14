var Processor = require('./processor.js');
var guid = require('./guid.js').newGUID;

var Engine = function(options) {
	this.options = options || {};
	this.threadPool = [];
	this.messageThreads = {};
	this.processor = new Processor({
		id: guid()
	});
};


Engine.prototype.process = function(message, callback) {
	callback = callback || function() {};
	this.processor.process(message, callback);
};

Engine.prototype.getStats = function() {
	return this.processor.getStats();
};

Engine.prototype.getLogs = function() {
	return this.processor.getLogs();
};

Engine.prototype.getMessages = function() {
	return {
		stats: this.processor.getMessages(),
		buffered: this.processor.messageBuffer,
		processing: this.processor.processing,
		lastThreadId: this.processor.threads.map(function(thread) {
			return thread._threadId;
		})
	};
};

Engine.prototype.flush = function() {
	this.processor.flush();	
};

module.exports = Engine;