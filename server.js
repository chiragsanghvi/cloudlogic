var restify = require('restify');
var util = require('util');

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
	                        body: null,
	                        status: {
	                        	code: body.body.code,
	                        	msg: body.body.message
	                    	}
	                    };
	                }
                } 
            } else if ( Buffer.isBuffer( body ) ) {
                body = body.toString( 'base64' );
            }

            var data = JSON.stringify( body );
            res.setHeader( 'Content-Length', Buffer.byteLength( data ) );

            return data;
        }
    }
});
var config = require('./config/contextConfig.js');
var context = require('./getContext.js');
var getHandler = require('./getHandler.js').getHandler;
var Engine = require('./engine.js');

server.pre(function(req, res, next) {
	if (req.headers["content-type"] == 'text/plain') req.headers["content-type"] = 'application/json';
	next();
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser({ mapParams: false }));
server.use(restify.gzipResponse());
server.use(restify.bodyParser({ mapParams: false, rejectUnknown: false }));

/* To validate the request */
server.use(require('./requestParser.js')());

/* custom error message for get handler */
function InvalidHandlerError(code, status) {
  restify.RestError.call(this, {
    restCode: 200,
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

/* server.use(restify.throttle({
  rate: 10,
  burst: 10,
  username: true
}));*/

var engine = new Engine();

server.post(config.path + 'apis/:name', function (req, res, next) {
	req.type = 'apis';
	
	// get context
	context.getContext(req, res, function(ctx) {
		
		ctx.timeoutInterval = 15000;
		
		var startTime = new Date().getTime();

		//get handler
		getHandler(ctx, function() {

			ctx.b = req.body['b'];
			ctx.h = req.headers;
			ctx.q = req.query;

			engine.process(ctx, function(resp) {
				
				resp.data.status.totalTime = new Date().getTime() - startTime;

				res.send(resp.data);
				
				/* process.send({ 
					type: messageCodes.NEW_MESSAGE_FOR_LOG,
					info: (resp.data.status.code == '200') ? 'S' : 'E',
					id: parsedRequest.id, 
					body: resp.log, 
					metadata: parsedRequest.metadata
				}); */

				ctx = null;
			});
			
		}, function(message) {
			// call next with an error saying cannot find handler
			return next(new InvalidHandlerError('200', { referenceid: ctx.id, code: '404', message: message }));
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


server.listen(8082, function () {
    console.log('Cloud code server listening at %s', server.url);
});