var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;
var MessageProcessor = require('./messageProcessor.js'),
messageCodes = require('./ipcMessageCodes.js'),
log = require('./logger.js').log;

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var dynamoDB = new AWS.DynamoDB({ apiVersion: 'latest' });

exports.getLog = function(id, cb) {
	dynamoDB.query({
		"TableName": AWSConfig.baseBucket,
		"Limit" : 20,
		"KeyConditions" : "id" 
		// Need to check this
	}, function(err, data) {
		if (err) {
			console.log(err);
			cb(null);
			return;
		}
		cb(data);
	});
};

exports.listLogs = function(dpid, cb) {
	sDB.select({
		SelectExpression: "select * from " + AWSConfig.baseBucket + " where dpid = '" + dpid + "' and updateddate is not null order by updateddate desc limit 1000"
	}, function(err, data) {
		if (err) {
			console.log(err);
			cb([]);
			return;
		}
		cb(data);
	});
};