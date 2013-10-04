var Processor = require('./processor.js');

var Engine = function(options) {
	this.options = options || {};
};

var processorList = [];
var processorCount = 0;

Engine.prototype.process = function(message, callback) {
	callback = callback || function() {};
	var proc = processorList.filter(function (p) {
		return p.deploymentId == message.dpid;
	})[0];

	if (proc) {
		proc.processor.process(message, callback);
	} else {
		processorList.push({
			deploymentId: message.dpid,
			processor: new Processor({
				id: message.dpid
			})
		});
		this.process(message, callback);
	}
};

Engine.prototype.getStats = function() {
	return processorList.map(function (processor) {
		return {
			deploymentId: processor.deploymentId,
			stats: processor.processor.getStats()
		};
	});
};

Engine.prototype.getLogs = function() {
	return processorList.map(function (processor) {
		return {
			deploymentId: processor.deploymentId,
			logs: processor.processor.getLogs()
		};
	});
};

Engine.prototype.getMessages = function() {
	return processorList.map(function (processor) {
		return {
			deploymentId: processor.deploymentId,
			stats: processor.processor.getMessages(),
			buffered: processor.processor.messageBuffer,
			processing: processor.processor.processing,
			lastThreadId: processor.processor.threads.map(function(thread) {
				return thread._threadId;
			})
		};
	});
};

Engine.prototype.flush = function() {
	return processorList.map(function (processor) {
		processor.processor.flush();
		return {
			deploymentId: processor.deploymentId
		};
	});
};

module.exports = Engine;