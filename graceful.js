var exec = require('child_process').exec;

var server = null;
var signalReceived = false;

process.on('SIGTERM', function () {
  console.log("Got sigterm signal");
  if (server != null) {
    server.close();
  }
  signalReceived = true;
});

exports.stop = function(_server, port, timeout) {
  port    = port || 8080;
  timeout = timeout || 5;
  server  = _server;

  exec('fuser -n tcp ' + port + ' -k -TERM', 
    function (error) {
      function attemptSocket(noretry) {
        if (signalReceived) {
          return;
        }

        try {
          console.log("Starting server");
          server.listen(port);
          server.gracefulShutdown = false;
        } catch (e) {
          console.log(e);
          if (e.code == 'EADDRINUSE' && !noretry) {
            setTimeout(attemptSocket, timeout);
          }
        }
      }

      attemptSocket(error !== null);
    });
};