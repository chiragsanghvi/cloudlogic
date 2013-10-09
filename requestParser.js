var restify = require('restify');
var util = require('util');

function InvalidRequestError(message, code) {
  restify.RestError.call(this, {
    restCode: code,
    statusCode: code,
    constructorOpt: InvalidRequestError,
    body: {
    	status : {
	    	referenceid: null,
	    	code: code,
	    	message: message
	    },
	    body: null
    }
  });
  this.name = 'InvalidRequestError';
};

util.inherits(InvalidRequestError, restify.RestError);

module.exports = function(options) {

	if (typeof options != "object") options = {};
	
	return function(req, res, next) {
        
		if (req.contentType() !== 'application/json' || !req.body) {
			next(new InvalidRequestError("Content needs to be in application/json format", '400'));
			return;
		}

		if (!req.body["ak"] || typeof req.body["ak"] != 'string' || (!req.body["ak"].length)) {
			if (!req.body["as"] || typeof req.body["as"] != 'string' || (!req.body["as"].length)) {
				next(new InvalidRequestError("No ApiKey or ApiSession specified", '400'));
				return;
			}
		}

		if (!req.body["e"] || typeof req.body["e"] != 'string' || (!req.body["e"].length) || ((req.body["e"].toLowerCase().indexOf('sandbox') == -1) && (req.body["e"].toLowerCase().indexOf('live') == -1))) {
			next(new InvalidRequestError("No Environment specified", '400'));
			return;
		}

		next();
	};
};