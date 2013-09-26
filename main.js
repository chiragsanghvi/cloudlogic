var cluster = require('cluster');

process.setMaxListeners(0);

//Code to be executed in master case
if (cluster.isMaster) {
  var Master = require('./master.js');
  new Master();
} else {
  var Worker = require('./worker.js');
  new Worker();
}
