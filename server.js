var CloudCodeServer = require('./cloudCodeServer.js');
var WatchServer = require('./watchServer.js');
var config = require('./config/contextConfig.js');

//create an instance of cloude code server making it listen on port 8002
var cloudCodeServer = new CloudCodeServer(config.cloudPort);

//create an instance of watch server making it listen on port 8084
var watchServer = new WatchServer(config.watchPort, { cloudCodeServer: cloudCodeServer, port: config.cloudPort });