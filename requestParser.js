var customError = require('./customError.js');
module.exports = function(options) {

	if (typeof options != "object") options = {};
	
	return function(req, res, next) {

		if (req.method.toLowerCase() == 'get') return next();
        
		if (req.authorization.basic) {
			if (!req.authorization.basic.ak) {
				return next(new customError("400", "No ApiKey specified"));
			}

			if(!req.authorization.basic["e"]) {
				return next(new customError("400", "No Environment specified"));
			}
			
		} else {

			req.authorization = { basic : {} };

			if (req.contentType() == 'text/plain' || req.query.ua == 'ie') {
					
				if (!req.body) {
					return next(new customError("400", "Invalid request"));
				}

				if (!req.body["ak"] || typeof req.body["ak"] !== 'string' || (!req.body["ak"].length)) {
					return next(new customError("400", "No ApiKey specified"));
				}

				req.authorization.basic.ak = req.body["ak"];

				if (!req.body["e"] || typeof req.body["e"] !== 'string' || (!req.body["e"].length) || ((req.body["e"].toLowerCase().indexOf('sandbox') === -1) && (req.body["e"].toLowerCase().indexOf('live') === -1))) {
					return next(new customError("400", "No Environment specified"));
				}

				req.authorization.basic["e"] = req.body["e"];

				if (req.body["ut"] && typeof req.body["ut"] === 'string' && req.body["ut"].length) {
					req.authorization.basic["ut"] = req.body["ut"];
				}

				req.body = req.body["b"];

			} else { 
				
				var ak = req.headers['appacitive-apikey'];

				if (!ak  || typeof ak != 'string' || (!ak.length)) {
					return next(new customError("400", "No ApiKey specified"));
				}

				req.authorization.basic.ak = ak;

				var e  = req.headers['appacitive-environment']

				if (!e  || typeof e != 'string' || ((!e.length) || (e.toLowerCase().indexOf('sandbox') === -1) && (e.toLowerCase().indexOf('live') === -1))) {
					return next(new customError("400", "No Environment specified"));
				}

				req.authorization.basic["e"] = e;

				var ut = req.headers['appacitive-user-auth'];

				if (!ut  || typeof ut != 'string' || (!ut.length)) {
					req.authorization.basic["ut"] = ut;
				}

			}
		}
		return next();
	};
};