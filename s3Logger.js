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
	return message.metadata.accountid + '/' + message.metadata.applicationid + '/' + message.metadata.deploymentid + '/logs/' + message.info + message.id;
};

this.messageProcessor.register(messageCodes.NEW_MESSAGE_FOR_LOG, function(message) {
	return;
	// upload message to s3 as log  
	try {
		var params = { Bucket: AWSConfig.baseBucket, Key: getKey(message), Body: message.body };
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

