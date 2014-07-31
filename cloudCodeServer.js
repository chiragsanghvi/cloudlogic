var restify = require('restify');
var Engine = require('./engine.js');
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

module.exports = function(port) {

	var loggerType = config.loggerType;

	var engine = this.engine = new Engine();

	//create an s3Logger child process to log output of handler to s3
	var logger = require('child_process').fork('./' + loggerType + 'Logger.js',[] , {});

	//put an handler
	logger.on('exit',function () {
		console.log(loggerType + 'Logger ' + logger.pid + ' died', 'error');
	    logger = require('child_process').fork('./' + loggerType + 'Logger.js',[],{});
	});


	//create server
	var server = restify.createServer();

	//attach CORS headers
	server.pre(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
		next();
	});

	//authenticate using basic auth if provided
	server.pre(require('./authorization.js')());

	//add pre handler for handlig graceful shutdown
	server.pre(function(req, res, next) {
		if (server.gracefulShutdown) {
			res.setHeader("Connection", "close");
	  		res.send(503, "Service unavailable");
	  		next();
	  		return;
		}
		req.headers["cors"] = false;
		if (req.contentType() == 'text/plain' || req.query.ua == 'ie') {
			req._contentType = 'application/json';
			req.headers["cors"] = true;
		}
		next();
	});

	//for accpeting all content
	server.use(restify.acceptParser(server.acceptable));

	//for parsing query string
	server.use(restify.queryParser({ mapParams: false }));

	//for sending gzip response
	server.use(restify.gzipResponse());

	//for parsing the body
	server.use(restify.bodyParser({ mapParams: false, rejectUnknown: false }));
	
	/* To validate the request */
	server.use(requestParser);

	/* server.use(restify.throttle({
	  rate: 10,
	  burst: 10,
	  username: true
	}));*/
	
	// route for loader-io
	server.get("/" + config.loaderIO + ".txt", function(req, res, next) {

	   res.setHeader('content-Length', config.loaderIO);
	   res.setHeader('content-type', 'text/plain');

	   console.log("In loader");
	   res.send(config.loaderIO);
	});

	// route for cloud function
	server.post(config.path + 'apis/:name', function (req, res, next) {
		
		// For debugging purpose
		var startTime = new Date().getTime();

		req.type = 'apis';
		
		// get context from apis
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

					res.setHeader("content-type", "application/json");

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
	       				logger.send({ 
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
				// call next with an error saying cannot find handler
				return next(new customError('404', message ));
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
	    console.log('Cloud code server listening  at %s', server.url);
	});
    
	server.on('uncaughtException', function (req, res, route, err) {
		console.log(err);
		var transactionId = res.headers()["TransactionId"];
		if (!transactionId) {
		    res.setHeader('TransactionId', req.id);
		    res.send(500, 'Internal Server Error');
		}
	});

	return server;
};
