var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var s3 = new AWS.S3();

var MessageProcessor = require('./messageProcessor.js'),
messageCodes = require('./ipcMessageCodes.js'),
log = require('./logger.js').log;

var self = this;

this.messageProcessor = new MessageProcessor(this);

var getKey = function (message) {
  return message.ctx.acid + '/' + message.ctx.apid + '/' + message.ctx.dpid + '/' + message.ctx.cf.n + '/logs/'  + message.info + message.ctx.id ;
};

var getBody = function(message) {

	var body = 'Request URL: ' + message.ctx.h.host + message.url + '\nMethod: "' + message.ctx.cf.fn + '"\nBody:\n';

	try {
		body += ""  + JSON.stringify(message.ctx.b, undefined, 3);
	} catch(e) {
		body += message.ctx.b; 
	}

	body += '\nResponse:\n';
	try {
		body += ""  + JSON.stringify(message.resp, undefined, 3);
	} catch(e) {
		body += message.resp; 
	}

	body += '\nDebug Log:\n' + message.log;

	return body;
};

this.messageProcessor.register(messageCodes.NEW_MESSAGE_FOR_LOG, function(message) {
	
	// upload message to s3 as log  
	try {
		var params = { Bucket: AWSConfig.baseBucket, Key: getKey(message), Body: getBody(message) };
		s3.putObject(params, function(err, data) {
			if (err) {
			  log(err, 'error');
			}
			params = null;
		});
	} catch(e) { log(e, 'error'); }
});

process.on('message', function(message) {
   self.messageProcessor.getMessageProcessor(message)();
});

