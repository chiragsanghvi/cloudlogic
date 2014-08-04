var restify = require('restify');
var config = require('./config/contextConfig.js');
var dDBClient = require('./dynamoDBClient.js');
var graceful = require('./graceful.js');

/*
 * A watch server which will be used for housekeeping, stats polling and flushing message queue and for shuttung down the server gracefully
 */
module.exports = function(port, options) {

	options = options || { port: 8082 };

	var engine = options.cloudCodeServer.engine;

	var cloudCodeServer = options.cloudCodeServer;

	var watchServer = restify.createServer();
	watchServer.use(restify.acceptParser(watchServer.acceptable));
	watchServer.use(restify.queryParser({ mapParams: false }));
	watchServer.use(restify.gzipResponse());
	watchServer.use(restify.bodyParser({ mapParams: false, rejectUnknown: false }));

	watchServer.get(config.path + 'stats', function (req, res, next) {
		var stats = engine.getStats();
		stats.numConnections = cloudCodeServer.server.connections;
		res.send(stats);
	});

	watchServer.get(config.path + 'messages', function (req, res, next) {
		res.send(engine.getMessages());
	});

	watchServer.get(config.path + 'flush', function (req, res, next) {
		engine.flush();	
		res.send({});
	});

	watchServer.get(config.path + 'shutdown', function (req, res, next) {
		cloudCodeServer.gracefulShutdown = true;
		console.log("\n\n\n=======Received close signal, shutting down gracefully.=======\n\n\n");
	  	graceful.stop(cloudCodeServer, options.port);
	  	res.send("Closing server");
	});

	watchServer.get(config.path + 'log/:logId', function (req, res, next) {
		dDBClient.getLog(req.params.logId, function(data) {
			res.send(data);
		});
	});

	watchServer.get(config.path + 'logs/:dpId', function (req, res, next) {
		dDBClient.listLogs(req.params.dpId, function(data) {
			res.send(data);
		});
	});

	watchServer.listen(port, function () {
	    console.log('Watch server listening at %s', watchServer.url);
	});

	return watchServer;
};