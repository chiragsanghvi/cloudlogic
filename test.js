
var http = require('http');

var noOfrequests = 0

var startTime = new Date().getTime();

var successful = 0;

var aks = ["7/EGQ0lZjfI3UhT/rgaNoZQIbEWB85DPmmeE1LMM0U8=", "zF5qR4Jic6q8A7p+RyiqPAtZwmGoZ5sTHunGn2tqps8=", "VveJOI9mWAFMquRbahagTvV4PnNP984EziPFCbcqNxs="];
var pId = ["38176956369469923", "38177050825196170", "38177001963651717"];

http.globalAgent.maxSockets = 30;

var makeRequest = function(v, name, reqNo) {
  var req = {
    "m": "POST",
    "e": "sandbox",
    "b": {"name": "chirag", "tag":"cloudcode"}
  };

  var options = {
    //hostname: 'cloudlogic.cloudapp.net',
      hostname: 'localhost',
      port:8082,
    path: '/apis/' + name,
    method: 'POST',
    headers : {
      'Content-Type' : 'application/json',
      'accept': '*/*'
    }
  };



  req.b.id = pId.shift();
  pId.push(req.b.id);

  req.ak = aks.shift();
  aks.push(req.ak);

  req.transactionid = new Date().getTime()  + "" + reqNo;

  console.log("name: " + name + " id: " + reqNo );

  options.data = JSON.stringify(req);

  var x = http.request(options, function(res) {

    var receivedData = '';

    res.on('data', function(d) {
      receivedData += d;
    });

    res.on('end', function() {

      noOfrequests++;
      var t = new Date().getTime() - startTime;
      if (noOfrequests == 1000 || noOfrequests > 990)
        console.log("Completed " + noOfrequests + " requests in " + t + "ms");
      if (noOfrequests <= 500 && noOfrequests > 450)
        console.log("Completed " +noOfrequests + " requests in " + t + "ms");
      if (noOfrequests == 250)
        console.log("Completed 250 requests in " + t + "ms");
      if (noOfrequests == 100)
        console.log("Completed 100 requests in " + t + "ms");
      if (noOfrequests == 50)
        console.log("Completed 50 requests in " + t + "ms");
      
      if (name != 'code' && name != 'get') {
        console.log(t + "ms, " + name + " => \n\n" + receivedData + "\n");
      } else {
        console.log(t + "ms, " + name + " => \n\n" + receivedData + "\n");
        ++successful
      }
    });
  }); 

  x.write(options.data);
  x.end();

  x.on('error', function(err) {
    console.log(err);
  });
};

process.on('exit', function() {
  console.log("successful: " + successful);
  console.log("failed: " + (noOfrequests - successful));
});

var reqNo = 1;
var names = ["code","get","error"];
for (var i = 1 ; i <= 1 ; i = i + 1) {
  var version = i;
  for (var j = 1 ; j <= 10 ; j = j + 1) {
    setTimeout(function() {
      console.log("========Executing sequence " + (reqNo/10) + "======")
      for (var k = 1 ; k <= 10; k = k + 1) {
        var name = names.shift();
        makeRequest(1, name, reqNo++);
        names.push(name);
      }
    }, j * 100);
  }
}