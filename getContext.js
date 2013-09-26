var config = require('./config/contextConfig.js');

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var send = function(request) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if ((this.status >= 200 && this.status < 300) || this.status == 304) {
                var response = this.responseText;
                try {
                    var contentType = this.getResponseHeader('content-type') || this.getResponseHeader('Content-Type');
                    if (contentType.toLowerCase() == 'application/json' ||  contentType.toLowerCase() == 'application/javascript' || contentType.toLowerCase() == 'application/json; charset=utf-8' || contentType.toLowerCase() == 'application/json; charset=utf-8;') { 
                        var jData = response;
                        if (jData[0] != "{") {
                            jData = jData.substr(1, jData.length - 1);
                        }
                        response = JSON.parse(jData);
                    }
                    request.onSuccess(response, this);
                } catch(e) {}
                
            } else {
                request.onError({code: this.status , message: this.statusText }, this);
            }
        }
    };
    xhr.open(request.method, request.url, true);

    for(var x in request.headers) 
        xhr.setRequestHeader(x, request.headers[x]);

    xhr.setRequestHeader('User-Agent', 'Appacitive-CloudCode'); 

    xhr.send();
    return xhr;

};


var restify = require('restify');
var util = require('util');

function InvalidCredentialsError(code, status) {
  restify.RestError.call(this, {
    restCode: 200,
    statusCode: code,
    constructorOpt: InvalidCredentialsError,
    body: {
        status : status,
        body: null
    }
  });

  this.name = 'InvalidCredentialsError';
};

util.inherits(InvalidCredentialsError, restify.RestError);

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
            response = response || { status: { code: '400', message: 'server not found' } };
            next(new InvalidCredentialsError('200', response.status));
        }
    };

    /*
    cb({
        status: {
            code: '200',
            referenceid: req.body["transactionid"]
        },
        acid:'36802269955621123',
        apid: '36802348064047365',
        //dpid: '36802353201021280',
        dpid: req.body["dpid"],
        cf: {
            n: 'apis',
            v: 'JPgFm0kBpJdCFAAdM0Li7KVJLZ_HhzOT',
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
            next(new InvalidCredentialsError(err.message, err.code));
        }
    };
    if (req.body['ut']) ctxReq.headers['appacitive-user-auth'] = req.body['ut'];
    
    send(ctxReq);
};