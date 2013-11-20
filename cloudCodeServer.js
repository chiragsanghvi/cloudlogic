var restify = require('restify');
var util = require('util');
var messageCodes = require('./ipcMessageCodes.js');
var config = require('./config/contextConfig.js');
var context = require('./getContext.js');
var getHandler = require('./getHandler.js').getHandler;
var requestParser = require('./requestParser.js')();
var customError = require('./customError.js');

var getResponseCode = function(code) {
	switch(code) {
		case '200': return 200;
		case '400': return 400;
		case '404': return 404;
		case '500': return 500;
		case '508': return 503;
	};
	return code;
};

module.exports = function(port, engine) {

	//create an s3Logger child process to log output of handler to s3
	var s3Logger = require('child_process').fork('./s3Logger.js',[],{});

	//put an handler
	s3Logger.on('exit',function () {
		log('S3 Logger ' + s3Logger.pid + ' died', 'error');
	    s3Logger = require('child_process').fork('./s3Logger.js',[],{});
	});

	var server = restify.createServer();

	server.pre(function(req, res, next) {
		if (server.gracefulShutdown) {
			res.setHeader("Connection", "close");
	  		res.send(502, "Server is in the process of restarting");
	  		next();
	  		return;
		}
		if (req.headers["content-type"] == 'text/plain') req.headers["content-type"] = 'application/json';
		next();
	});

	server.pre(require('./authorization.js')());

	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser({ mapParams: false }));
	server.use(restify.gzipResponse());
	server.use(restify.bodyParser({ mapParams: false, rejectUnknown: false }));

	/* To validate the request */
	server.use(requestParser);

	/* server.use(restify.throttle({
	  rate: 10,
	  burst: 10,
	  username: true
	}));*/

	server.get("/" + config.loaderIO + ".txt", function(req, res, next) {

	   res.setHeader('content-Length', config.loaderIO);
	   res.setHeader('content-type', 'text/plain');

	   console.log("In loader");
	   res.send(config.loaderIO);
	});

	server.post(config.path + 'apis/:name', function (req, res, next) {
		
		var startTime = new Date().getTime();

		req.type = 'apis';
		
		// get context
		context.getContext(req, res, function(ctx) {

			req.id = ctx.id;

			ctx.timeoutInterval = 15000;
			
			var contextTime = new Date().getTime();

			//get handler
			getHandler(ctx, function() {

				var handlerTime = new Date().getTime();

				ctx.b = req.body;
				ctx.h = req.headers;
				ctx.q = req.query;

				engine.process(ctx, function(resp) {

					if (resp.data) {
						resp.headers["totalTime"] = new Date().getTime() - startTime;
						resp.headers["contextTime"] = contextTime - startTime;
						resp.headers["handlerTime"] = handlerTime - contextTime;
						resp.headers["executionTime"] = new Date().getTime() - handlerTime;
					}

					try {
						if (resp.headers) {
							if (typeof resp.headers == 'object') {
								for (var key in resp.headers) {
									res.setHeader(key, resp.headers[key]);
								}
							}
						}
					} catch(e) {}

					res.setHeader('TransactionId', ctx.id);
					var statusCode = getResponseCode(resp.code);

					res.send(statusCode, resp.data);
					
					delete ctx.file ;
					
					try {
	       				s3Logger.send({ 
							type: messageCodes.NEW_MESSAGE_FOR_LOG,
							info: ((resp.code >= 200 && resp.code < 300) || resp.code == 304) ? 'S' : 'E',
							log: resp.log, 
							ctx: ctx,
							url: req.url,
							code: resp.code,
							timeTaken: new Date().getTime() - startTime
						});
					} catch(e) {
						console.dir(e);
					}

					resp = null;
					ctx = null;

					return next();
				});
				
			}, function(message) {
				res.setHeader('TransactionId', ctx.id);
				// call next with an error saying cannot find handler
				return next(new customError('404', { code: '404', message: message }));
			});
			
		}, next);
	});

	server.post(config.path + 'tasks/:name', function (req, res, next) {
		req.type = 'tasks';
		context.getContext(req, function(ctx) {
			res.send(ctx);	
		}, next);
		next();
	});

	server.listen(port, function () {
	    console.log('Cloud code server listening at %s', server.url);
	});
    
	server.on('uncaughtException', function (req, res, route, err) {
		console.log(err);
	   //res.setHeader('TransactionId', req.id);
	   //res.send(500, 'Server Error');
	});

	return server;

};
