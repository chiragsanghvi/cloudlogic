var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

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

exports.getDomains = function(cb) {
	sDB.listDomains({
		MaxNumberOfDomains: 10
	}, function(err, data) {
		if (err) {
			console.log(err);
			cb([]);
			return;
		}
		cb(data.DomainNames);
	});
};

exports.deleteDomain = function(name, cb) {
	sDB.deleteDomain({
		DomainName: name
	}, function(err, data) {
		if (err) {
			console.log(err);
			cb(false);
			return;
		}
		cb(true);
	});
};

exports.createDomain = function(cb) {
	sDB.createDomain({
		DomainName: AWSConfig.baseBucket
	}, function(err, data) {
		if (err) {
			console.log(err);
			cb(false);
			return;
		}
		cb(true);
	});
};


exports.getLog = function(name, cb) {
	sDB.getAttributes({
		DomainName: AWSConfig.baseBucket,
		ItemName: name
	}, function(err, data){
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