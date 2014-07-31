
var http = require('http');

var noOfrequests = 0

var startTime = new Date().getTime();

var successful = 0;

//var aks = ["9H5zVSyhmNiDp+oJBdYyKuEpOmSAZ68So8cH6aKyatY=", "Gcu0k3j3a2gEhPdqhDz3GxWUZJ5wxxrZSn0k+PwcoFY=", "XCRa+l5/xPs0vwbUE5tSKZ4AbbxiDok4PZ2ff3R8B1c="];
//var pId = ["62722727711211916", "62722887739638159", "62722936469062098"];

var aks = ["ryp6TW6y4ijGkteNKEVNfC9lntiOVPhQJuyZ8pSO1Os="];
var pId = ["62730365622682108"];


http.globalAgent.maxSockets = 40;

var makeRequest = function(v, name, reqNo) {
  var req = {
    "m": "POST",
    "e": "sandbox",
    "ut": "UjhkSjdzZWJZNElUQ2FZb2pJanIwVXBXS012elVsaE8xVTJTYUhuSEJsa25RN1psOWdCZGJYcEFKSkR3TXp3T3F1UlhRSWpjVDlKdTB3V3NBOFNVa3ZCYmd3Z1JXWkNYcWRXS2RQUnZzcWRiK3JiRHczYVorNVc1RUFQTjJPYkc5dFFHQ0NPVVFMV3pXT0Q3UkZEY2dONWNGdGM2R2gxUw==",
    "b": { "firstname": "chirag", "when": new Date(), "username": "chirag" + Math.random() , "tag":"cloudcode", "time": 12999999, "password":"test123!@#" , "email": "csanghvi@appacitive.com" }
  };

  var options = {
    //hostname: 'cloudlogic.cloudapp.net',
      hostname: 'localhost',
      port:8082,
      path: '/apis/' + name,
      method: 'POST',
      headers : {
        'Content-Type' : 'text/plain',
        'accept': '*/*'
      }
  };



  req.b.id = pId.shift();
  pId.push(req.b.id);

  req.ak = aks.shift();
  aks.push(req.ak);

  console.log(req);

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
      
       console.log(t + "ms"  + " => " + name + ' : code: '  + res.statusCode + " : " + receivedData + " :" + res.headers['executiontime']+ "\n");
       
      if (name != 'addEvent' && name != 'getEvent' && name!= 'mail' && name != 'createUser' && name != 'timed' && name != 'for') {
        //console.log(t + "ms, " + name + " => \n\n" + receivedData + "\n");
      } else {
        //console.log(t + "ms, " + name + " => \n\n" + receivedData + "\n");
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
//var names = ["timed","for"]
var names = ["timed","addEvent","getEvent","error","while","invalidbody","for", "mail", "createUser"];
for (var i = 1 ; i <= 1 ; i = i + 1) {
  var version = i;
  for (var j = 1 ; j <= 1 ; j = j + 1) {
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