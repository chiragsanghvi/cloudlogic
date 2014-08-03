var vm = require('vm');
var Logger = require('./vmLogger.js');
var posix = require('posix');
var _eval = require('eval');
var Timeout = require('./timeout.js');
//var allowedModules = require('');

var TimeoutException = function () { this.message = "Execution timed out"; this.code = "508"; };
var MethodNotSupportedException = function(method) { this.message = method.toUpperCase() + '_NOT_SUPPORTED'; this.code = "500"; };
var FunctionConstructorException = function(execCode) { this.message = "function constructor with code: " + execCode; this.code = "500"; };
	
var Runner = function(options) {

	"use strict";

	this.options = options;
	this.message = options.message;
	this.logger = new Logger();
	this.includedModules = {};
	this.ctx = null;
	this.cb = options.cb || function() {};
	this.sdkVersion = this.message.sdkVersion || this.options.sdkLatestVersion;
	this.completed = false;
	var self = this;

	this.onHandlerCompleted = function(response) {
		if (self.completed) return;
		self.completed = true;
		self.cb(self.message.id, response);
	};
	
	this.sendErrorResponse = function(error) {
		var resp = {
			data: error.body || '',
			code: error.statusCode, 
			log: self.logger.getLogs(),
			headers: error.headers
		};
		self.onHandlerCompleted(resp);
	};

	this.sendSuccesResponse = function(response) {
		var resp = {
			data: response.body || '',
			code: response.statusCode, 
			log: self.logger.getLogs(),
			headers: response.headers
		};
		self.onHandlerCompleted(resp);
	};

};

var Request = function(body, headers, query) {
	this.body = body;
	this.headers = headers;
	this.query = query;
};

var Response = function(success, error) {

	"use strict";

	this.headers = {};
	
	this.statusCode = '';

	this.success = function (data) {
    	data = data || '';
    	var resp = {
        	statusCode: this.statusCode || 200,
        	body: data || '',
       		headers: this.headers || {}
       	};

        success(resp);
        return;
    };

    this.success.toString = function() { return "function () { [native code] }"; }

    this.error = function(msg) { 
      	msg = msg || "Error";

      	var err = {
      		statusCode: this.statusCode || 500,
        	body: msg || '',
        	headers: this.headers || {}
        };

      	error(err);
      	return;
    };

    this.error.toString = function() { return "function () { [native code] }"; }
};

Runner.prototype.getSdk = function () {

	loadTime = new Date().getTime();

	var path = '.' + this.options.sdkPath + this.sdkVersion + '.js';

	delete require.cache[require.resolve(path)];

	var Appacitive = require(path);
	delete require.cache[require.resolve(path)];

	loadTime = new Date().getTime() - loadTime;

	return Appacitive;
};

