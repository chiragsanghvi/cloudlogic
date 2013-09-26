var http = require('http');

var JsonServer = function(handler) {

	// the internal http server
	var _server = http.createServer(function (request, response) {

		var parsedRequest = null, requestBody = '';

		response.setHeader('Content-Type', 'application/javascript');
		request.setEncoding('utf8');

		request.on('data', function(chunkedData) {
			requestBody += chunkedData;
		});

		// on receiving the completed request
		request.on('end', function() {
			try {
				if (requestBody.trim().length === 0) throw new Error("No request body found");
				request.json = JSON.parse(requestBody);
				handler(request, response);
			} catch (e) {
				response.statusCode = '200'; 
				response.end(JSON.stringify({ code: "400", message: e.message || 'Broken JSON encountered in request body.' , stack :e.stack }));
				return;
			}
		});

	});

	this.listen = function(port) {
		_server.listen(port);
	};

	this.close = function() {
		_server.close();
	}

};

module.exports = JsonServer;