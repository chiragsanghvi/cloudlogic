var cache = require('./fileCache.js');
var AWS = require('aws-sdk');
var mkdirp = require('mkdirp');
var fs = require('fs');
var AWSConfig = require('./config/awsS3Config.js').config;
var config = require('./config/processorConfig.js');

AWS.config.update({ accessKeyId: AWSConfig.accessKeyId, secretAccessKey: AWSConfig.secretAccessKey, region: AWSConfig.region });

var s3 = new AWS.S3();

//get s3 Key for zip package for deployment
var getKey = function (ctx) {
  return ctx.acid + '/' + ctx.apid + '/' + ctx.dpid + '/' + config.zipFileName;
};

//get filename on filesystem for the file
var getFilename = function(ctx) {
  return config.baseHandlerPath + ctx.dpid + '-v-' + ctx.cf.v + '/' + ctx.cf.n + '/'  + ctx.cf.n;
};

//extract zip file to specified directory, if doesn't exists then create the directory
var extractToFolder = function(zip, ctx, onSuccess, onError) {
  var dir = config.baseHandlerPath + ctx.dpid + '-v-' + ctx.cf.v;

  mkdirp(dir , null, function(err) {
    
    if (err) {
      onError("Unable to find cloud api files");
      return;
    }
    console.log("Made directory");

    //write the zip file to the created directory
    fs.writeFile(dir + '/cloudlogic.zip', zip, {}, function(err) {

      if (err) { 
        onError("Unable to find cloud api  files");
        return;
      }
      console.log("Saved");

      //unzip the zip file in the created directory
      var spawn = require('child_process').spawn,
             unzip = spawn('unzip', ['-o', dir + '/' + config.zipFileName, '-d', dir + '/']);

      unzip.on('close', function (code) {
          
        console.log("unzipped file");

        console.log(getFilename(ctx));

        //read main handler file(apis.js or taks.js from their folder) from filesystem
        fs.readFile(getFilename(ctx) + '.js', 'UTF-8', function(err, data) {
          if (err) { 
            onError("Unable to find cloud api files");
            return;
          }
          //return read file
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

  var s3Domain = require('domain').create();
  
  s3Domain.on('error', function(e) {
    onError("Unable to find cloud api files");
    serverDomain.dispose();
  });

  s3Domain.run(function() {
    s3.getObject(params, function(err, data){
      if (err)  onError("Unable to find cloud api files");
      else {
        extractToFolder(data.Body, ctx, onSuccess, onError);
      }
    });
  });
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