
var http = require('http');

var noOfrequests = 0

var startTime = new Date().getTime();

var successful = 0;

/*
curl -X POST \
-H "Appacitive-Environment: sandbox" \
-H "Appacitive-Apikey: vwPjrdHzN7735wCoHr0v+3ye7qr1fl37WDCljI0CnUk=" \
-H "Appacitive-User-Auth: VGpYWXVvWHdhYUhWdmh0a0QvdXZNNHliK0dpcW1ZWEg1bFNpdldELzkrRStXeXQxY2UraWJVc1F2R3grcW1Ld09ENnQyNTB0NnZ4dTB3V3NBOFNVa3VhVGthUnlyYWV6L05WSEtMczRmOXkzb243cU0yVWkrY0ZlSnJTS3NKYlRhQVdtQk9FWVFZZmNvMno5cEJCSDN1V3kyUERkd3FuaDNaR1kwSCs5WjBSNkxKQTF0OUlBdHc9PQ==" \
-H "Content-type: application/json" \
-d '{"firstname":"chirag","email":"csanghvi@appacitive.com","username":"csanghvi", "password":"test123!@#"}' \
http://localhost:8082/apis/createUser


curl -X POST \
-H "Content-type: application/json" \
-d '{"name":"chirag","email":"sathley@appacitive.com","tag":"cloudcode","id":"66068483689024268","time":1299999999}' \
http://appid=38005373501833720:e=sandbox:ak=zF5qR4Jic6q8A7p+RyiqPAtZwmGoZ5sTHunGn2tqps8=@localhost:8082/apis/mail

curl -X POST \
-H "Content-type: application/json" \
-d '{"name":"chirag","email":"csanghvi@appacitive.com","tag":"cloudcode","id":"66068483689024268","time":1299999999}' \
http://appid=38005373501833720:e=sandbox:ak=zF5qR4Jic6q8A7p+RyiqPAtZwmGoZ5sTHunGn2tqps8=@cloudcode.appacitive.com/apis/mail


curl -X POST \
 -H "Content-type: application/json" \
 -d '{"firstname":"chirag","email":"csanghvi@appacitive.com","username":"csanghvi", "password":"test123!@#"}' \
 http://appid=38005373501833720:e=sandbox:ak=zF5qR4Jic6q8A7p+RyiqPAtZwmGoZ5sTHunGn2tqps8=:ut=VGpYWXVvWHdhYUhWdmh0a0QvdXZNNHliK0dpcW1ZWEg1bFNpdldELzkrRStXeXQxY2UraWJVc1F2R3grcW1Ld09ENnQyNTB0NnZ4dTB3V3NBOFNVa3VhVGthUnlyYWV6L05WSEtMczRmOXkzb243cU0yVWkrY0ZlSnJTS3NKYlRhQVdtQk9FWVFZZmNvMno5cEJCSDN1V3kyUERkd3FuaDNaR1kwSCs5WjBSNkxKQTF0OUlBdHc9PQ==@localhost:8082/apis/createUser

*/

//var aks = ["9H5zVSyhmNiDp+oJBdYyKuEpOmSAZ68So8cH6aKyatY=", "Gcu0k3j3a2gEhPdqhDz3GxWUZJ5wxxrZSn0k+PwcoFY=", "XCRa+l5/xPs0vwbUE5tSKZ4AbbxiDok4PZ2ff3R8B1c="];
//var pId = ["62722727711211916", "62722887739638159", "62722936469062098"];

var aks = ["zF5qR4Jic6q8A7p+RyiqPAtZwmGoZ5sTHunGn2tqps8="];
var pId = ["66068483689024268"];


http.globalAgent.maxSockets = 40;

var makeRequest = function(v, name, reqNo) {
  var req = {
    "m": "POST",
    "e": "sandbox",
    "ut": "TGplRnkrYXplWnJ3SlZOVEl1eVVxdE5nOVVPcXA5M1U5ZW9CQWYxVDZKT3hBS0tDcEYwanF2dUdUY2N1OE9jNXFTdEd1OU1FSlJadTB3V3NBOFNVa2plZHdJWS8yUjF6aWJSQ2tncEpvMDZlK0xvdUtCMXNpbktVU0RwU1Q4R0UxM2xxRG9Qd09tOU1NYXBNNW9XMlh5eXpPNzYyVk4zK2VPYTAxL2hmVTlJPQ==",
    "b": { "firstname": "chirag", "when": new Date(), "username": "chirag" + Math.random() , "tag":"cloudcode", "time": 12999999, "password":"test123!@#" , "email": "csanghvi@appacitive.com" }
  };

  var options = {
      hostname: 'cloudcode.appacitive.com',
      //hostname: 'localhost',
      //port:8082,
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