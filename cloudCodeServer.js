var restify = require('restify');
var util = require('util');
var messageCodes = require('./ipcMessageCodes.js');

/* custom error message for get handler */
function InvalidHandlerError(code, status) {
  restify.RestError.call(this, {
    restCode: code,
    statusCode: code,
    constructorOpt: InvalidHandlerError,
    body: {
        status : status,
        body: null
    }
  });

  this.name = 'InvalidHandlerError';
};

util.inherits(InvalidHandlerError, restify.RestError);

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

	var server = restify.createServer({
		formatters: {
	        'application/json': function ( req, res, body ) {
	            // Copied from restify/lib/formatters/json.js

	            if ( body instanceof Error ) {
	                // snoop for RestError or HttpError, but don't rely on
	                // instanceof
	                res.statusCode = body.statusCode || 500;

	                if ( body.body ) {
	                	if (body.body.status) {
	                		body = body.body;
	                	} else {
	                		if (body.body.code.toLowerCase() == 'InternalError') body.body.message = 'Server Error';

		                    body = {
	                        	code: body.body.code,
	                        	msg: body.body.message
		                    };
		                }
	                } 
	            } else if ( Buffer.isBuffer( body ) ) {
	                body = body.toString( 'base64' );
	            }

	            var data = JSON.stringify( body );
	            res.setHeader( 'Content-Length', Buffer.byteLength( data ) );

	            return data;
	        },
	        'text/html': function(req, res, body) {
	            return body;
	        },
	        'text/plain': function(req, res, body) {
	            return body;
	        }
	    }
	});
	var config = require('./config/contextConfig.js');
	var context = require('./getContext.js');
	var getHandler = require('./getHandler.js').getHandler;
	
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

	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser({ mapParams: false }));
	server.use(restify.gzipResponse());
	server.use(restify.bodyParser({ mapParams: false, rejectUnknown: false }));

	/* To validate the request */
	server.use(require('./requestParser.js')());

	/* server.use(restify.throttle({
	  rate: 10,
	  burst: 10,
	  username: true
	}));*/

	server.get("/loaderio-02c74db7ffc3daa187c9d2ec9ef620d8.txt", function(req, res, next) {

	   res.setHeader('content-Length', 'loaderio-02c74db7ffc3daa187c9d2ec9ef620d8');
	   res.setHeader('content-type', 'text/plain');

	   console.log("In loader");
	   res.send("loaderio-02c74db7ffc3daa187c9d2ec9ef620d8");
	});

	server.post(config.path + 'apis/:name', function (req, res, next) {
		
		var startTime = new Date().getTime();

		req.type = 'apis';
		
		// get context
		context.getContext(req, res, function(ctx) {

			ctx.timeoutInterval = 15000;
			
			var contextTime = new Date().getTime();

			//get handler
			getHandler(ctx, function() {
				var handlerTime = new Date().getTime();

				ctx.b = req.body['b'];
				ctx.h = req.headers;
				ctx.q = req.query;

				engine.process(ctx, function(resp) {

					/*resp.data.totalTime = new Date().getTime() - startTime;
					resp.data.contextTime = contextTime - startTime;
					resp.data.handlerTime = handlerTime - contextTime;
					resp.data.executionTime = new Date().getTime() - handlerTime;*/

					try {
						if (resp.headers) {
							if (typeof resp.headers == 'object') {
								for (var key in resp.headers) {
									res.setHeader(key, resp.headers[key]);
								}
							}
						}
					} catch(e) {}

					res.statusCode = getResponseCode(resp.code);

					res.send(resp.data);
					
					delete ctx.file ;

					try {
	       				s3Logger.send({ 
							type: messageCodes.NEW_MESSAGE_FOR_LOG,
							info: ((resp.code >= 200 && resp.code < 300) || resp.code == 304) ? 'S' : 'E',
							log: resp.log, 
							resp: resp.data,
							ctx: ctx,
							url: req.url
						});
					} catch(e) {
						console.dir(e);
					}

					ctx = null;
					resp = null;
				});
				
			}, function(message) {
				// call next with an error saying cannot find handler
				return next(new InvalidHandlerError('404', { referenceid: ctx.id, code: '404', message: message }));
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
    
	return server;

};
