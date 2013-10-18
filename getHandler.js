var cache = require('./fileCache.js');
var AWS = require('aws-sdk');
var AWSConfig = require('./config/awsS3Config.js').config;
var mkdirp = require('mkdirp');
var fs = require('fs');

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var s3 = new AWS.S3();

var getKey = function (ctx) {
  return ctx.acid + '/' + ctx.apid + '/' + ctx.dpid + '/zip/cloudlogic.zip' ;
};

var getFilename = function(ctx) {
  return './handlers/' + ctx.dpid + '-v-' + ctx.cf.v + '/' + ctx.cf.n + '/'  + ctx.cf.n;
};

var extractToFolder = function(zip, ctx, onSuccess, onError) {
  var dir = './handlers/' + ctx.dpid + '-v-' + ctx.cf.v;
  mkdirp(dir , null, function(err) {
    if (err) {
      onError("Unable to find cloud api");
      return;
    }
    console.log("Made directory");

    fs.writeFile(dir + '/cloudlogic.zip', zip, {}, function(err) {

      if (err) { 
        onError("Unable to find cloud api");
        return;
      }
      console.log("Saved");

      var spawn = require('child_process').spawn,
             unzip = spawn('unzip', ['-o', dir + '/cloudlogic.zip', '-d', dir + '/']);

      unzip.on('close', function (code) {
         fs.readFile(getFilename(ctx) + '.js', 'UTF-8', function(err, data) {
            if (err) { 
              onError("Unable to find cloud api");
              return;
            } 
            onSuccess(data);
         });
      });

    });
  });
};

//fetch file from s3 
var fetchFromS3 = function (ctx, onSuccess, onError) {
  var params = { 
    Bucket: AWSConfig.baseBucket, 
    Key: getKey(ctx)
  };

  console.log(params);
  var data = '';
  var fetched = false;
  try {
      /*s3.getObject(params).on('httpData', function(chunk) { 
         data += chunk;
      }).on('httpDone', function() { 
        if (!fetched) {
          console.log("downloaded");
          extractToFolder(data, ctx, onSuccess, onError);
        }
      }).on('error', function(response) {
         fetched = true;
         onError("Unable to find cloud api");
      }).send();*/

      s3.getObject(params, function(err, data){
          if (err)  onError("Unable to find cloud api");
          else {
            extractToFolder(data.Body, ctx, onSuccess, onError);
          }
      })

    } catch(e) {
      onError("Unable to find cloud api");
    }
};

//get handler for supplied filename, either from cache, else from file system, or from S3
exports.getHandler = function (ctx, onSuccess, onError) {
   var filename = getFilename(ctx);
   //first read from cache
   cache.readFile(filename, function(err, data) {
      //if not in cache/filesystem then call fetchfroms3
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