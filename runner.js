var vm = require('vm');
var Logger = require('./vmLogger.js');
var posix = require('posix');
var _eval = require('eval');

var Runner = function(options) {

	"use strict";

	this.options = options;
	this.message = options.message;
	this.logger = new Logger();
	this.includedModules = {};
	this.ctx = null;
	this.cb = options.cb || function() {};
	this.sdkVersion = this.message.sdkVersion || this.options.sdkLatestVersion;

	var self = this;
	this.onHandlerCompleted = function(response) {
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

Runner.prototype.getContext = function() {

	"use strict";

    var that = this;

    var loadModule = function(module) {

    	if (that.includedModules[module]) {
			return _eval(that.includedModules[module] , module, that.ctx, false);
		}

		var modulePath = that.options.baseHandlerPath + that.message.dpid + '-v-' + that.message.cf.v + '/' + that.message.cf.n + '/' + module;

		if (require('fs').existsSync(modulePath)) {

			var data = '"use strict";\n\n' + require('fs').readFileSync(modulePath, 'UTF-8');
			
			that.includedModules[module] = _eval(data, module, that.ctx, false);

			return that.includedModules[module];
		}
		return {};
    };

	var ctx = vm.createContext({
		console: { log: this.logger.log },
		Appacitive : this.getSdk(),
		setTimeout: setTimeout
	});

	ctx.require = function(module) {
		return loadModule(module);
	};

	ctx.require.toString = function() {
		return "function () { [native code] }";
	};

	ctx.Appacitive.config.apiBaseUrl = this.options.baseUrl;

	ctx.Appacitive.initialize({ apikey: that.message["ak"], env: that.message["e"], userToken: that.message["ut"], user: that.message["u"], appId: that.message["apid"] });
	
	return ctx;
};

Runner.prototype.run = function() {

	var that = this;

	this.serverDomain = require('domain').create();	

	this.serverDomain.on('error', function(e) {
	    that.sendErrorResponse({statusCode: '500', body: that.getErrorMessage(e), headers: {}});
	    that.serverDomain.dispose();
	});

	this.message.file = '"use strict";\n\n' + this.message.file;

	this.serverDomain.run(function() {
		that.ctx = that.getContext();

		posix.setrlimit('cpu', { soft: that.options.posixTime });

		try { 
			
			that.includedModules[that.message.cf.n + '.js'] = _eval(that.message.file , that.message.cf.n + '.js', that.ctx, false);
			var req = new Request(that.message['b'], that.message['h'], that.message['q']);
		    var res = new Response(that.sendSuccesResponse, that.sendSuccesResponse);

			that.ctx.Appacitive.Cloud.execute( that.message.cf.fn , { request: req, response: res });

		} catch(e) { 
			that.sendErrorResponse({ statusCode: '500', body: that.getErrorMessage(e), headers: {}}); 
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
	posix.setrlimit('cpu', { soft: null });
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
