var cache = require('./fileCache.js');
var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var s3 = new AWS.S3();

var getKey = function (ctx) {
  return ctx.acid + '/' + ctx.apid + '/' + ctx.dpid + '/apis/' + ctx.cf.n + '.js' ;
};

//fetch file from s3 
var fetchFromS3 = function (ctx, onSuccess, onError) {
  var params = { 
    Bucket: AWSConfig.baseBucket, 
    Key: getKey(ctx)
  };
  var data = '';
  var fetched = false;
  try {
      s3.getObject(params).on('httpData', function(chunk) { 
         data += chunk;
      }).on('httpDone', function() { 
        if (!fetched) {
          onSuccess(data);
        }
      }).on('error', function(response) {
         fetched = true;
         onError("Unable to find cloud api");
      }).send();
    } catch(e) {
      onError("Unable to find cloud api");
    }
};

//get handler for supplied filename, either from cache, else from file system, or from S3
exports.getHandler = function (ctx, onSuccess, onError) {
   var filename = ctx.cf.n  + '-v-' + ctx.cf.v;
   //first read from cache
   cache.readFile(filename, function(err, data) {
      //if not in cache/filesystem then fetchfroms3
      if (err) {
        fetchFromS3(ctx, function(file) {
          
          //write it on cache 
          cache.replaceFile(ctx.cf.n, file, ctx.cf.v);

          //write it in ctx
          ctx.file = file;

          //invoke onsuccess and then write it onto disk
          onSuccess();
          
          //write it on file system
          cache.writeFile(ctx.cf.n, file, ctx.cf.v);
        
        }, function (message) {
          onError(message);
        });
      } else {
        //write it in ctx
        ctx.file = data;

        onSuccess();
      }
   });
};