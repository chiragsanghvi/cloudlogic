var customError = require('./customError.js');
module.exports = function(options) {

	if (typeof options != "object") options = {};
	
	return function(req, res, next) {

		if (req.method.toLowerCase() == 'get') return next();
        
		if (req.contentType() !== 'application/json' || !req.body) {
			next(new customError("400", "Content needs to be in application/json format"));
			return;
		}

		if (!req.body["ak"] || typeof req.body["ak"] !== 'string' || (!req.body["ak"].length)) {
			if (!req.body["as"] || typeof req.body["as"] !== 'string' || (!req.body["as"].length)) {
				next(new customError("400", "No ApiKey or ApiSession specified"));
				return;
			}
		}

		if (!req.body["e"] || typeof req.body["e"] !== 'string' || (!req.body["e"].length) || ((req.body["e"].toLowerCase().indexOf('sandbox') === -1) && (req.body["e"].toLowerCase().indexOf('live') === -1))) {
			next(new customError("400", "No Environment specified"));
			return;
		}

		next();
	};
};