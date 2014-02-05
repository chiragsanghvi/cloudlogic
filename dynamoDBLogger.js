var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;
var MessageProcessor = require('./messageProcessor.js'),
messageCodes = require('./ipcMessageCodes.js'),
log = require('./logger.js').log;

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var dynamoDB = new AWS.DynamoDB({ apiVersion: 'latest' });

this.messageProcessor = new MessageProcessor(this);

var self = this;

var getKey = function (message) {
  return message.ctx.acid + '-' + message.ctx.apid + '-' + message.ctx.dpid + '-';
};

var getBody = function(message) {

	var body = {
		req: {
			u: message.ctx.h.host + message.url,
			m: message.ctx.cf.fn
		},
		res: {
			c: message.code,
			s: message.info == 'S' ? 'Successful': 'Error'
		}
	};

	if (message.log && message.log.length > 0) {
		body.log = [];
		message.log.forEach(function(l) {
			body.log.push({
				t: l.time,
				m: l.msg
			});
		});
	};

	return JSON.stringify(body);
};

var logToDynamoDB = function(message) {
	try {
		var shortDescription = ' ';
		if (message.log && message.log.length > 0) {
			shortDescription = message.log[message.log.length - 1].msg.substring(0, 50) + '...';
		}

		var item = {
           id : { "S": message.ctx.id},
           type : { "S": message.ctx.cf.n},
           method : { "S": message.ctx.cf.fn},
           status : { "S": message.info},
           acid : { "S": message.ctx.acid},
           apid : { "S": message.ctx.apid},
           dpid : { "S": message.ctx.dpid},
           code : { "S": message.code.toString() },
           seconds : { "N": message.timeTaken.toString()},
           log : { "S": getBody(message)},
           shortDescription : { "S": shortDescription},
           dateadded : { "N": new Date().getTime().toString() }
        };

		dynamoDB.putItem({
		     "TableName": AWSConfig.baseBucket,
		     "Item": item
		  }, function(err, data) {
		    if (err) {
			  log(err, 'error');
			}
		 });
	} catch(e) { log(e, 'error'); }
};

this.messageProcessor.register(messageCodes.NEW_MESSAGE_FOR_LOG, function(message) {
	logToDynamoDB(message);
});

process.on('message', function(message) {
   self.messageProcessor.getMessageProcessor(message)();
});