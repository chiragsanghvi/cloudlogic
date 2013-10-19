var config = require('./config/contextConfig.js'); 
var Agent = require('agentkeepalive'); 
var url = require('url'); 
var http = require('http');
var customError = require('./customError.js');

var keepaliveAgent = new Agent({
  maxSockets: 30,
  maxKeepAliveRequests: 0, // max requests per keepalive socket, default is 0, no limit.
  maxKeepAliveTime: 10000 // keepalive for 10 seconds
});

var send = function(request) {
    var reqUrl = url.parse(request.url);

    var options = {
       hostname: reqUrl.host,
       path: reqUrl.path,
       method: 'GET',
       headers : {
         'accept': '*/*'
       },
       agent: keepaliveAgent    
   };

    for(var x in request.headers)
        options.headers[x] = request.headers[x];

    var req = http.request(options, function(res) {

        res.setEncoding('utf8');

        var receivedData = '';

        res.on('data', function(d) {
           receivedData += d;
        });

        res.on('end', function() {
           if ((res.statusCode >= 200 && res.statusCode < 300) || res.statusCode == 304) {
                var response = receivedData;
                try {
                    var contentType = res.headers['Content-Type'] || res.headers['content-type'];
                    if (contentType.toLowerCase() == 'application/json' ||  contentType.toLowerCase() == 'application/javascript' || contentType.toLowerCase() == 'application/json; charset=utf-8;') {
                        var jData = response;
                        if (jData[0] != "{") {
                            jData = jData.substr(1, jData.length - 1);
                        }
                        response = JSON.parse(jData);
                    }
                    request.onSuccess(response, this);
                } catch(e) {
                  request.onSuccess(receivedData, this);
                }
            } else {
                request.onError({code: res.statusCode , message: this.statusText }, this);
            }
        });

    });

    req.end();

    req.on('error', function(err) {
      request.onError({ code: err.code, message: err.message }, req);
    });

};


exports.getContext = function(req, res, onSuccess, next) {

    var cb = function(response) {
        if (response && response.status && response.status.code >= '200' && response.status.code < '300') {
            response.id = response.status.referenceid;

            if (req.body['ak']) response['ak'] = req.body['ak'];
            else response['as'] = req.body['as'];

            response['e'] = req.body['e'];
            response['ut'] = req.body['ut'];
            response.cf.fn = req.params.name;

            delete response.status;
            onSuccess(response, this);
        } else {
            response = response || { status: { code: '404', message: 'Server not found' }};
            next(new customError("404", response.status.message));
        }
    };

    /*cb({
        status: {
            code: '200',
            referenceid: req.body["transactionid"]
        },
        acid:'36802269955621123',
        apid: '36802348064047365',
        //dpid: '36802353201021280',
        dpid: req.body["b"]["id"],
        cf: {
            n: 'apis',
            v: 'WK_mMEjesryxIFY5HIB27tW2T9hgkcoE',
            fn: req.params.name
        },
        u: null
    });
    return;
    */

    var ctxReq = {
        url: config.baseUrl + 'cloudlogic/' + req.type + '/' + (req.type == 'apis' ? 'apis' : 'tasks') + '/context',
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'appacitive-apikey' : req.body['ak'] ? req.body['ak'] : req.body['as'],
            'appacitive-environment' : req.body['e']
        },
        onSuccess: function(response) {
            cb(response);
        },
        onError: function(err) {
            next(new customError("404", "Server Not found"));
        }
    };
    if (req.body['ut']) ctxReq.headers['appacitive-user-auth'] = req.body['ut'];

    send(ctxReq);
};