Runner.prototype.setJail = function(env, code) {
	env['eval'] = stopExecuting('eval');
	//env['setTimeout'] = stopExecuting('setTimeout');
	env['setInterval'] = stopExecuting('setInterval');
	env['Function'] = getBlockedFunctionConstructor();

	//set dafault values
	var options = { timeout: 4000 };

	wrapTheLoops(/while\(.+\).+\{/);
	wrapTheLoops(/for\(.+\).+\{/);
	
	function wrapTheLoops(regex) {

		var timeoutCount = 0;
		var whiles = code.match(regex);

		if (whiles) {

			whiles.forEach(function(block) {

				timeoutCount++;

				var replacement = block + ' if(_timeout' + timeoutCount + '.exceeded()) {break;} '
				code = code.replace(block, replacement);

				var t = new Timeout(options.timeout);
				t.onTimeout(function() {
					throw new TimeoutException();
				});
				env['_timeout' + timeoutCount] = t;
			});
		}
	}

	/**
		This will prevent 
	*/
	function stopExecuting(method) {

		return function() {
			throw new MethodNotSupportedException(method);
		}
	}

	/**
		This will blocks the usage of Function Construction
	*/
	function getBlockedFunctionConstructor() {

		return function (execCode) {
			throw new Function_Constructor_detected(execCode);
		}
	}

	return code;
};

Runner.prototype.getContext = function() {

	"use strict";

    var that = this;

    var getRequireScope = function() {
    	return function(module) {

	    	if (that.includedModules[module]) {
				return _eval(that.includedModules[module] , module, that.ctx, false);
			}

			var modulePath = that.options.baseHandlerPath + that.message.dpid + '-v-' + that.message.cf.v + '/' + that.message.cf.n + '/' + module;

			if (require('fs').existsSync(modulePath)) {

				var data = '"use strict";' + require('fs').readFileSync(modulePath, 'UTF-8');
				
				that.includedModules[module] = _eval(data, module, that.ctx, false);

				return that.includedModules[module];
			}
			return {};
	    };
    };

    var env = {
    	console: { log: this.logger.log },
		Appacitive: this.getSdk(),
		require: getRequireScope(),
		setTimeout: setTimeout
    };

    this.message.file = this.setJail(env, this.message.file);

	var ctx = vm.createContext(env);

	ctx.require.toString = function() {
		return "function () { [native code] }";
	};

	ctx.Appacitive.config.apiBaseUrl = this.options.baseUrl;

	ctx.Appacitive.initialize({ apikey: that.message["ak"], env: that.message["e"], userToken: that.message["ut"], user: that.message["u"], appId: that.message["apid"] });
	
	return ctx;
};

Runner.prototype.getErrorResponse = function(e) {
	var response = { statusCode: '500' , headers: {}, body : e.message};
	if (e instanceof TimeoutException) {
		response.statusCode = '508'
		response.body =  e.message;
	} else if ((e instanceof MethodNotSupportedException) || (e instanceof FunctionConstructorException)) {
		response.body =  e.message;
	} else {
		var body = this.getErrorMessage(e)
		response.body = body;
	}

	return response;
};


Runner.prototype.run = function() {

	var that = this;

	this.serverDomain = require('domain').create();	

	this.serverDomain.on('error', function(e) {
		var response = that.getErrorResponse(e);
		that.sendErrorResponse(response);
	    that.serverDomain.dispose();
	});

	this.message.file = '"use strict";' + this.message.file;

	this.serverDomain.run(function() {
		that.ctx = that.getContext();

		//posix.setrlimit('cpu', { soft: that.options.posixTime });

		try { 
			
			that.includedModules[that.message.cf.n + '.js'] = _eval(that.message.file , that.message.cf.n + '.js', that.ctx, false);
			var req = new Request(that.message['b'], that.message['h'], that.message['q']);
		    var res = new Response(that.sendSuccesResponse, that.sendSuccesResponse);

			that.ctx.Appacitive.Cloud.execute( that.message.cf.fn , { request: req, response: res });

		} catch(e) { 
			that.sendErrorResponse(that.getErrorResponse(e));
		}
	});
};

Runner.prototype.getErrorMessage = function(e) {

	if (!e.stack && e.code) return e.message;

	var stack = e.stack;
	var lines = stack.split('\n');

	if (lines.length <= 1) return e.toString();
	else {
		var msg = lines[0].toString();
		for (var i = 1; i < lines.length; i = i + 1) {
			var set = false;
			for (var name in this.includedModules) {
				if (lines[i].indexOf(name) != -1) {
					msg += '\n' + lines[i];
					break;
				}
			}
		}
	  	return msg;
	}
};

Runner.prototype.dispose = function() {
	//posix.setrlimit('cpu', { soft: null });

	if (this.ctx) {
		for (var prop in this.ctx) {
			this.ctx[prop] = null;
		}
	}
	this.ctx = null
	this.options = null;
	this.logStorage = null;
	this.message = null;
	
	if (this.includedModules) {
		for (var mod in this.includedModules) {
			this.includedModules[mod] = null;
		}
	}

	if (this.serverDomain && typeof this.serverDomain.dispose === 'function') this.serverDomain.dispose();
};

module.exports = Runner;
