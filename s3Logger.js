var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;
var MessageProcessor = require('./messageProcessor.js'),
messageCodes = require('./ipcMessageCodes.js'),
log = require('./logger.js').log;

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var s3 = new AWS.S3();
var sDB = new AWS.SimpleDB({
	accessKeyId: AWSConfig.accessKeyId,
	secretAccessKey: AWSConfig.secretAccessKey, 
	region: AWSConfig.region,
	maxRetries: 1,
	computeChecksums: false,
	sslEnabled: false,
	apiVersion: 'latest',
	paramValidation: false
});
this.messageProcessor = new MessageProcessor(this);

var self = this;


var getKey = function (message) {
  return message.ctx.acid + '/' + message.ctx.apid + '/' + message.ctx.dpid + '/' + message.ctx.cf.n + '/logs/'  + message.ctx.id + '.json';
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

	return JSON.stringify(body, undefined, 3);
};

var logToSimpleDB = function(message) {
	var shortDescription = ' ';
	if (message.log && message.log.length > 0) {
		shortDescription = message.log[message.log.length - 1].msg.substring(0, 50) + '...';
	}

	var items = [
		{ Name: 'id', Value: message.ctx.id }, 
		{ Name: 'type', Value: message.ctx.cf.n }, 
		{ Name: 'method', Value: message.ctx.cf.fn }, 
		{ Name: 'status',Value: message.info }, 
		{ Name: 'acid', Value: message.ctx.acid }, 
		{ Name: 'apid', Value: message.ctx.apid }, 
		{ Name: 'dpid', Value: message.ctx.dpid }, 
		{ Name: 'code', Value: message.code }, 
		{ Name: 'seconds', Value: message.timeTaken },
		{ Name: 'message', Value: shortDescription },
		{ Name: 'updateddate', Value: new Date().toJSON() }
	];

	sDB.putAttributes({
		DomainName: AWSConfig.baseBucket,
		ItemName: message.ctx.id,
		Attributes: items
	}, function(err, data) {
		if (err) {
		  log(err, 'error');
		}
		items = null;
	}) 
};

var logToS3 = function(message) {
	// upload message to s3 as log  
	try {
		var params = { Bucket: AWSConfig.baseBucket, Key: getKey(message), Body: getBody(message) };
		s3.putObject(params, function(err, data) {
			params = null;
			if (err) {
			  log(err, 'error');
			  return;
			}
			//insert an index file entry in simpledb
			logToSimpleDB(message);
		});
	} catch(e) { log(e, 'error'); }
};

this.messageProcessor.register(messageCodes.NEW_MESSAGE_FOR_LOG, function(message) {
	logToS3(message);
});

process.on('message', function(message) {
   self.messageProcessor.getMessageProcessor(message)();
});

