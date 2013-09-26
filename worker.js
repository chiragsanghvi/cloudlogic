var Worker = function(port) {
    
    "use strict";

    if (!port) port = 8081;

    // create a logger for current worker process
	var log = require('./logger.js').log,
	    validator = require('./requestParser.js'),
	    HttpJSON = require('./jsonWebServer.js'),
	    Processor = require('./processor.js'),
	    MessageProcessor = require('./messageProcessor.js'),
		messageCodes = require('./ipcMessageCodes.js'),
	    getHandler = require('./getHandler.js').getHandler,
	    guid = require('./guid.js'),
	    getContext = require('./getContext.js');

	//create engine object to which requests will be relayed
	var processor = new Processor({ id : guid.newGUID() });

	//create server from jsonWebServer
	var server = new HttpJSON(function (request, response) {
		
		// validate the request
		var parsedRequest = validator.parseRequest(request.json);

		var startTime = new Date().getTime();

		getHandler(parsedRequest.metadata, function (script) {

			log('Dispatching message ' + parsedRequest.id +' to processor...');

			parsedRequest.script = script;
			processor.process(parsedRequest, function (resp) {
				
				log('Got response for ' + parsedRequest.id +' from processor...');
				
				resp.data.status.totalTime = new Date().getTime() - startTime;

				response.statusCode = '200';
				response.end(JSON.stringify(resp.data, null, 2));
				process.send({ 
					type: messageCodes.NEW_MESSAGE_FOR_LOG,
					info: (resp.data.status.code == '200') ? 'S' : 'E',
					id: parsedRequest.id, 
					body: resp.log, 
					metadata: parsedRequest.metadata
				});
				parsedRequest = null;
				script = null;

			});
			
		}, function (message) {

			//if couldn't find handler return status object and log it in s3
			response.statusCode = '200'; 
			response.end(
				JSON.stringify({
					status : { 
						transcationid : parsedRequest.id, 
						code: "404", 
						message: 'Could not find required handler.', 
						additionalmessages: [message]
					}
				})
			);
			process.send({ 
				type: messageCodes.NEW_MESSAGE_FOR_LOG,
				info: 'E',
				id: parsedRequest.id, 
				body: 'Could not find required handler.', 
				metadata: parsedRequest.metadata 
			});
			
			parsedRequest = null;
		});

	});

	server.listen(port);
}

module.exports = Worker;