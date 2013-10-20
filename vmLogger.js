
var logLevels = {
	DEBUG: 0,
	LOG: 1,
	WARN: 2,
	ERROR: 3
};

var Logs = function() {
	"use strict";

	var logStorage = [];

	this.log = function() {
		if (arguments.length == 0) return;

		var lvl = logLevels.LOG;

		var msg = '';
		if (arguments.length == 2) {
			lvl = arguments[0];
			msg = arguments[1]; 
		} else {
			lvl = logLevels.LOG;
			msg = arguments[0];
		}

		if (msg == undefined) msg = 'undefined';
		else if (msg == null) msg = 'null';
		else if (typeof msg == 'function') msg = '{}';
		else if (typeof msg == 'object') msg = '' + msg;
		
		switch (lvl) {
			case logLevels.LOG:
				logStorage.push({ time: new Date().toISOString(), msg:  msg.toString() });
				console.log(msg);
				break;
			default: console.log(msg);
		}
	};

	this.log.toString = function() {
		return "function () { [native code] }";
	};

	this.getLogs = function() {
		return logStorage;
	};
};



module.exports = Logs;