//Log to file debug.log in logs folder

var winston = require('winston');

var logger = new (winston.Logger)({
	transports: [
	  new (winston.transports.File)({ filename: './logs/debug.log', json : true, maxsize: 115000 })
	],
	exitOnError: false
});

exports.log = function(message, level) {
	if (!level) level = 'info';
	switch (level) {
		case 'info': logger.log('info', message); 
					 console.log(message);
					 break;
	    case 'debug': logger.log('debug', message); 
	    			 console.log(message);
					 break;
		case 'warn': logger.log('warn', message);
		             console.log(message);
					 break;
		case 'error':logger.log('error', message);
					 console.log(message);
					 break;
	}
}