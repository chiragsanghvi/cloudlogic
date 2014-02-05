var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;
var MessageProcessor = require('./messageProcessor.js'),
messageCodes = require('./ipcMessageCodes.js'),
log = require('./logger.js').log;

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var dynamoDB = new AWS.DynamoDB({ apiVersion: 'latest' });

exports.getLog = function(id, cb) {
	var params = {
    	TableName: AWSConfig.baseBucket ,
    	KeyConditions : {
	        id : {
	            AttributeValueList : [
	              {
	                S :  id
	              }
	            ],
	            ComparisonOperator : "EQ"
	        }
	    },
	    Limit: 1
	};

	dynamoDB.query(params, function(err, data) {
		if (err) {
			console.log(err);
			cb(null);
			return;
		}
	 	cb(data);
	});
};

exports.listLogs = function(dpid, cb) {
	var params = {
    	TableName: AWSConfig.baseBucket ,
    	IndexName : 'dpid',
    	KeyConditions : {
	        dpid : {
	            AttributeValueList : [
	              {
	                S :  dpid
	              }
	            ],
	            ComparisonOperator : "EQ"
	        }
	    },
	    Limit: 20 
	};

	dynamoDB.query(params, function(err, data) {
		if (err) {
			console.log(err);
			cb(null);
			return;
		}
		cb(data);
	});
};