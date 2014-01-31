var restify = require('restify');
var Engine = require('./engine.js');
var CloudCodeServer = require('./cloudCodeServer');
var graceful = require('./graceful.js');
var engine = new Engine();
var config = require('./config/contextConfig.js');
var sDBClient = require('./simpleDBClient.js');

//create an instance of server making it listen on port 8002
var server = new CloudCodeServer(8082, engine);

/*
 * A watch server which will be used for housekeeping, stats polling and flushing message queue and for shuttung down the server gracefully
 */
var watchServer = restify.createServer();
watchServer.use(restify.acceptParser(server.acceptable));
watchServer.use(restify.queryParser({ mapParams: false }));
watchServer.use(restify.gzipResponse());
watchServer.use(restify.bodyParser({ mapParams: false, rejectUnknown: false }));

watchServer.get(config.path + 'stats', function (req, res, next) {
	var stats = engine.getStats();
	stats.numConnections = server.server.connections;
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
	server.gracefulShutdown = true;
	console.log("\n\n\n=======Received close signal, shutting down gracefully.=======\n\n\n");
  	graceful.stop(server, 8082);
  	res.send("Closing server");
});

watchServer.get(config.path + 'log/:logId', function (req, res, next) {
	sDBClient.getLog(req.params.logId, function(data) {
		res.send(data);
	});
});

watchServer.get(config.path + 'logs/:dpId', function (req, res, next) {
	sDBClient.listLogs(req.params.dpId, function(data) {
		res.send(data);
	});
});

watchServer.listen(8084, function () {
    console.log('Watch server listening at %s', watchServer.url);
});