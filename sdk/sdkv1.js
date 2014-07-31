/*
 * AppacitiveSDK.js v0.9.7.4 - Javascript SDK to integrate applications using Appacitive
 * Copyright (c) 2013 Appacitive Software Pvt Ltd
 * MIT license  : http://www.apache.org/licenses/LICENSE-2.0.html
 * Project      : https://github.com/chiragsanghvi/JavascriptSDK
 * Contact      : support@appacitive.com | csanghvi@appacitive.com
 * Build time   : Mon Jul 21 10:54:26 IST 2014
 */
"use strict";

// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
    Function.prototype.bind= function(owner) {
        var that= this;
        if (arguments.length<=1) {
            return function() {
                return that.apply(owner, arguments);
            };
        } else {
            var args= Array.prototype.slice.call(arguments, 1);
            return function() {
                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
    String.prototype.trim= function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}


// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}
if (!('find' in Array.prototype)) {
    Array.prototype.find = function(mapper, that /*opt*/) {
        var list = this;
        var length = list.length;
        if (length === 0) return undefined;
        for (var i = 0, value; i < length && i in list; i++) {
          value = list[i];
          if (mapper.call(that, value, i, list)) return value;
        }
        return undefined;
    }
}
if (!('each' in Array.prototype)) {
    Array.prototype.each = function(callback, that){
        for (var i =  0; i < this.length; i++){
            callback.apply(that, [this[i]]);
        }
    }
}
if (!('difference' in Array.prototype)) {
    Array.prototype.difference = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };
}
if (!('without' in Array.prototype)) {
    Array.prototype.without = function() {
        return this.difference(Array.prototype.slice.call(arguments, 0));
    };
}
if ( 'function' !== typeof Array.prototype.reduce ) {
    Array.prototype.reduce = function( callback /*, initialValue*/ ) {
        'use strict';
        if ( null === this || 'undefined' === typeof this ) {
            throw new TypeError('Array.prototype.reduce called on null or undefined' );
        }
        if ( 'function' !== typeof callback ) {
            throw new TypeError( callback + ' is not a function' );
        }
        var t = Object( this ), len = t.length >>> 0, k = 0, value;
        if ( arguments.length >= 2 ) {
            value = arguments[1];
        } else {
            while ( k < len && ! k in t ) k++; 
            if ( k >= len )
                throw new TypeError('Reduce of empty array with no initial value');
            value = t[ k++ ];
        }
        for ( ; k < len ; k++ ) {
            if ( k in t ) {
                value = callback( value, t[k], k, t );
            }
        }
        return value;
    };
}

var _lookupIterator = function(value, context) {
    if (value == null) return _.identity;
    if (!_.isFunction(value)) return function(obj) { return obj[value]; };
    if (!context) return value;
    return function() { return value.apply(context, arguments); };
};

Array.prototype.pluck = function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
};
Array.prototype.sortBy = function(iterator, context) {
    iterator = _lookupIterator(iterator, context);
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index, this)
      };
    }, this).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
};

// Override only if native toISOString is not defined
if ( !Date.prototype.toISOString ) {
    ( function() {

        function pad(number) {
            var r = String(number);
            if ( r.length === 1 ) {
                r = '0' + r;
            }
            return r;
        }

        Date.prototype.toISOString = function() {
            return this.getUTCFullYear()
                + '-' + pad( this.getUTCMonth() + 1 )
                + '-' + pad( this.getUTCDate() )
                + 'T' + pad( this.getUTCHours() )
                + ':' + pad( this.getUTCMinutes() )
                + ':' + pad( this.getUTCSeconds() )
                + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
                + 'Z';
        };

    }() );
};

String.addSlashes = function (str) {
    if (!str) return str;
    str = str.replace(/\\/g, '\\\\');
    str = str.replace(/\'/g, '\\\'');
    str = str.replace(/\"/g, '\\"');
    str = str.replace(/\0/g, '\\0');
    return str;
};

String.stripSlashes = function (str) {
    if (!str) return str;
    str = str.replace(/\\'/g, '\'');
    str = str.replace(/\\"/g, '"');
    str = str.replace(/\\0/g, '\0');
    str = str.replace(/\\\\/g, '\\');
    return str;
};

if (typeof console === 'undefined' || console === null) {
    console = { log: function() {}, dir: function() {} };
}

var _type = function (o) {

    // handle null in old IE
    if (o === null || typeof o === 'undefined' || o === 'undefined') {
        return 'null';
    }

    // handle DOM elements
    if (o && (o.nodeType === 1 || o.nodeType === 9)) {
        return 'element';
    }

    var s = Object.prototype.toString.call(o);
    var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

    // handle NaN and Infinity
    if (type === 'number') {
        if (isNaN(o)) {
            return 'nan';
        }
        if (!isFinite(o)) {
            return 'infinity';
        }
    }

    return type;
};

var types = [
    'Null',
    'Undefined',
    'Object',
    'Array',
    'String',
    'Number',
    'Boolean',
    'Function',
    'RegExp',
    'Element',
    'NaN',
    'Infinite'
];

var generateMethod = function (t) {
    _type['is' + t] = function (o) {
        return _type(o) === t.toLowerCase();
    };
};

for (var i = 0; i < types.length; i++) {
    generateMethod(types[i]);
}

_type['isNullOrUndefined'] = function(o) {
    return _type(o) == 'null' || _type(o) == 'undefined';
};

_type['isNumeric'] = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

_type['isDate'] =  function(n) {
    return n instanceof Date;
};

var _clone = function(obj) {
    if (!_type.isObject(obj)) return obj;
    return _type.isArray(obj) ? obj.slice() : _extend({}, obj);
};

Array.prototype.removeAll = function(obj) {
    // Return null if no objects were found and removed
    var destroyed = null;

    for(var i = 0; i < this.length; i++){

        // Use while-loop to find adjacent equal objects
        while(this[i] === obj){

            // Remove this[i] and store it within destroyed
            destroyed = this.splice(i, 1)[0];
        }
    }

    return destroyed;
};

// attach the .compare method to Array's prototype to call it on any array
Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array, strict) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // set strict mode as false 
    if (arguments.length == 1)
        strict = false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i], strict))
                return false;
        }
        else if (strict && !_type.isEqual(this[i], array[i])) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
        else if (!strict) {
            return this.sort().equals(array.sort(), true);
        }
    }
    return true;
};

// Internal recursive comparison function for `isEqual`.
var eq = function(a, b, aStack, bStack) {
  var toString = Object.prototype.toString;

  var _has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a == 1 / b;
  // A strict comparison is necessary because `null == undefined`.
  if (a == null || b == null) return a === b;
  
  // Compare `[[Class]]` names.
  var className = toString.call(a);
  if (className != toString.call(b)) return false;
  switch (className) {
    // Strings, numbers, dates, and booleans are compared by value.
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return a == String(b);
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
      // other numeric values.
      return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a == +b;
  }

  if (typeof a != 'object' || typeof b != 'object') return false;

  if (a instanceof global.Appacitive.GeoCoord && b instanceof global.Appacitive.GeoCoord)
    return (a.toString() == b.toString());

  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] == a) return bStack[length] == b;
  }
  // Objects with different constructors are not equivalent, but `Object`s
  // from different frames are.
  var aCtor = a.constructor, bCtor = b.constructor;
  if (aCtor !== bCtor && !(_types.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                           _types.isFunction(bCtor) && (bCtor instanceof bCtor))
                      && ('constructor' in a && 'constructor' in b)) {
    return false;
  }
  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);
  var size = 0, result = true;
  // Recursively compare objects and arrays.
  if (className == '[object Array]') {
    // Compare array lengths to determine if a deep comparison is necessary.
    size = a.length;
    result = size == b.length;
    if (result) {
      // Deep compare the contents, ignoring non-numeric properties.
      while (size--) {
        if (!(result = eq(a[size], b[size], aStack, bStack))) break;
      }
    }
  } else {
    // Deep compare objects.
    for (var key in a) {
      if (_has(a, key)) {
        // Count the expected number of properties.
        size++;
        // Deep compare each member.
        if (!(result = _has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
      }
    }
    // Ensure that both objects contain the same number of properties.
    if (result) {
      for (key in b) {
        if (_has(b, key) && !(size--)) break;
      }
      result = !size;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return result;
};

// Perform a deep comparison to check if two objects are equal.
_type.isEqual = function(a, b) {
  return eq(a, b, [], []);
};
// monolithic file

var global = {};

(function () {

    "use strict";

    // create the global object

    if (typeof window === 'undefined') {
        global = process;
    } else {
        global = window;
    }

    var _initialize = function () {
        var t;
        if (!global.Appacitive) {
            global.Appacitive = {
                runtime: {
                    isNode: typeof process != typeof t,
                    isBrowser: typeof window != typeof t
                }
            };
        }
    };
    _initialize();


    var Appacitive = global.Appacitive;

    // httpBuffer class, stores a queue of the requests
    // and fires them. Global level pre and post processing 
    // goes here. 
    // requires httpTransport class that is able to actually 
    // send the request and receive the response
    /**
     * @constructor
     */
    var HttpBuffer = function (httpTransport) {

        // validate the httpTransport passed
        // and assign the callback
        if (!httpTransport || !httpTransport.send || !_type.isFunction(httpTransport.send)) {
            throw new Error('No applicable httpTransport class found');
        } else {
            httpTransport.onResponse = this.onResponse;
        }

        // internal handle to the http requests
        var _queue = [];

        // handle to the list of pre-processing functions
        var _preProcessors = {}, _preCount = 0;

        // handle to the list of post-processing functions
        var _postProcessors = {}, _postCount = 0;

        // public method to add a processor
        this.addProcessor = function (processor) {
            if (!processor) return;
            processor.pre = processor.pre || function () {};
            processor.post = processor.post || function () {};

            addPreprocessor(processor.pre);
            addPostprocessor(processor.post);
        };

        // stores a preprocessor
        // returns a numeric id that can be used to remove this processor
        var addPreprocessor = function (preprocessor) {
            _preCount += 1;
            _preProcessors[_preCount] = preprocessor;
            return _preCount;
        };

        // removes a preprocessor
        // returns true if it exists and has been removed successfully
        // else false
        var removePreprocessor = function (id) {
            if (_preProcessors[id]) {
                delete(_preProcessors[id]);
                return true;
            } else {
                return false;
            }
        };

        // stores a postprocessor
        // returns a numeric id that can be used to remove this processor
        var addPostprocessor = function (postprocessor) {
            _postCount += 1;
            _postProcessors[_postCount] = postprocessor;
            return _postCount;
        };

        // removes a postprocessor
        // returns true if it exists and has been removed successfully
        // else false
        var removePostprocessor = function (id) {
            if (_postProcessors[id]) {
                delete(_postProcessors[id]);
                return true;
            } else {
                return false;
            }
        };

        // enqueues a request in the queue
        // returns true is succesfully added
        this.enqueueRequest = function (request) {
            _queue.push(request);
        };


        this.changeRequestForCors = function(request) {
            var body = {
                m : request.method.toUpperCase()
            };
            request.headers.forEach(function(h) {
                body[h.key] = h.value;
            });
            request.prevHeaders = request.headers;
            request.headers = [];
            request.headers.push({ key:'Content-Type', value: 'text/plain; charset=utf-8' });
            request.method = 'POST';

            if (request.data) body.b = request.data;
            delete request.data;
            
            if (Appacitive.config.debug) {
                if (request.url.indexOf('?') === -1) request.url = request.url + '?debug=true';
                else request.url = request.url + '&debug=true';
            }

            if (Appacitive.config.metadata) {
                if (request.url.indexOf('?') === -1) request.url = request.url + '?metadata=true';
                else request.url = request.url + '&metadata=true';
            }

            try { request.data = JSON.stringify(body); } catch(e) {}
            return request;
        };

        // notifies the queue that there are requests pending
        // this will start firing the requests via the method 
        // passed while initalizing
        this.notify = function () {
            if (_queue.length === 0) return;

            // for convienience, extract the postprocessing object into an array
            var _callbacks = [];
            for (var processor in _postProcessors) {
                if (_postProcessors.hasOwnProperty(processor)) {
                    _callbacks.push(_postProcessors[processor]);
                }
            }

            while (_queue.length > 0) {
                var toFire = _queue.shift();

                // execute the preprocessors
                // if they return anything, pass it along
                // to be able to access it in the post processing callbacks
                var _state = [];
                for (var processor in _preProcessors) {
                    if (_preProcessors.hasOwnProperty(processor)) {
                        _state.push(_preProcessors[processor](toFire));
                    }
                }

                this.changeRequestForCors(toFire);

                // send the requests
                // and the callbacks and the 
                // results returned from the preprocessors
                httpTransport.send(toFire, _callbacks, _state);
            }
        };

        // callback to be invoked when a request has completed
        this.onResponse = function (responseData) {
            console.dir(responseData);
        };

    };

    // base httpTransport class
    /**
     * @constructor
     */
    var _HttpTransport = function () {
        var _notImplemented = function () {
            throw new Error('Not Implemented Exception');
        };
        var _notProvided = function () {
            throw new Error('Delegate not provided');
        };

        // implements this
        this.send = _notImplemented;
        this.inOnline = _notImplemented;

        // needs these callbacks to be set
        this.onResponse = function (response, request) {
            _notImplemented();
        };
        this.onError = function (request) {
            _notImplemented();
        };
    };

    // base xmlhttprequest class
    /**
      * @constructor
      */

    var _XMLHttpRequest = null;

    _XMLHttpRequest = (Appacitive.runtime.isBrowser) ?  XMLHttpRequest : require('xmlhttprequest-with-globalagent').XMLHttpRequest;

    var _XDomainRequest = function(request) {
        var promise = Appacitive.Promise.buildPromise({ success: request.onSuccess, error: request.onError });
        var xdr = new XDomainRequest();
        xdr.onload = function() {
            var response = xdr.responseText;
            var contentType = xdr.contentType;
            
            if (contentType.toLowerCase() == 'application/json' ||  contentType.toLowerCase() == 'application/javascript' || contentType.toLowerCase() == 'application/json; charset=utf-8' || contentType.toLowerCase() == 'application/json; charset=utf-8;') { 
                try {
                    var jData = response;
                    if (!Appacitive.runtime.isBrowser) {
                        if (jData[0] != "{") {
                            jData = jData.substr(1, jData.length - 1);
                        }
                    }
                    response = JSON.parse(jData);
                } catch(e) {
                    return promise.reject(xdr, new Appacitive.Error(Appacitive.Error.InvalidJson, 'Error while parsing received json ' + response ));
                }
            } 
            promise.fulfill(response, this);       
        };
        xdr.onerror = xdr.ontimeout = function() {
            // Let's fake a real error message.
            xdr.responseText = JSON.stringify({
                code: Appacitive.Error.XDomainRequest,
                message: "IE's XDomainRequest does not supply error info."
            });
            xdr.status = Appacitive.Error.XDomainRequest;
            promise.reject(xdr);
        };
        xdr.onprogress = function() {};
        if (request.url.indexOf('?') === -1)
            request.url = request.url + '?ua=ie';
        else
            request.url = request.url + '&ua=ie';

        xdr.open(request.method, request.url, true);
        xdr.send(request.data);
        return promise;
    };


    var _XMLHttp = function(request) {

        if (!request.url) throw new Error("Please specify request url");
        if (!request.method) request.method = 'GET' ;
        if (!request.headers) request.headers = [];
        var data = {};

        if (!request.onSuccess || !_type.isFunction(request.onSuccess)) request.onSuccess = function() {};
        if (!request.onError || !_type.isFunction(request.onError)) request.onError = function() {};
        

        var promise = Appacitive.Promise.buildPromise({ success: request.onSuccess, error: request.onError });
        
        var doNotStringify = true;
        request.headers.forEach(function(r){
            if (r.key.toLowerCase() == 'content-type') {
                doNotStringify = true;
                if (r.value.toLowerCase() == 'application/json' || r.value.toLowerCase() == "application/javascript" || r.value.toLowerCase() == 'application/json; charset=utf-8' || r.value.toLowerCase() == 'application/json; charset=utf-8;') {
                    doNotStringify = false;
                }
            }
        });


        if (doNotStringify) data = request.data;
        else {
            if (request.data) { 
                data = request.data;
                if (_type.isObject(request.data)) {
                    try { data = JSON.stringify(data); } catch(e) {}
                }
            }
        }

        
        if (global.navigator && (global.navigator.userAgent.indexOf('MSIE 8') != -1 || global.navigator.userAgent.indexOf('MSIE 9') != -1)) {
            request.data = data;
            var xdr = new _XDomainRequest(request);
            return xdr;
        } else {
            var xhr = new _XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if ((this.status >= 200 && this.status < 300) || this.status == 304) {
                        var response = this.responseText;
                        
                        var contentType = this.getResponseHeader('content-type') || this.getResponseHeader('Content-Type');
                        if (contentType.toLowerCase() == 'application/json' ||  contentType.toLowerCase() == 'application/javascript' || contentType.toLowerCase() == 'application/json; charset=utf-8' || contentType.toLowerCase() == 'application/json; charset=utf-8;') { 
                            try {
                                var jData = response;
                                if (!Appacitive.runtime.isBrowser) {
                                    if (jData[0] != "{") {
                                        jData = jData.substr(1, jData.length - 1);
                                    }
                                }
                                response = JSON.parse(jData);
                            } catch(e) {
                                return promise.reject(this, new Appacitive.Error(Appacitive.Error.InvalidJson, 'Error while parsing received json ' + response, response.headers["TransactionId"] ));
                            }
                        }
                        promise.fulfill(response, this);
                    } else {
                        promise.reject(this, new Appacitive.Error(Appacitive.Error.ConnectionFailed, this.responseText, response.headers["TransactionId"]));
                    }
                }
            };
            xhr.open(request.method, request.url, true);

            for (var x = 0; x < request.headers.length; x += 1)
                xhr.setRequestHeader(request.headers[x].key, request.headers[x].value);
            
            if (!Appacitive.runtime.isBrowser)
                xhr.setRequestHeader('User-Agent', 'Appacitive-NodeJSSDK'); 
            
            xhr.send(data);

            return promise;
        }
    };


    // httpRequest class, encapsulates the request 
    // without bothering about how it is going to be fired.
    /**
     * @constructor
     */
    var HttpRequest = function (o) {
        o = o || {};
        this.url = o.url || '';
        this.data = o.data || {};
        this.headers = o.headers || [];
        this.method = o.method || 'GET';
        this.onSuccess = o.onSuccess || function(){};
        this.onError = o.onError || function(){};

        this.send = function(doNotStringify) {
            return new _XMLHttp(this, doNotStringify);
        };
    };

    // browser based http transport class
    /**
     * @constructor
     */
    var BasicHttpTransport = function () {

        var _super = new _HttpTransport();

        _super.isOnline = function () { return true; };

        var _executeCallbacks = function (response, callbacks, states) {
            if (callbacks.length != states.length) {
                throw new Error('Callback length and state length mismatch!');
            }
            for (var x = 0; x < callbacks.length; x += 1) {
                callbacks[x].apply({}, [response, states[x]]);
            }
        };

        var that = _super;

        var _trigger = function(request, callbacks, states) {
            new  _XMLHttp({
                method: request.method,
                url: request.url,
                headers: request.headers,
                data: request.data,
                onSuccess: function(data, xhr) {
                    if (!data) {
                        that.onError(request, { responseText: { code:'400', message: 'Invalid request' } });
                        return;
                    }
                    try { data = JSON.parse(data);} catch(e) {}
                    
                    // execute the callbacks first
                    _executeCallbacks(data, callbacks, states);

                    if ((data.code >= 200 && data.code <= 300) || (data.status && data.status.code >= 200 && data.status.code <= 300)) {
                        that.onResponse(request, data);
                    } else {
                        data = data || {};
                        data = data.status || data;
                        data.message = data.message || 'Bad Request';
                        data.code = data.code || '400';
                        that.onError(request, { responseText: data });
                    }
                },
                onError: function(xhr, error) {
                    var data = {};

                    if (error) {
                        data = Appacitive.Error.toJSON(error);
                    } else {
                        data.message = xhr.responseText || 'Bad Request';
                        data.code = xhr.status || '400';
                    }
                    that.onError(request, { responseText: data });
                }
            });
        };

        _super.send = function (request, callbacks, states) {
            if (!Appacitive.Session.initialized) throw new Error("Initialize Appacitive SDK");
            if (_type.isFunction(request.beforeSend)) {
                request.beforeSend(request);
            }
            _trigger(request, callbacks, states);
        };

        return _super;
    };

    // http functionality provider
    /**
     * @constructor
     */
    var HttpProvider = function () {

        // actual http provider
        //var _inner = Appacitive.runtime.isBrowser ? new JQueryHttpTransport() : new NodeHttpTransport();
        var _inner = new BasicHttpTransport();

        // the http buffer
        var _buffer = new HttpBuffer(_inner);

        // used to pause/unpause the provider
        var _paused = false;

        // allow pausing/unpausing
        this.pause = function () {
            _paused = true;
        };

        this.unpause = function () {
            _paused = false;
        };

        // allow adding processors to the buffer
        this.addProcessor = function (processor) {
            var _processorError = new Error('Must provide a processor object with either a "pre" function or a "post" function.');
            if (!processor) throw _processorError;
            if (!processor.pre && !processor.post) throw _processorError;

            _buffer.addProcessor(processor);
        };

        // the method used to send the requests
        this.send = function (request) {
            
            request.promise = (Appacitive.Promise.is(request.promise)) ? request.promise : new Appacitive.Promise.buildPromise({ error: request.onError });

            _buffer.enqueueRequest(request);

            // notify the queue if the actual transport 
            // is ready to send the requests
            if (_inner.isOnline() && _paused === false) {
                _buffer.notify();
            }
            
            return request.promise;
        };

        // method used to clear the queue
        this.flush = function (force) {
            if (!force) {
                if (_inner.isOnline()) {
                    _buffer.notify();
                }
            } else {
                _buffer.notify();
            }
        };

        // the error handler
        this.onError = function (request, response) {
            var error = response.responseText;
            Appacitive.logs.logRequest(request, error, error, 'error');
            request.promise.reject(new Appacitive.Error(error), request.entity);
        };
        _inner.onError = this.onError;

        // the success handler
        this.onResponse = function (request, response) {
            if (request.onSuccess) {
                if (request.context) {
                    request.onSuccess.apply(request.context, [response]);
                } else {
                    request.onSuccess(response);
                }
            }
            Appacitive.logs.logRequest(request, response, response ? response.status : null, 'successful');
        };
        _inner.onResponse = this.onResponse;
    };

    // create the http provider and the request
    Appacitive.http = new HttpProvider();
    Appacitive.HttpRequest = HttpRequest;

    /* PLUGIN: Http Utilities */

    // compulsory plugin
    // handles session and shits
    (function (global) {

        var Appacitive = global.Appacitive;

        if (!Appacitive) return;
        if (!Appacitive.http) return;

        Appacitive.http.addProcessor({
            pre: function (request) {
                return request;
            },
            post: function (response, request) {
                try {
                    var _valid = Appacitive.Session.isSessionValid(response);
                    if (!_valid.status) {
                        if (_valid.isSession) {
                            if (Appacitive.Session.get() !== null) {
                                Appacitive.Session.resetSession();
                            }
                            Appacitive.http.send(request);
                        }
                    } else {

                        if (response && ((response.status && response.status.code && (response.status.code == '19036' || response.status.code == '421')) || (response.code && (response.code == '19036' || response.code == '421')))) {
                            Appacitive.Users.logout();
                        } else {
                            Appacitive.Session.incrementExpiry();
                        }
                    }
                } catch(e){}
            }
        });

        Appacitive.http.addProcessor({
            pre: function (req) {
                return { start: new Date().getTime(), request: req };
            },
            post: function (response, args) {
                args.request.timeTakenInMilliseconds = new Date().getTime() - args.start;
            }
        });

    })(global);

    /* Http Utilities */

})(this);
(function(global) {

    "use strict";

    var Appacitive = global.Appacitive;

    Appacitive.logs = {};

    var invoke = function(callback, log) {
        setTimeout(function() {
            try { callback.call({}, log); } catch(e) {}
        }, 0);
    };

    Appacitive.logs.logRequest = function(request, response, status, type) {
        response = response || {};
        status = status || {};
        var body = {};
        try {
            body = JSON.parse(request.data) ;
            if (!_type.isObject(body)) body = {};
        } catch(e) {}

        var log = {
            status: type,
            referenceId: status.referenceid,
            date: new Date().toISOString(),
            method: body['m'],
            url: decodeURIComponent(request.url),
            responseTime : request.timeTakenInMilliseconds,
            headers: {},
            request: null,
            response: response,
            description: request.description
        };

        if (request.headers) {
            request.headers.forEach(function(h) {
                log.headers[h.key] = h.value;
            });
        }

        if (request.prevHeaders) {
            request.prevHeaders.forEach(function(h) {
                log.headers[h.key] = h.value;
            });
        }

        if (log.method !== 'GET') {
            log.request = body['b'];
        }

        if (type == 'error') {
            if (Appacitive.runtime.isBrowser) console.dir(log);

            if (_type.isFunction(Appacitive.logs.apiErrorLog)) {
                invoke(Appacitive.logs.apiErrorLog, log);
            }
        }

        if (_type.isFunction(Appacitive.logs.apiLog)) {
            invoke(Appacitive.logs.apiLog, log);
        }
    };    

    Appacitive.logs.logException = function(error) {  
        if (_type.isFunction(Appacitive.logs.exceptionLog)) {
            invoke(Appacitive.logs.exceptionLog, error);
        }
    };

})(global);(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    /**
     * @param {...string} var_args
     */
    String.format = function (text, var_args) {
        if (arguments.length <= 1) {
            return text;
        }
        var tokenCount = arguments.length - 2;
        for (var token = 0; token <= tokenCount; token++) {
            //iterate through the tokens and replace their placeholders from the original text in order
            text = text.replace(new RegExp("\\{" + token + "\\}", "gi"),
                                                arguments[token + 1]);
        }
        return text;
    };
    String.prototype.toPascalCase = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
    String.prototype.trimChar = function (char1) {
        var pattern = new RegExp("^" + char1);
        var returnStr = this;
        if (pattern.test(returnStr)) returnStr = returnStr.slice(1, returnStr.length);
        pattern = new RegExp(char1 + "$");
        if (pattern.test(returnStr)) returnStr = returnStr.slice(0, -1);
        return returnStr;
    };
    String.toSearchString = function (text) {
        if (typeof (text) === 'undefined')
            text = '';

        var result = '';
        for (var x = 0; x < text.length; x = x + 1) {
            if (' .,;#'.indexOf(text[x]) === -1)
                result += text[x];
        }

        result = result.toLowerCase();

        return result;
    };

    String.contains = function (s1, s2) {
        return (s1.indexOf(s2) !== -1);
    };

    String.startsWith = function (s1, s2) {
        return (s1.indexOf(s2) === 0);
    };

    Array.distinct = function(orgArr) {
        var newArr = [],
            origLen = orgArr.length,
            found,
            x, y;
            
        for ( x = 0; x < origLen; x++ ) {
            found = undefined;
            for ( y = 0; y < newArr.length; y++ ) {
                if ( orgArr[x].toLowerCase() === newArr[y].toLowerCase() ) { 
                  found = true;
                  break;
                }
            }
            if (!found) newArr.push(orgArr[x]);    
        }
       return newArr;
    };

    Object.isEmpty = function (object) {
        if(!object) return true;
        var isEmpty = true;
        for (var keys in object) {
            isEmpty = false; 
            break; // exiting since we found that the object is not empty
        }
        return isEmpty;
    };

    global.dateFromWcf = function (input, throwOnInvalidInput) {
        var pattern = /Date\(([^)]+)\)/;
        var results = pattern.exec(input);
        if (results.length != 2) {
            if (!throwOnInvalidInput) {
                return s;
            }
            throw new Error(s + " is not .net json date.");
        }
        return new Date(parseFloat(results[1]));
    };

    /**
     * @constructor
     */
    var UrlFactory = function () {

        Appacitive.bag = Appacitive.bag || {};
        
        var baseUrl = (Appacitive.config || { apiBaseUrl: '' }).apiBaseUrl;
        
        var _getFields = function(fields) {
            if (typeof fields === 'object' && fields.length > 0 && (typeof fields[0] === 'string' || typeof fields[0] === 'number')) fields = fields.join(',');
            if (!fields) fields = '';
            return fields;
        };

        this.application = {
            applicationServiceUrl : 'application',

            getSessionCreateUrl: function() {
                return String.format("{0}/session", this.applicationServiceUrl);
            }
        };

        this.email = {
            emailServiceUrl: 'email',
            
            getSendEmailUrl: function() {
                return String.format("{0}/send", this.emailServiceUrl);
            }
        };
        this.user = {

            userServiceUrl:  'user',

            getCreateUrl: function (type, fields) {
                return String.format("{0}/create?fields={1}", this.userServiceUrl, _getFields(fields));
            },
            getAuthenticateUserUrl: function () {
                return String.format("{0}/authenticate", this.userServiceUrl);
            },
            getGetUrl: function (type, userId, fields) {
                return String.format("{0}/{1}?fields={2}", type, userId, _getFields(fields));
            },
            getUserByTokenUrl: function(userToken) {
                return String.format("{0}/me?useridtype=token&token={1}", this.userServiceUrl, userToken);
            },
            getUserByUsernameUrl: function(username) {
                return String.format("{0}/{1}?useridtype=username", this.userServiceUrl, username);
            },
            getUpdateUrl: function (userId, fields, revision) {
                if (!revision) {
                    return String.format("{0}/{1}?fields={2}", this.userServiceUrl, userId, _getFields(fields));
                } else {
                    return String.format("{0}/{1}?fields={2}&revision={3}", this.userServiceUrl, userId, _getFields(fields), revision);
                }
            },
            getDeleteUrl: function (type, userId, deleteConnections) {
                if (deleteConnections === true ) {
                    return String.format("{0}/{1}?deleteconnections=true", this.userServiceUrl, userId);
                } else {
                    return String.format("{0}/{1}", this.userServiceUrl, userId);
                }

            },
            getGetAllLinkedAccountsUrl: function(userId) {
                var url = String.format("{0}/{1}/linkedaccounts", this.userServiceUrl, userId);
                return url;
            },
            getValidateTokenUrl: function(token) {
                return String.format("{0}/validate?userToken={1}", this.userServiceUrl, token);
            },
            getInvalidateTokenUrl: function(token) {
                return String.format("{0}/invalidate?userToken={1}", this.userServiceUrl, token);
            },
            getSendResetPasswordEmailUrl: function() {
                return String.format("{0}/sendresetpasswordemail", this.userServiceUrl);
            },
            getUpdatePasswordUrl: function(userId) {
                return String.format("{0}/{1}/changepassword", this.userServiceUrl, userId);
            },
            getLinkAccountUrl: function(userId) {
                return String.format("{0}/{1}/link", this.userServiceUrl, userId);
            },
            getDelinkAccountUrl: function(userId, type){
                return String.format("{0}/{1}/{2}/delink", this.userServiceUrl, userId, type);
            },
            getCheckinUrl: function(userId, lat, lng) {
                return String.format("{0}/{1}/chekin?lat={2}&lng={3}", this.userServiceUrl, userId, lat, lng);
            },
            getResetPasswordUrl: function(token) {
                return String.format("{0}/resetpassword?token={1}", this.userServiceUrl, token);
            },
            getValidateResetPasswordUrl: function(token) {
                return String.format("{0}/validateresetpasswordtoken?token={1}", this.userServiceUrl, token);
            }
        };
        this.device = {
            deviceServiceUrl: 'device',

            getCreateUrl: function (type, fields) {
                return String.format("{0}/register?fields={1}", this.deviceServiceUrl, _getFields(fields));
            },
            getGetUrl: function (type, deviceId, fields) {
                return String.format("{0}/{1}?fields={2}", this.deviceServiceUrl, deviceId, _getFields(fields));
            },
            getUpdateUrl: function (deviceId, fields, revision) {
                if (!revision) {
                    return String.format("{0}/{1}?fields={2}", this.deviceServiceUrl, deviceId, _getFields(fields));
                } else {
                    return String.format("{0}/{1}?fields={2}&revision={3}", this.deviceServiceUrl, deviceId, _getFields(fields), revision);
                }
            },
            getDeleteUrl: function (type, deviceId, deleteConnections) {
                if (deleteConnections === true ) {
                    return String.format('{0}/{1}?deleteconnections=true', this.deviceServiceUrl, deviceId);
                } else {
                    return String.format('{0}/{1}', this.deviceServiceUrl, deviceId);
                }
            }
        };
        this.object = {
            objectServiceUrl: 'object',

            getSearchAllUrl: function (typeName, queryParams, pageSize) {
                var url = '';

                url = String.format('{0}/search/{1}/all', this.objectServiceUrl, typeName);

                if (pageSize)
                    url = url + '?psize=' + pageSize;
                else
                    url = url + '?psize=10';
                if (typeof (queryParams) !== 'undefined' && queryParams.length > 0) {
                    for (var i = 0; i < queryParams.length; i = i + 1) {
                        if (queryParams[i].trim().length === 0) continue;
                        url = url + "&" + queryParams[i];
                    }
                }
                return url;
            },
            getProjectionQueryUrl: function() {
                return String.format('{0}/search/project', this.objectServiceUrl);
            },
            getPropertiesSearchUrl: function (typeName, query) {
                return String.format('{0}/search/{1}/all?properties={2}', this.objectServiceUrl, typeName, query);
            },
            getMultiGetUrl: function (typeName, objectIds, fields) {
                return String.format('{0}/{1}/multiGet/{2}?fields={3}', this.objectServiceUrl, typeName, objectIds, _getFields(fields));
            },
            getCreateUrl: function (typeName, fields) {
                return String.format('{0}/{1}?fields={2}', this.objectServiceUrl, typeName, _getFields(fields));
            },
            getGetUrl: function (typeName, objectId, fields) {
                return String.format('{0}/{1}/{2}?fields={3}', this.objectServiceUrl, typeName, objectId, _getFields(fields));
            },
            getUpdateUrl: function (typeName, objectId, fields, revision) {
                if (!revision) {
                    return String.format('{0}/{1}/{2}?fields={3}', this.objectServiceUrl, typeName, objectId, _getFields(fields));
                } else {
                    return String.format('{0}/{1}/{2}?fields={3}&revision={4}', this.objectServiceUrl, typeName, objectId, _getFields(fields), revision);
                }
            },
            getDeleteUrl: function (typeName, objectId, deleteConnections) {
                if (deleteConnections === true ) {
                    return String.format('{0}/{1}/{2}?deleteconnections=true', this.objectServiceUrl, typeName, objectId);
                } else {
                    return String.format('{0}/{1}/{2}', this.objectServiceUrl, typeName, objectId);
                }
            },
            getMultiDeleteUrl: function (typeName) {
                return String.format('{0}/{1}/bulkdelete', this.objectServiceUrl, typeName);
            }
        };
        this.connection = {

            connectionServiceUrl: 'connection',

            getGetUrl: function (relationName, connectionId, fields) {
                return String.format('{0}/{1}/{2}?fields={3}', this.connectionServiceUrl, relationName, connectionId, _getFields(fields));
            },
            getMultiGetUrl: function (relationName, connectionIds, fields) {
                return String.format('{0}/{1}/multiGet/{2}?fields={3}', this.connectionServiceUrl, relationName, connectionIds, _getFields(fields));
            },
            getCreateUrl: function (relationName, fields) {
                return String.format('{0}/{1}?fields={2}', this.connectionServiceUrl, relationName, _getFields(fields));
            },
            getUpdateUrl: function (relationName, connectionId, fields, revision) {
                if (!revision) {
                    return String.format('{0}/{1}/{2}?fields={3}', this.connectionServiceUrl, relationName, connectionId, _getFields(fields));
                } else {
                    return String.format('{0}/{1}/{2}?fields={3}&revision={4}', this.connectionServiceUrl, relationName, connectionId, _getFields(fields), revision);
                }
            },
            getDeleteUrl: function (relationName, connectionId) {
                return String.format('{0}/{1}/{2}', this.connectionServiceUrl, relationName, connectionId);
            },
            getMultiDeleteUrl: function (relationName) {
                return String.format('{0}/{1}/bulkdelete', this.connectionServiceUrl, relationName);
            },
            getSearchByArticleUrl: function (relationName, objectId, label, queryParams) {
                var url = '';

                url = String.format('{0}/{1}/find/all?label={2}&objectid={3}', this.connectionServiceUrl, relationName, label, objectId);
                // url = url + '?psize=1000';
                if (typeof (queryParams) !== 'undefined' && queryParams.length > 0) {
                    for (var i = 0; i < queryParams.length; i = i + 1) {
                        url = url + "&" + queryParams[i];
                    }
                }
                return url;
            },
            getConnectedArticles: function (relationName, objectId, queryParams) {
                var url = '';
                url = String.format('{0}/{1}/{2}/find', this.connectionServiceUrl, relationName, objectId);
                if (queryParams && queryParams.length && queryParams.length > 0) {
                    for (var x = 0; x < queryParams.length; x += 1) {
                        if (x === 0) {
                            url += '?' + queryParams[x];
                        } else {
                            url += '&' + queryParams[x];
                        }
                    }
                }
                return url;
            },
            getInterconnectsUrl: function () {
                return String.format('{0}/interconnects', this.connectionServiceUrl);
            },
            getPropertiesSearchUrl: function (relationName, query) {
                return String.format('{0}/{1}/find/all?properties=', this.connectionServiceUrl, relationName, query);
            }
        };
        this.cannedList = {

            cannedListServiceUrl: 'list',

            getGetListItemsUrl: function (cannedListId) {
                return String.format('{0}/list/{1}/contents', this.cannedListServiceUrl, cannedListId);
            }
        };
        this.push = {
            
            pushServiceUrl: 'push',

            getPushUrl: function () {
                return String.format('{0}/', this.pushServiceUrl);
            },

            getGetNotificationUrl: function (notificationId) {
                return String.format('{0}/notification/{1}', this.pushServiceUrl, notificationId);
            },

            getGetAllNotificationsUrl: function (pagingInfo) {
                return String.format('{0}/getAll?psize={1}&pnum={2}', this.pushServiceUrl, pagingInfo.psize, pagingInfo.pnum);
            }
        };
        this.file = {

            fileServiceUrl: 'file',

            getUploadUrl: function (contentType, fileName) {
                if (fileName && fileName.length > 0) {
                    return String.format('{0}/uploadurl?contenttype={1}&expires=20&filename={2}', this.fileServiceUrl, escape(contentType), escape(fileName));
                } else {
                    return String.format('{0}/uploadurl?contenttype={1}&expires=20', this.fileServiceUrl, escape(contentType));
                }
            },

            getUpdateUrl: function (fileId, contentType) {
                return String.format('{0}/updateurl/{1}?contenttype={2}&expires=20', this.fileServiceUrl, fileId, escape(contentType));
            },

            getDownloadUrl: function (fileId, expiryTime) {
                return String.format('{0}/download/{1}?expires={2}', this.fileServiceUrl, fileId, expiryTime);
            },

            getDeleteUrl: function (fileId) {
                return String.format('{0}/delete/{1}', this.fileServiceUrl, fileId);
            }
        };
        this.query = {
            params: function (key) {
                var match = [];
                if (location.search === "" || location.search.indexOf("?") === -1) return match;
                if (!key) return location.search.split("?")[1].split("=");
                else {
                    key = key.toLowerCase();
                    var splitQuery = location.search.split("?")[1].split("&");
                    splitQuery.forEach(function (i, k) {
                        var splitKey = k.split("=");
                        var value = splitKey[1];
                        if (splitKey.length > 2) {
                            splitKey.forEach(function (ii, kk) {
                                if (ii === 0 || ii === 1) return;
                                value = value + "=" + splitKey[ii];
                            });
                        }
                        if (splitKey[0].toLowerCase() === key) match = [splitKey[0], value];
                    });
                    return match;
                }
            }
        };
        this.usergroup = {
            usergroupServiceUrl: 'usergroup',

            getUpdateUrl: function(groupId) {
                return String.format('{0}/{1}/members', this.usergroupServiceUrl, groupId);
            }
        };
        this.ping = {
            pingServiceUrl: 'ping',

            getPingUrl: function() {
                return String.format('{0}/', this.pingServiceUrl);
            }
        }

    };

    Appacitive.storage = Appacitive.storage || {};
    Appacitive.storage.urlFactory = new UrlFactory();

})(global);

/* 
* Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

(function(global) {

    "use strict";

    var Appacitive = global.Appacitive;

    var setImmediate;

    if (Appacitive.runtime.isNode) {
        setImmediate = process.nextTick;
    } else {
        setImmediate = setTimeout;
    }

    var PROMISE = 0, FULFILLED = 1, REJECTED = 2;

    var Promise = function () {

        if (!(this instanceof Promise)) return new Promise();

        this.calls = [];
    };

    Promise.prototype.isResolved = function() {
        if (this.state === 1) return true;
        return false;
    };

    Promise.prototype.isRejected = function() {
        if (this.state === 2) return true;
        return false;
    };

    Promise.prototype.isFulfilled = function() {
        if (this.state === 1 || this.state === 2) return true;
        return false;
    };

    Promise.prototype.done = function() {
        var then, promise, res, state = this.state, value = this.value;

        if (!state) return this;

        while (then = this.calls.shift()) {
            promise = then[PROMISE];

            if (typeof then[state] === 'function') {
                
                try {
                    value = then[state].apply(promise, this.value);  
                } catch(error) {
                    var err = {name: error.name, message: error.message, stack: error.stack};
                    Appacitive.logs.logException(err);
                    
                    if (promise.calls.length == 0) throw error;
                    else promise.reject(error);
                }

                if (value instanceof Promise || Promise.is(value) )  {
                    /* assume value is thenable */
                    value.then(function(v){
                        promise.fulfill(v); 
                    }, function(r) {
                        promise.reject(r);
                    });
                } else {
                    if (state === FULFILLED)
                        promise.fulfill(value);
                    else 
                        promise.reject(value);
                }  
            } else {
                if (state === FULFILLED)
                    promise.fulfill(value);
                else 
                    promise.reject(value);
            }
        }
    };

    Promise.prototype.fulfill = function() {
        if (this.state) return this;

        this.state = FULFILLED;
        this.value = arguments;

        this.done();

        return this;
    };

    Promise.prototype.resolve = Promise.prototype.fulfill;

    Promise.prototype.reject = function() {
        if(this.state) return this;

        this.state = REJECTED;
        this.reason = this.value = arguments;

        this.done();

        return this;
    };

    Promise.prototype.then = function(onFulfill, onReject) {
        var self = this, promise = new Promise();

        this.calls[this.calls.length] = [promise, onFulfill, onReject];

        if (this.state) {
            setImmediate(function(){
                self.done();
            });
        }    

        return promise;
    };

    Promise.when = function(task) {
        
        var values = [], reasons = [], total, numDone = 0;

        var promise = new Promise();

        /* If no task found then simply fulfill the promise */
        if (!task || (_type.isArray(task) && task.length == 0)) {
            promise.fulfill(values);
            return promise;
        }

        /* Check whether all promises have been resolved */
        var notifier = function() {
            numDone += 1;
            if (numDone == total) {
                if (!promise.state) {
                    if (reasons.length > 0) {
                        promise.reject(reasons, values ? values : []);
                    } else {
                        promise.fulfill(values ? values : []);
                    }
                }
            }
        };

        /* Assign callbacks for task depending on its type (function/promise) */
        var defer = function(i) {
            var value;
            var proc = task[i];
            if (proc instanceof Promise || (proc && typeof proc.then === 'function')) {
                 setImmediate(function() {
                    /* If proc is a promise, then wait for fulfillment */
                    proc.then(function(value) {
                        values[i] = value;
                        notifier();
                    }, function(reason) {
                        reasons[i] = reason;
                        notifier();
                    });
                });
            } else {
                setImmediate(function() {
                    /* Call the proc and set values/errors and call notifier */
                    try {
                        values[i] = proc.call();
                    } catch (e) {
                        reasons[i] = e;
                    }
                    notifier();
                });
            }
        };

        /* Single task */
        if (!Array.isArray(task)) { 
            task = [task];
        }

        /* Set count for future notifier */
        total = task.length;

        /* Iterate over all task */
        for (var i = 0; i < total; i = i + 1) {
            defer(i);
        }

        return promise;
    }; 

    Promise.is = function(p) {
        if (p instanceof Promise) return true; return false; 
    };

    Promise.buildPromise = function(options) {
        var promise = new Promise(); 
        
        if (_type.isObject(options)) {
            promise.then(options.success, options.error);
        }
        return promise;
    };

    Promise._continueUntil = function(iterator, func) {
        if (_type.isFunction(iterator) && iterator()) {
            return func().then(function() {
                return Promise._continueUntil(iterator, func);
            });
        }
        return new Promise().fulfill();
    };

    Appacitive.Promise = Promise;

})(global);/**
Depends on  NOTHING
**/

(function(global) {

    "use strict";

    var Appacitive = global.Appacitive;

    /**
     * @constructor
    */

    var EventManager = function () {

        function GUID() {
            var S4 = function () {
                return Math.floor(
                    Math.random() * 0x10000 /* 65536 */
                ).toString(16);
            };

            return (
                S4() + S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + S4() + S4()
            );
        }

        var _subscriptions = {};

        this.subscribe = function (eventName, callback) {
            if (typeof (eventName) != "string" || typeof (callback) != "function")
                throw new Error("Incorrect subscription call");

            if (typeof (_subscriptions[eventName]) == "undefined")
                _subscriptions[eventName] = [];

            var _id = GUID();
            _subscriptions[eventName].push({
                callback: callback,
                id: _id
            });

            return _id;
        };

        this.unsubscribe = function (id) {
            if (!id) return false;
            var index = -1, eN = null;
            for (var eventName in _subscriptions) {
                for (var y = 0; y < _subscriptions[eventName].length; y = y + 1) {
                    if (_subscriptions[eventName][y].id == id) {
                        index = y;
                        eN = eventName;
                        break;
                    }
                }
            }
            if (index != -1) {
                _subscriptions[eN].splice(index, 1);
                return true;
            }
            return false;
        };

        this.fire = function (eventName, sender, args) {
            if (typeof (eventName) != "string") throw new Error("Incorrect fire call");

            if (typeof (args) == "undefined" || args === null)
                args = {};
            args.eventName = eventName;

            // shifted logging here
            // for better debugging
            //if (console && console.log && typeof console.log == 'function')
               // console.log(eventName + ' fired');

            if (typeof (_subscriptions["all"]) != "undefined") {
                for (var x = 0; x < _subscriptions["all"].length; x = x + 1) {
                    //try {
                    _subscriptions["all"][x].callback(sender, args);
                    //} catch (e) { }
                }
            }

            var _callback = function (f, s, a) {
                setTimeout(function () {
                    f(s, a);
                }, 0);
            };

            if (typeof (_subscriptions[eventName]) != "undefined") {
                for (var y= 0; y < _subscriptions[eventName].length; y = y + 1) {
                    _callback(_subscriptions[eventName][y].callback, sender, args);
                }
            }
        };

        this.clearSubscriptions = function (eventName) {
            if (typeof (eventName) != 'string')
                throw new Error('Event Name must be string in EventManager.clearSubscriptions');

            if (_subscriptions[eventName]) _subscriptions[eventName].length = 0;

            return this;
        };

        this.clearAndSubscribe = function (eventName, callback) {
            this.clearSubscriptions(eventName);
            this.subscribe(eventName, callback);
        };

        this.dump = function () {
            console.dir(_subscriptions);
        };

    };

    Appacitive.eventManager = new EventManager();

})(global);/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 */
/* global exports:true, define, module */
(function(global) {
  var root = global,
      breaker = {},
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

  // Returns a partial implementation matching the minimal API subset required
  // by Backbone.Events
  function miniscore() {
    return {
      keys: Object.keys,

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          for (var key in obj) {
            if (this.has(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) return;
            }
          }
        }
      },

      once: function(func) {
        var ran = false, memo;
        return function() {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      }
    };
  }

  var _ = miniscore(), Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function(proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo', 'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function(name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  //changed to match with Appacitive
  root.Appacitive.Events = Events;
 
})(global);(function (global) {

    "use strict";

    global.Appacitive.config = {
        apiBaseUrl: 'https://apis.appacitive.com/v1.0/',
        metadata: true
    };

    if (global.navigator && (global.navigator.userAgent.indexOf('MSIE 8') != -1 || global.navigator.userAgent.indexOf('MSIE 9') != -1)) {
        global.Appacitive.config.apiBaseUrl = window.location.protocol + '//apis.appacitive.com/v1.0/';
    }

}(global));

(function(global) {

    "use strict";

    var Appacitive = global.Appacitive;
    
    var getUrl = function(options) {
        var ctx = Appacitive.storage.urlFactory[options.type];

        var description =  options.op.replace('get','').replace('Url', '') + ' ' + options.type;

        return { 
            url:  Appacitive.config.apiBaseUrl + ctx[options.op].apply(ctx, options.args || []),
            description: description
        };
    };

    var _request = function(options) {

        if (!options || !_type.isObject(options)) throw new Error("Please specify request options");

        this.promise = Appacitive.Promise.buildPromise(options.options);

        var request = this.request = new Appacitive.HttpRequest();
        
        var tmp = getUrl(options);

        request.url = tmp.url;

        request.description = tmp.description;

        request.method = options.method || 'get';
        
        request.data = options.data || {} ;

        request.onSuccess = options.onSuccess;
        
        request.onError = options.onError;

        request.promise = this.promise;

        request.options = options.options;

        if (options.entity) request.entity = options.entity; 

        return this;
    };

    _request.prototype.send = function() {
        return Appacitive.http.send(this.request);
    };

    Appacitive._Request = _request;

})(global);var ArrayProto = Array.prototype;
var ObjectProto = Object.prototype;

var each = function(obj, iterator, context) {
    if (obj == null) return;
    if (ArrayProto.forEach && obj.forEach === ArrayProto.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === {}) return;
      }
    } else {
      for (var key in obj) {
        if (ObjectProto.hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === {}) return;
        }
      }
    }
};

  // Extend a given object with all the properties in passed-in object(s).
var _extend = function(obj) {
    each(ArrayProto.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (_type.isObject(protoProps) && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ 
        return parent.apply(this, arguments); 
      };
    }

    // Add static properties to the constructor function, if supplied.
    _extend(child, parent, staticProps);
    
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

(function (global) {

  "use strict";

  global.Appacitive._extend = function(parent, protoProps, staticProps) {
    return extend.apply(parent, [protoProps, staticProps]);
  };

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    Appacitive.Error = function(status) {
        if (_type.isString(arguments[0]) || _type.isNumber(arguments[0])) {
            status = {
                code: arguments[0],
                message: arguments[1],
                referenceId: arguments[2],
                additionalMessages: arguments[3]
            }
        }

        this.code = status.code || "400";
        this.message = status.message || "Unknown Error";
        if (status.referenceId) this.referenceId = status.referenceid || status.referenceId;
        if (status.additionalmessages) this.additionalMessages = status.additionalmessages || additionalMessages;
    };

    Appacitive.Error.toJSON = function(error) {
        return {
            code: error.code,
            message: error.message,
            referenceId: error.referenceId,
            additionalmessages: error.additionalMessages
        };
    };

    _extend(Appacitive.Error, {
    
        // Appacitive Status codes

        BadRequest: "400",
        AccessControl: "401",
        PaymentRequired: "402",
        UsageLimitReached: "403",
        NotFound: "404",
        Duplicate: "435",
        MvccFailure: "409",
        PreconditionFailed: "412",
        ApiAuthenticationError: "420",
        IdentityFailures: "421",
        IncorrectConfiguration: "436",
        InternalServerError: "500",
        DataAccessFailure: "512",

        //SDK Internal Error codes

        UnknownCause: 100,
        InvalidParameters: '400',
        ConnectionFailed: 1001,
        MissingId: '404',
        InvalidJson: 1007,
        DuplicateUsername: '435',
        DuplicateValue: '435',
        XDomainRequest: 5000
    });

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    /**
     * @constructor
     */
    var SessionManager = function() {

        /**
         * @constructor
         */

        this.initialized = false;

        var _sessionRequest = function() {
            this.apikey = '';
            this.isnonsliding = false;
            this.usagecount = -1;
            this.windowtime = 240;
        };

        var _sessionKey = null, _appName = null, _options = null, _apikey = null, _authToken = null, authEnabled = false, _masterKey;

        this.useApiKey = true;

        this.useMasterKey = false;

        this.onSessionCreated = function() {};

        this.recreate = function(options) {
            return Appacitive.Session.create(options);
        };

        this.create = function(options) {

            if (!this.initialized) throw new Error("Initialize Appacitive SDK");

            // create the session
            var _sRequest = new _sessionRequest();

            _sRequest.apikey = _apikey;

            var request = new Appacitive._Request({
                method: 'PUT',
                type: 'application',
                op: 'getSessionCreateUrl',
                options: options,
                data: _sRequest,
                onSuccess: function(data) {
                    _sessionKey = data.session.sessionkey;
                    Appacitive.Session.useApiKey = false;
                    request.promise.fulfill(data);
                    Appacitive.Session.onSessionCreated();
                }
            });
            return request.send();
        };

        Appacitive.http.addProcessor({
            pre: function(request) {
                request.options = request.options || {};
                if (Appacitive.Session.useApiKey) {
                    var key = _apikey;
                    if ((request.options.useMasterKey || (Appacitive.useMasterKey && !request.options.useMasterKey )) && _type.isString(_masterKey) && _masterKey.length > 0) {
                        key = _masterKey;
                    } else if (_type.isString(request.options.apikey)) {
                        key = request.options.apikey;
                    }
                    request.headers.push({ key: 'ak', value: key });
                } else {
                    request.headers.push({ key: 'as', value: _sessionKey });
                }

                if (authEnabled === true) {
                    var ind = -1;
                    var userAuthHeader = request.headers.filter(function (uah, i) {
                        if (uah.key == 'ut') {
                            ind = i;
                            return true;
                        }
                        return false;
                    });

                    if (request.options.ignoreUserToken) {
                        if (ind != -1) request.headers.splice(ind, 1);
                    } else {
                        var token = _authToken;
                        
                        if (_type.isString(request.options.userToken) && request.options.userToken.length > 0)
                            token = request.options.userToken;

                        if (userAuthHeader.length == 1) {
                            request.headers.forEach(function (uah) {
                                if (uah.key == 'ut') {
                                    uah.value = token;
                                }
                            });
                        } else {
                            request.headers.push({ key: 'ut', value: token });
                        }
                    }
                }
            }
        });

        this.setUserAuthHeader = function(authToken, expiry, doNotSetInStorage) {
            try {
                if (authToken) {
                    authEnabled = true;
                    _authToken = authToken;
                    if (!doNotSetInStorage) {
                        if (!expiry) expiry = -1;
                        if (expiry == -1) expiry = null;

                        Appacitive.localStorage.set('Appacitive-UserToken', authToken);
                        Appacitive.localStorage.set('Appacitive-UserTokenExpiry', expiry);
                        Appacitive.localStorage.set('Appacitive-UserTokenDate', new Date().getTime());
                    }
                }
            } catch(e) {}
        };

        this.incrementExpiry = function() {
            try {
                if (Appacitive.runtime.isBrowser && authEnabled) {
                    Appacitive.localStorage.set('Appacitive-UserTokenDate', new Date().getTime());
                }
            } catch(e) {}
        };

        this.removeUserAuthHeader = function(makeApiCall, options) {

            var promise = Appacitive.Promise.buildPromise(options);

            if (!makeApiCall) Appacitive.User.trigger('logout', {});
            
            Appacitive.localStorage.remove('Appacitive-User');
            if (_authToken && makeApiCall) {
                try {

                    var _request = new Appacitive.HttpRequest(options);
                    _request.url = Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.user.getInvalidateTokenUrl(_authToken);
                    _request.method = 'POST';
                    _request.data = {};
                    _request.type = 'user';
                    _request.options = options;
                    _request.description = 'InvalidateToken user';
                    _request.onSuccess = _request.onError = function() {
                        authEnabled = false;
                        _authToken = null;
                        Appacitive.User.trigger('logout', {});
                        Appacitive.localStorage.remove('Appacitive-UserToken');
                        Appacitive.localStorage.remove('Appacitive-UserTokenExpiry');
                        Appacitive.localStorage.remove('Appacitive-UserTokenDate');
                        promise.fulfill();  
                    };

                    Appacitive.http.send(_request);

                    return promise;
                } catch (e){}
            } else {
                authEnabled = false;
                _authToken = null;
                Appacitive.localStorage.remove('Appacitive-UserToken');
                Appacitive.localStorage.remove('Appacitive-UserTokenExpiry');
                Appacitive.localStorage.remove('Appacitive-UserTokenDate');
                return promise.fulfill();
            }
        };

        this.isSessionValid = function(response) {
            if (response.status) {
                if (response.status.code) {
                    if (response.status.code == '420' || response.status.code == '19027' || response.status.code == '19002') {
                        return { status: false, isSession: (response.status.code == '19027' || response.status.code == '420') ? true : false };
                    }
                }
            } else if (response.code) {
                if (response.code == '420' || response.code == '19027' || response.code == '19002') {
                    return { status: false, isSession: (response.code == '19027' || response.code == '420') ? true : false };
                }
            }
            return { status: true };
        };

        this.resetSession = function() {
            _sessionKey = null;
            this.useApiKey = true;
        };

        this.get = function() {
            return _sessionKey;
        };

        this.setSession = function(session) {
            if (session) {
                _sessionKey = session;
                this.useApiKey = false;
            }
        };

        this.setApiKey = function(apikey) {
            if (apikey) {
                _apikey = apikey;
                this.useApiKey = true;
            }
        };

        this.setMasterKey = function(key) {
            _masterKey = key;
        };

        this.reset = function() {
            this.removeUserAuthHeader();
            _sessionKey = null, _appName = null, _options = null, _apikey = null, _authToken = null, authEnabled = false, _masterKey = null;
            this.initialized = false;
            this.useApiKey = false;
            this.useMasterKey = false;
        };

        // the name of the environment, simple public property
        var _env = 'sandbox';
        this.environment = function() {
            if (arguments.length == 1) {
                var value = arguments[0];
                if (value != 'sandbox' && value != 'live')  value = 'sandbox';
                _env = value;
            }
            return _env;
        };
    };

    Appacitive.Session = new SessionManager();

    Appacitive.getAppPrefix = function(str) {
        return Appacitive.Session.environment() + '/' + Appacitive.appId + '/' + str;
    };

    Appacitive.ping = function(options) {
        if (!Appacitive.Session.initialized) throw new Error("Initialize Appacitive SDK");

        var request = new Appacitive._Request({
            method: 'GET',
            type: 'ping',
            op: 'getPingUrl',
            options: options,
            onSuccess: function(data) {
                return request.promise.fulfill(data.status);
            }
        });
        return request.send();
    };

    Appacitive.initialize = function(options) {
        
        options = options || {};

        if (Appacitive.Session.initialized) return;
        
        if (options.masterKey && options.masterKey.length > 0) Appacitive.Session.setMasterKey(options.masterKey);

        if (!options.apikey || options.apikey.length === 0) {
            if (options.masterKey) options.apikey = options.masterKey;
            else throw new Error("apikey is mandatory");
        }

        if (!options.appId || options.appId.length === 0) throw new Error("appId is mandatory");

        
        Appacitive.Session.setApiKey( options.apikey);
        Appacitive.Session.environment(options.env || 'sandbox' );
        Appacitive.useApiKey = true;
        Appacitive.appId = options.appId;
        
        Appacitive.Session.initialized = true;
        Appacitive.Session.persistUserToken = options.persistUserToken;
        
        if (options.debug) Appacitive.config.debug = true;

        if (_type.isFunction(options.apiLog)) Appacitive.logs.apiLog = options.apiLog;
        if (_type.isFunction(options.apiErrorLog)) Appacitive.logs.apiErrorLog = options.apiErrorLog;
        if (_type.isFunction(options.exceptionLog)) Appacitive.logs.exceptionLog = options.exceptionLog;

        if (options.userToken) {

            if (options.expiry == -1)  options.expiry = null;
            else if (!options.expiry)  options.expiry = 8450000;

            Appacitive.Session.setUserAuthHeader(options.userToken, options.expiry);

            if (options.user) {
                Appacitive.Users.setCurrentUser(options.user);  
            } else {
                //read user from from localstorage and set it;
                var user = Appacitive.localStorage.get('Appacitive-User');  
                if (user) Appacitive.Users.setCurrentUser(user);
            }

        } else {

            if (Appacitive.runtime.isBrowser) {
                //read usertoken from localstorage and set it
                var token = Appacitive.localStorage.get('Appacitive-UserToken');
                if (token) { 
                    var expiry = Appacitive.localStorage.get('Appacitive-UserTokenExpiry');
                    var expiryDate = Appacitive.localStorage.get('Appacitive-UserTokenDate');
                    
                    if (!expiry) expiry = -1;
                    if (expiryDate && expiry > 0) {
                        if (new Date(expiryDate + (expiry * 1000)) < new Date()) return;
                    }
                    if (expiry == -1) expiry = null;
                    //read usertoken and user from from localstorage and set it;
                    var user = Appacitive.localStorage.get('Appacitive-User');  
                    if (user) Appacitive.Users.setCurrentUser(user, token, expiry);
                }
            }
        }           
    };

    Appacitive.reset = function() {
        Appacitive.Session.reset();
    };

} (global));


// compulsory http plugin
// attaches the appacitive environment headers and other event plugins
(function (global){

    "use strict";

    var Appacitive = global.Appacitive;

    if (!Appacitive) return;
    if (!Appacitive.http) return;

    Appacitive.http.addProcessor({
        pre: function(req) {
            var env = Appacitive.Session.environment()
            req.options = req.options || {};
            if (_type.isString(req.options.env)) env = req.options.env;
            req.headers.push({ key: 'e', value: env });
        }
    });


   Appacitive.Events.mixin(Appacitive);

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    Appacitive.GeoCoord = function(lat, lng) {
        
        var _validateGeoCoord = function(lat, lng) {
          if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid Latitiude or longitiude provided");
          if (lat < -90.0 || lat > 90.0) throw new Error("Latitude " + lat + " should be in range of  -90.0 to 90.");
          if (lng < -180.0 || lng > 180.0) throw new Error("Latitude " + lng + " should be in range of  -180.0 to 180.");
        };

        // Parses string geocode value and return Appacitive geocode object or false
        var getGeocode = function(geoCode) {
          // geoCode is not string or its length is 0, return false
          if (typeof geoCode !== 'string' || geoCode.length == 0) return false;
          
          // Split geocode string by ,
          var split = geoCode.split(',');

          // split length is not equal to 2 so return false
          if (split.length !== 2 ) return false;

          // validate the geocode
          try {
            return new Appacitive.GeoCoord(split[0], split[1]);
          } catch(e) {
            return false;
          }
        };

        if (_type.isString(lat) && !lng) {
            var geoCode = getGeocode(lat);
            if (geoCode) return geoCode;
        }

        if (!lat || !lng) {
          this.lat = 0, this.lng = 0;
        } else {
          _validateGeoCoord(lat, lng);
          this.lat = lat, this.lng = lng;
        }

        this.toJSON = function() {
            return {
                latitude : this.lat,
                longitude: this.lng
            };
        };

        this.getValue = function() {
            return String.format("{0},{1}", lat, lng);
        };

        this.toString = function() { return this.getValue(); };
    };

    var _filter = function() { 
        this.toString = function() { }; 

        this.Or = function() {
            var args = Array.prototype.slice.call(arguments, 0);
            args.splice(0, 0, this);
            return new _compoundFilter(_operators.or, args); 
        };

        this.And = function() {
            var args = Array.prototype.slice.call(arguments, 0);
            args.splice(0, 0, this);
            return new _compoundFilter(_operators.and, args); 
        };
    };

    var _fieldFilter = function(options) {

        _filter.call(this);

        options = options || {};
        this.fieldType = options.fieldType;
        this.field = options.field || '';
        this.value = options.value;
        this.operator = options.operator;

        this.getFieldType = function() {
            switch (this.fieldType) {
                case 'property' : return '*';
                case 'attribute' : return '@';
                case 'aggregate' : return '$';
                default : return '*';
            }
        };

        this.toString = function() {
             return String.format("{0}{1} {2} {3}",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    this.value.getValue());
        };

    };

    _fieldFilter.prototype = new _filter();
    _fieldFilter.prototype.constructor = _fieldFilter;


    var _containsFilter = function(options) {
        
        options = options || '';

        if (!_type.isArray(options.value) || !options.value.length) throw new Error("Specify field value as array");
        
        _fieldFilter.call(this, options);

        var _getValue = function(value) {
            if (_type.isString(value)) return "'" + value + "'";
            else if (_type.isNumber(value)) return value;  
            else return value.toString();
        };

        this.toString = function() {
            var values = [];
            for (var i = 0; i < this.value.length; i = i + 1) {
                values.push(String.format("{0}{1} {2} {3}",
                            this.getFieldType(),
                            this.field.toLowerCase(),
                            this.operator,
                            _getValue(this.value[i])));
            }
            return "("  + values.join(' or ') + ")"; 
        };

    };

    _containsFilter.prototype = new _fieldFilter();
    _containsFilter.prototype.constructor = _containsFilter;

    var _betweenFilter = function(options) {
        options = options || '';

        if (!options.val1) throw new Error("Specify field value1 ");
        if (!options.val2) throw new Error("Specify field value2 ");

        this.val1 = options.val1;
        this.val2 = options.val2;

        _fieldFilter.call(this, options);

        delete this.value;

        this.toString = function() {
             return String.format("{0}{1} {2} ({3},{4})",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    this.val1.getValue(),
                    this.val2.getValue());
        };

    };

    _betweenFilter.prototype = new _fieldFilter();
    _betweenFilter.prototype.constructor = _betweenFilter;


    var _radialFilter = function(options) {

        options = options || '';

        if (!options.geoCoord || !(options.geoCoord instanceof Appacitive.GeoCoord)) throw new Error("withinCircle filter needs Appacitive.GeoCoord object as argument");

        _fieldFilter.call(this, options);

        this.value = options.geoCoord;

        this.unit = options.unit || 'mi';

        this.distance = options.distance || 5;

        this.toString = function() {
             return String.format("{0}{1} {2} {3},{4} {5}",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    this.value.getValue(),
                    this.distance,
                    this.unit);
        };
    };

    _radialFilter.prototype = new _fieldFilter();
    _radialFilter.prototype.constructor = _betweenFilter;


    var _polygonFilter = function(options) {

        options = options || '';

        if (!options.geoCoords || options.geoCoords.length === 0) throw new Error("polygon filter needs array of Appacitive.GeoCoord objects as argument");

        if (options.geoCoords.length < 3) throw new Error("polygon filter needs atleast 3 Appacitive.GeoCoord objects as arguments");

        _fieldFilter.call(this, options);

        this.value = options.geoCoords;

        var _getPipeSeparatedList = function(coords) {
            var value = '';
            coords.forEach(function(c) {
                if (value.length === 0) value = c.toString();
                else value += " | " + c.toString();
            });
            return value;
        };

        this.toString = function() {
             return String.format("{0}{1} {2} {3}",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    _getPipeSeparatedList(this.value));
        };
    };

    _polygonFilter.prototype = new _fieldFilter();
    _polygonFilter.prototype.constructor = _betweenFilter;

    var _tagFilter = function(options) {

        _filter.call(this);

        options = options || {};
        if (!options.tags || !_type.isArray(options.tags) || options.tags.length === 0) throw new Error("Specify valid tags");

        this.tags = options.tags;
        this.operator = options.operator;
        
        this.toString = function() {
             return String.format("{0}('{1}')", this.operator, this.tags.join(','));
        };
    };

    _tagFilter.prototype = new _filter();
    _tagFilter.prototype.constructor = _tagFilter;

    var _compoundFilter = function(operator, filters) {
        
        if (!filters || !filters.length || filters.length < 2) throw new Error("Provide valid or atleast 2 filters");

        this.operator = operator;

        this.innerFilters = [];

        for (var i = 0; i < filters.length ; i = i + 1) {
            if (!(filters[i] instanceof _filter)) throw new Error("Invalid filter provided");
            this.innerFilters.push(filters[i]);
        }

        this.toString = function() {
            var op = this.operator;
            var value = "(";
            this.innerFilters.forEach(function(f) {
                if (value.length === 1) value += ' ' + f.toString();
                else value += String.format(' {0} {1} ', op, f.toString());
            });
            value += ")";
            return value;
        };
    };

    _compoundFilter.prototype = new _filter();
    _compoundFilter.prototype.constructor = _compoundFilter;


    var _operators = {
        isEqualTo: "==",
        isGreaterThan: ">",
        isGreaterThanEqualTo: ">=",
        isLessThan: "<",
        isLessThanEqualTo: "<=",
        like: "like",
        match: "match",
        between: "between",
        withinCircle: "within_circle",
        withinPolygon: "within_polygon",
        or: "or",
        and: "and",
        taggedWithAll: "tagged_with_all",
        taggedWithOneOrMore: "tagged_with_one_or_more"
    };

    var _primitiveFieldValue = function(value, type) {

        if (value === null || value === undefined || value.length === 0) throw new Error("Specify value");

        this.value = value;

        if (type) this.type = type;
        else this.type = typeof this.value; 

        if (this.type === 'number') {
          if (!_type.isNumeric(this.value)) throw new Error("Value should be numeric for filter expression");  
        }

        this.getValue = function() {
            if (this.type === 'number' || _type.isBoolean(this.value) || _type.isNumber(this.value)) return this.value;  
            else if (this.type === 'object' && _type.isDate(this.value)) return "datetime('" + Appacitive.Date.toISOString(this.value) + "')";
            else if (this.type == 'object' && this.value instanceof Appacitive.GeoCoord) return value.toString();
            else return "'" + this.value.toString() + "'"
        };
    };

    var _dateFieldValue = function(value) {
        this.value = value;
        
        this.getValue = function() {
            if (this.value instanceof Date) return "date('" + Appacitive.Date.toISODate(this.value) + "')";
            else return "date('" + this.value + "')";
        };
    };

    var _timeFieldValue = function(value) {
        this.value = value;
        
        this.getValue = function() {
            if (this.value instanceof Date) return "time('" + Appacitive.Date.toISOTime(this.value) + "')";
            else return "time('" + this.value + "')";
        };
    };

    var _dateTimeFieldValue = function(value) {
        this.value = value;
        
        this.getValue = function() {
            if (this.value instanceof Date) return "datetime('" + Appacitive.Date.toISOString(this.value) + "')";
            else return "datetime('" + this.value + "')";
        };
    };

    var _fieldFilterUtils = function(type, name, context) { 

        if (!context) context = this;

        context.type = type;

        context.name = name;

        /* Helper functions for EqualTo */
        context.equalTo = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isEqualTo });
        };


        /* Helper functions for GreaterThan */
        context.greaterThan = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isGreaterThan });
        };


        /* Helper functions for GreaterThanEqualTo */
        context.greaterThanEqualTo = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isGreaterThanEqualTo });
        };

        /* Helper functions for LessThan */
        context.lessThan = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isLessThan });
        };

        /* Helper functions for LessThanEqualTo */
        context.lessThanEqualTo = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isLessThanEqualTo });
        };

        /* Helper functions for string operations */
        context.like = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue("*" + value + "*"), operator: _operators.like });
        };

        context.match = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue("*" + value + "*"), operator: _operators.match });
        };

        context.startsWith = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value + "*"), operator: _operators.like });
        };

        context.endsWith = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue("*" + value), operator: _operators.like });
        };

        context.contains = function(values) {
            return new _containsFilter({ field: this.name, fieldType: this.type, value: values, operator: _operators.isEqualTo });
        };

        /* Helper functions for between */
        context.between = function(val1, val2) {
            return new _betweenFilter({ field: this.name, fieldType: this.type, val1: new _primitiveFieldValue(val1), val2: new _primitiveFieldValue(val2), operator: _operators.between });
        };

        /*Helper functionf for geolocation search */
        context.withinCircle = function(geoCoord, distance, unit) {
            return new _radialFilter({ field: this.name, fieldType: this.type, geoCoord: geoCoord, distance: distance, unit: unit, operator: _operators.withinCircle });
        };

        context.withinPolygon = function(geoCoords) {
            return new _polygonFilter({ field: this.name, fieldType: this.type, geoCoords: geoCoords, operator: _operators.withinPolygon });
        };
    };

    var _propertyExpression = function(name) {
        
        if (!name || name.length === 0) throw new Error("Specify field name");
        
        this.field = name;

        _fieldFilterUtils("property", name, this);

        return this;
    };

    var _aggregateExpression = function(name) {
        
        if (!name || name.length === 0) throw new Error("Specify field name");
        
        this.field = name;

        var _fieldFilters = new _fieldFilterUtils("aggregate", name);

        this.equalTo = function(value) {
            return _fieldFilters.equalTo(value);
        };

        this.greaterThan = function(value) {
            return _fieldFilters.greaterThan(value);
        };

        this.greaterThanEqualTo = function(value) {
            return _fieldFilters.greaterThanEqualTo(value);
        };

        this.lessThan = function(value) {
            return _fieldFilters.lessThan(value);
        };

        this.lessThanEqualTo = function(value) {
            return _fieldFilters.lessThanEqualTo(value);
        };

        this.between = function(val1, val2) {
            return _fieldFilters.between(val1, val2);
        };

        return this;
    };

    var _attributeExpression = function(name) {
        if (!name || name.length === 0) throw new Error("Specify field name");
        
        this.field = name;

        var _fieldFilters = new _fieldFilterUtils("attribute", name);

        /* Helper functions for string operations */
        this.like = function(value) {
            return _fieldFilters.like(value);
        };

        this.like = function(value) {
            return _fieldFilters.match(value);
        };

        this.startWith = function(value) {
            return _fieldFilters.startsWith(value);
        };

        this.endsWith = function(value) {
            return _fieldFilters.endsWith(value);
        };

        this.equalTo = function(value) {
            return _fieldFilters.equalTo(value);
        };        

        this.contains = function(values) {
            return _fieldFilters.contains(values);
        };

        return this;
    };

    Appacitive.Filter = {
        Property: function(name) {
            return new _propertyExpression(name);
        },
        Aggregate: function(name) {
            return new _aggregateExpression(name);
        },
        Attribute: function(name) {
            return new _attributeExpression(name);
        },
        Or: function() {
            return new _compoundFilter(_operators.or, arguments); 
        },
        And: function() {
            return new _compoundFilter(_operators.and, arguments); 
        },
        taggedWithOneOrMore: function(tags) {
            return new _tagFilter({ tags: tags, operator: _operators.taggedWithOneOrMore });
        },
        taggedWithAll: function(tags) {
            return new _tagFilter({ tags: tags, operator: _operators.taggedWithAll });
        }
    };

})(global);(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    Appacitive.Queries = {};

    // basic query for contains pagination
    /** 
    * @constructor
    **/
    var PageQuery = function(o) {
        var options = o || {};
        var _pageNumber = 1;
        var _pageSize = 20;

        //define getter and setter for pageNumber
        this.pageNumber =  function() { 
            if (arguments.length == 1) {
                _pageNumber = arguments[0] || 1;
                return this;
            }
            return _pageNumber; 
        };

        //define getter and setter for pageSize
        this.pageSize =  function() { 
            if (arguments.length == 1) {
                _pageSize = arguments[0] || 20;
                return this;
            }
            return _pageSize; 
        };

        this.pageNumber(options.pageNumber);
        this.pageSize(options.pageSize);
    };
    PageQuery.prototype.toString = function() {
        return 'psize=' + this.pageSize() + '&pnum=' + this.pageNumber();
    };

    // sort query
    /** 
    * @constructor
    **/
    var SortQuery = function(o) {
        var options = o || {};
        var _orderBy = null;
        var _isAscending = false;

        //define getter/setter for orderby
        this.orderBy =  function() { 
            if (arguments.length === 1 && _type.isString(arguments[0])) {
                _orderBy = arguments[0];
                return this;
            }
            return _orderBy; 
        };

        //define getter for isAscending
        this.isAscending =  function() { 
            if (arguments.length === 1) {
                _isAscending = (arguments[0] === undefined || arguments[0] == null) ? false : arguments[0];
                return this;
            }
            return _isAscending; 
        };

        this.orderBy(options.orderBy);
        this.isAscending(options.isAscending);
    };
    SortQuery.prototype.toString = function() {
        if (this.orderBy() && this.orderBy().length > 0) {
            return 'orderBy=' + this.orderBy() + '&isAsc=' + this.isAscending();
        } else {
            return '';
        }
    };

    // base query
    /** 
    * @constructor
    **/
    var BasicQuery = function(o) {

        var options = o || {};

        //set filters , freetext and fields
        var _filter = '';
        var _freeText = '';
        var _fields = '';
        var _queryType = options.queryType || 'BasicQuery';
        var _pageQuery = new PageQuery(o);
        var _sortQuery = new SortQuery(o);
        var _entityType = options.type || options.relation;
        var _etype = (options.relation) ? 'connection' : 'object';
        
        var self = this;

        // 
        if (options.entity) this.entity = options.entity;

        // define getter for type (object/connection)
        this.type = function() { return _etype; };

        // define getter for basetype (type/relation)
        this.entityType = function() { return _entityType; };

        // define getter for querytype (basic,connectedobjects etc)
        this.queryType = function() { return _queryType; };

        // define getter for pagequery 
        this.pageQuery = function() { return _pageQuery; };

        
        // define getter and setter for pageNumber
        this.pageNumber =  function() { 
            if (arguments.length === 1) {
                _pageQuery.pageNumber(arguments[0]);
                return this;
            }
            return _pageQuery.pageNumber(); 
        };

        // define getter and setter for pageSize
        this.pageSize =  function() { 
            if (arguments.length === 1) {
                _pageQuery.pageSize(arguments[0]);
                return this;
            }
            return _pageQuery.pageSize(); 
        };

        // define getter for sortquery
        this.sortQuery = function() { return _sortQuery; };

        // define getter and setter for orderby
        this.orderBy =  function() { 
            if (arguments.length === 1) {
                _sortQuery.orderBy(arguments[0]);
                return this;
            }
            return _sortQuery.orderBy(); 
        };

        // define getter and setter for isAscending
        this.isAscending =  function() { 
            if (arguments.length === 1) {
                _sortQuery.isAscending(arguments[0]);
                return this;
            }
            return _sortQuery.isAscending(); 
        };

        // define getter and setter for filter
        this.filter =  function() { 
            if (arguments.length === 1) {
                _filter = arguments[0];
                return this;
            }
            return _filter; 
        };      
        
        // define getter and setter for freetext
        this.freeText =  function() { 
            if (arguments.length === 1) {
                var value = arguments[0];
                if (_type.isString(value)) _freeText = arguments[0];
                else if (_type.isArray(value) && value.length) _freeText = arguments[0].join(' ');
                return this;
            }
            return _freeText; 
        };      
        
        // define fields
        this.fields = function() {
            if (arguments.length === 1) {
                var value = arguments[0];
                if (_type.isString(value)) _fields = value;
                else if (_type.isArray(value) && value.length) _fields = value.join(',');
                return this;
            } else {
                return _fields;
            }
        };

        // set filters , freetext and fields
        this.filter(options.filter || '');
        this.freeText(options.freeText || '');
        this.fields(options.fields || '');

        this.setFilter = function() { this.filter(arguments[0]); };
        this.setFreeText = function() { this.freeText(arguments[0]); };
        this.setFields = function() { this.fields(arguments[0]); };

        this.extendOptions = function(changes) {
            for (var key in changes) {
                options[key] = changes[key];
            }
            _pageQuery = new PageQuery(options);
            _sortQuery = new SortQuery(options);
            return this;
        };

        this.getQueryString = function() {

            var finalUrl = _pageQuery.toString();

            var sortQuery =  _sortQuery.toString();

            if (sortQuery) finalUrl += '&' + sortQuery;

            
            if (this.filter()) {
                var filter = encodeURIComponent(this.filter().toString());
                if (filter.trim().length > 0) finalUrl += '&query=' + filter;
            }

            if (this.freeText() && this.freeText().trim().length > 0) {
                finalUrl += "&freetext=" + encodeURIComponent(this.freeText()) + "&language=en";
            }

            if (this.fields() && this.fields().trim().length > 0) {
                finalUrl += "&fields=" + this.fields();
            }

            return finalUrl;
        };

        this.toUrl = function() {
            return {
                url: Appacitive.config.apiBaseUrl + _etype + '/' + _entityType + '/find/all?' + this.getQueryString(),
                description: 'FindAll ' + _entityType + ' ' + _etype + 's'
            }
        };

        this.toRequest = function(options) {
            var r = new Appacitive.HttpRequest();
            var obj = this.toUrl();
            r.url = obj.url;
            r.options = options;
            r.description = obj.description;
            r.method = 'get';
            return r;
        };

        this.getOptions = function() {
            var o = {};
            for (var key in this) {
                if (this.hasOwnProperty(key) && !_type.isFunction(this[key])) {
                    o[key] = this[key];
                }
            }
            return o;
        };

        this._setPaging = function(pi) {
            if (pi) {
                _pageQuery.pageNumber(pi.pagenumber);
                _pageQuery.pageSize(pi.pagesize);
                
                this.results = this.results || [];

                this.results.isLastPage = false;
                this.results.total = pi.totalrecords;
                this.results.pageNumber = pi.pagenumber;
                this.results.pageSize = pi.pagesize;
                
                if ((pi.pagenumber * pi.pagesize) >= pi.totalrecords) {
                    this.results.isLastPage = true;
                }
            }
        };

        var _parse = function(entities, metadata) {
            var entityObjects = [];
            if (!entities) entities = [];
            var eType = (_etype === 'object') ? 'Object' : 'Connection';

            return Appacitive[eType]._parseResult(entities, options.entity, metadata);
        };

        this.fetch = function(opts) {
            var promise = Appacitive.Promise.buildPromise(opts);

            var request = this.toRequest(opts);
            request.onSuccess = function(d) {
               self.results = _parse(d[_etype + 's'], d.__meta);
               self._setPaging(d.paginginfo);

               promise.fulfill(self.results, d.paginginfo);
            };
            request.promise = promise;
            request.entity = this;
            return Appacitive.http.send(request);
        };

        /**
         * Returns a new instance of Appacitive.Collection backed by this query.
         * @param {Array} items An array of instances of <code>Appacitive.Object</code>
         *     with which to start this Collection.
         * @param {Object} options An optional object with Backbone-style options.
         * Valid options are:<ul>
         *   <li>model: The Appacitive.Object subclass that this collection contains.
         *   <li>query: An instance of Appacitive.Queries to use when fetching items.
         *   <li>comparator: A string property name or function to sort by.
         * </ul>
         * @return {Appacitive.Collection}
         */
        this.collection = function(items, opts) {
            opts = opts || {};
            items = items;
            if (_type.isObject(items)) opts = items, items = null;

            if (!items) items = this.results ? this.results : [];

            var model = options.entity;

            if (!model && items.length > 0 && items[0] instanceof Appacitive.BaseObject) {
                var eType = items[0].type == 'object'  ? 'Object' : 'Connection';
                model = Appacitive[eType]._getClass(items[0].className);
            }

            if (!model) {
                var eType = (_etype === 'object') ? 'Object' : 'Connection';
                model = Appacitive[eType]._getClass(this[eType]);
            }

            return new Appacitive.Collection(items, _extend(opts, {
                model: model,
                query: this
            }));
        };

        this.fetchNext = function(options) {
            var pNum = this.pageNumber();
            this.pageNumber(++pNum);
            return this.fetch(options);
        };

        this.fetchPrev = function(options) {
            var pNum = this.pageNumber();
            pNum -= 1;
            if (pNum <= 0) pNum = 1;
            this.pageNumber(pNum);
            return this.fetch(options);
        };

        this.count = function(options) {
            var promise = Appacitive.Promise.buildPromise(options);

            var _queryRequest = this.toRequest(options);
            _queryRequest.onSuccess = function(data) {
                data = data || {};
                var pagingInfo = data.paginginfo;

                var count = 0;
                if (!pagingInfo) {
                    count = 0;
                } else {
                    count = pagingInfo.totalrecords;
                }
                promise.fulfill(count);
            };
            _queryRequest.promise = promise;
            _queryRequest.entity = this;
            return Appacitive.http.send(_queryRequest);
        };
    };

    /** 
    * @constructor
    **/
    Appacitive.Query = BasicQuery;

    /** 
    * @constructor
    **/
    Appacitive.Queries.FindAllQuery = function(options) {

        options = options || {};

        if (!options.type && !options.relation) throw new Error('Specify either type or relation for basic filter query');

        options.queryType = 'FindAllQuery';

        BasicQuery.call(this, options);

        return this;
    };

    Appacitive.Queries.FindAllQuery.prototype = new BasicQuery();

    Appacitive.Queries.FindAllQuery.prototype.constructor = Appacitive.Queries.FindAllQuery;

    /** 
    * @constructor
    **/
    Appacitive.Queries.ConnectedObjectsQuery = function(options) {

        options = options || {};

        if (!options.relation) throw new Error('Specify relation for connected objects query');
        if (!options.objectId) throw new Error('Specify objectId for connected objects query');
        if (!options.type) throw new Error('Specify type of object id for connected objects query');
        
        var type = options.type;
        delete options.type;

        options.queryType = 'ConnectedObjectsQuery';

        BasicQuery.call(this, options);

        this.objectId = options.objectId;
        this.relation = options.relation;
        this.type = type;
        if (options.object instanceof Appacitive.Object) this.object = options.object;

        this.returnEdge = true;
        if (options.returnEdge !== undefined && options.returnEdge !== null && !options.returnEdge) this.returnEdge = false;
        
        this.label = '';
        var self = this;

        if (_type.isString(options.label) && options.label.length > 0) this.label = '&label=' + options.label;

        this.toUrl = function() {
            return {
                url: Appacitive.config.apiBaseUrl + 'connection/' + this.relation + '/' + this.type + '/' + this.objectId + '/find?' +
                        this.getQueryString() + this.label + '&returnEdge=' + this.returnEdge,
                description: 'GetConnectedObjects for relation ' + this.relation + ' of type ' + this.type + ' for object ' + this.objectId
            }; 
        };


        var parseNodes = function(nodes, endpointA, nodeMeta, edgeMeta) {
            var objects = [];
            nodes.forEach(function(o) {
                var edge = o.__edge;
                delete o.__edge;

                var tmpObject = Appacitive.Object._create(_extend({ __meta: nodeMeta }, o), true);

                if (edge) {
                    edge.__endpointa = endpointA;
                    edge.__endpointb = {
                        objectid: o.__id,
                        label: edge.__label,
                        type: o.__type
                    };
                    delete edge.label;
                    tmpObject.connection = Appacitive.Connection._create(_extend({ __meta: edgeMeta }, edge), true);
                }
                objects.push(tmpObject);
            });
            
            if (self.object) self.object.children[self.relation] = objects;

            return objects;
        };

        this.fetch = function(opts) {
            var promise = Appacitive.Promise.buildPromise(opts);
            
            var request = this.toRequest(opts);
            request.onSuccess = function(d) {
                var _parse = parseNodes;
                self.results = _parse(d.nodes ? d.nodes : [], { objectid : options.objectId, type: type, label: d.parent }, d.__nodemeta, d.__edgemeta);
                self._setPaging(d.paginginfo);

                promise.fulfill(self.results, d.paginginfo);   
            };
            request.promise = promise;
            request.entity = this;
            return Appacitive.http.send(request);
        };

        return this;
    };

    Appacitive.Queries.ConnectedObjectsQuery.prototype = new BasicQuery();

    Appacitive.Queries.ConnectedObjectsQuery.prototype.constructor = Appacitive.Queries.ConnectedObjectsQuery;

    /** 
    * @constructor
    **/
    Appacitive.Queries.GetConnectionsQuery = function(options) {

        options = options || {};

        if (!options.relation) throw new Error('Specify relation for GetConnectionsQuery query');
        if (!options.objectId) throw new Error('Specify objectId for GetConnectionsQuery query');
        if (!options.label || options.label.trim().length === 0) throw new Error('Specify label for GetConnectionsQuery query');
        if (options.type) delete options.type;

        options.queryType = 'GetConnectionsQuery';

        BasicQuery.call(this, options);

        this.objectId = options.objectId;
        this.relation = options.relation;
        this.label = options.label;

        this.toUrl = function() {
            return {
                url: Appacitive.config.apiBaseUrl + 'connection/' + this.relation + '/find/all?' +
                this.getQueryString() + 
                '&objectid=' + this.objectId +
                '&label=' + this.label,
                description: 'FindAllConnections for relation ' + this.relation + ' from object id '  + this.objectId
            };
        };

        return this;
    };

    Appacitive.Queries.GetConnectionsQuery.prototype = new BasicQuery();

    Appacitive.Queries.GetConnectionsQuery.prototype.constructor = Appacitive.Queries.GetConnectionsQuery;

    /** 
    * @constructor
    **/
    Appacitive.Queries.GetConnectionsBetweenObjectsQuery = function(options, queryType) {

        options = options || {};

        delete options.entity;

        if (!options.objectAId || !_type.isString(options.objectAId) || options.objectAId.length === 0) throw new Error('Specify valid objectAId for GetConnectionsBetweenObjectsQuery query');
        if (!options.objectBId || !_type.isString(options.objectBId) || options.objectBId.length === 0) throw new Error('Specify objectBId for GetConnectionsBetweenObjectsQuery query');
        if (options.type) delete options.type;

        options.queryType = queryType || 'GetConnectionsBetweenObjectsQuery';

        BasicQuery.call(this, options);

        this.objectAId = options.objectAId;
        this.objectBId = options.objectBId;
        this.label = (this.queryType() === 'GetConnectionsBetweenObjectsForRelationQuery' && options.label && _type.isString(options.label) && options.label.length > 0) ? '&label=' + options.label : '';
        this.relation = (options.relation && _type.isString(options.relation) && options.relation.length > 0) ? options.relation + '/' : '';

        this.toUrl = function() {
            return {
                url: Appacitive.config.apiBaseUrl + 'connection/' + this.relation + 'find/' + this.objectAId + '/' + this.objectBId + '?'
                            + this.getQueryString() + this.label,
                description: 'FindConnectionBetween for relation ' + this.relation + ' between object ids '  + this.objectAId + ' and ' + this.objectBId
            };
        };

        return this;
    };

    Appacitive.Queries.GetConnectionsBetweenObjectsQuery.prototype = new BasicQuery();

    Appacitive.Queries.GetConnectionsBetweenObjectsQuery.prototype.constructor = Appacitive.Queries.GetConnectionsBetweenObjectsQuery;

    /** 
    * @constructor
    **/
    Appacitive.Queries.GetConnectionsBetweenObjectsForRelationQuery = function(options) {
        
        options = options || {};
        
        if (!options.relation) throw new Error('Specify relation for GetConnectionsBetweenObjectsForRelationQuery query');
        
        var inner = new Appacitive.Queries.GetConnectionsBetweenObjectsQuery(options, 'GetConnectionsBetweenObjectsForRelationQuery');

        inner.fetch = function(opts) {
            var promise = Appacitive.Promise.buildPromise(opts);

            var request = this.toRequest(opts);
            request.onSuccess = function(d) {
                inner.results = d.connection ? [Appacitive.Connection._create(_extend({ __meta: d.__meta }, d.connection), true, options.entity)] :  null
                promise.fulfill(inner.results ? inner.results[0] : null);
            };
            request.promise = promise;
            request.entity = this;
            return Appacitive.http.send(request);
        };

        return inner;
    };

    /** 
    * @constructor
    **/
    Appacitive.Queries.InterconnectsQuery = function(options) {

        options = options || {};

        delete options.entity;

        if (!options.objectAId || !_type.isString(options.objectAId) || options.objectAId.length === 0) throw new Error('Specify valid objectAId for InterconnectsQuery query');
        if (!options.objectBIds || !_type.isArray(options.objectBIds) || !(options.objectBIds.length > 0)) throw new Error('Specify list of objectBIds for InterconnectsQuery query');
        if (options.type) delete options.type;

        options.queryType = 'InterconnectsQuery';

        BasicQuery.call(this, options);

        this.objectAId = options.objectAId;
        this.objectBIds = options.objectBIds;
        
        this.toRequest = function(options) {
            var r = new Appacitive.HttpRequest();
            var obj = this.toUrl();
            r.url = obj.url;
            r.options = options;
            r.description = obj.description;
            r.method = 'post';
            r.data = {
                object1id: this.objectAId,
                object2ids: this.objectBIds
            };
            return r;
        };

        this.toUrl = function() {
            return {
                url: Appacitive.config.apiBaseUrl + 'connection/interconnects?' + this.getQueryString(),
                description: 'GetInterConnections between objects'
            };
        };

        return this;
    };

    Appacitive.Queries.InterconnectsQuery.prototype = new BasicQuery();

    Appacitive.Queries.InterconnectsQuery.prototype.constructor = Appacitive.Queries.InterconnectsQuery;


    /** 
    * @constructor
    **/
    Appacitive.Queries.GraphQuery = function(name, placeholders) {
        
        if (!name || name.length === 0) throw new Error("Specify name of filter query");
        
        this.name = name;
        this.data = { };
        this.queryType = 'GraphFilterQuery';

        if (placeholders) { 
            this.data.placeholders = placeholders;
            for (var ph in this.data.placeholders) {
                this.data.placeholders[ph] = this.data.placeholders[ph];
            }
        }
        
        this.toRequest = function(options) {
            var r = new Appacitive.HttpRequest();
            var obj = this.toUrl();
            r.url = obj.url;
            r.options = options;
            r.description = obj.description;
            r.method = 'post';
            r.data = this.data;
            return r;
        };

        this.toUrl = function() {
            return {
                url: Appacitive.config.apiBaseUrl + 'search/' + this.name + '/filter',
                description: 'Filter Query with name ' + this.name
            };
        };

        this.fetch = function(options) {
            var promise = Appacitive.Promise.buildPromise(options);

            var request = this.toRequest(options);
            request.onSuccess = function(d) {
                promise.fulfill(d.ids ? d.ids : []);
            };
            request.promise = promise;
            request.entity = this;
            return Appacitive.http.send(request);
        };

    };

    /** 
    * @constructor
    **/
    Appacitive.Queries.GraphAPI = function(name, ids, placeholders) {

        if (!name || name.length === 0) throw new Error("Specify name of project query");
        if (!ids || !ids.length) throw new Error("Specify ids to project");
        
        this.name = name;
        this.data = { ids: ids };
        this.queryType = 'GraphProjectQuery';
        var self = this;

        if (placeholders) { 
            this.data.placeholders = placeholders;
            for (var ph in this.data.placeholders) {
                this.data.placeholders[ph] = this.data.placeholders[ph];
            }
        }

        this.toRequest = function(options) {
            var r = new Appacitive.HttpRequest();
            var obj = this.toUrl();
            r.url = obj.url;
            r.description = obj.description;
            r.method = 'post';
            r.data = this.data;
            r.options = options;
            return r;
        };

        this.toUrl = function() {
            return {
                url: Appacitive.config.apiBaseUrl + 'search/' + this.name + '/project',
                description: 'Project Query with name ' + this.name
            };
        };

        var _parseResult = function(result) {
            var root;
            for (var key in result) {
                if (key !== 'status') {
                    root = result[key];
                    break;
                }
            }
            var parseChildren = function(obj, parentLabel, parentId, nodeMeta, edgeMeta) {
                var props = [];
                obj.forEach(function(o) {
                    var children = o.__children;
                    delete o.__children;
                    
                    var edge = o.__edge;
                    delete o.__edge;

                    var tmpObject = Appacitive.Object._create(_extend({ __meta: nodeMeta }, o), true);
                    tmpObject.children = {};
                    for (var key in children) {
                        tmpObject.children[key] = [];
                        tmpObject.children[key] = parseChildren(children[key].values, children[key].parent, tmpObject.id, children[key].__nodemeta, children[key].__edgemeta);
                    }

                    if (edge) {
                        edge.__endpointa = {
                            objectid : parentId,
                            label: parentLabel
                        };
                        edge.__endpointb = {
                            objectid: tmpObject.id,
                            label: edge.__label
                        };
                        delete edge.__label;
                        tmpObject.connection = Appacitive.Connection._create(_extend({ __meta: edgeMeta }, edge), true);
                    }
                    props.push(tmpObject);
                });
                return props;
            };
            return parseChildren(root.values, null, null, root.__nodemeta);
        };


        this.collection = function(items, opts) {
            opts = opts || {};
            items = items;
            if (_type.isObject(items)) opts = items, items = null;

            if (!items) items = this.results ? ths.results : [];

            var model;

            if (items.length > 0 && items[0] instanceof Appacitive.BaseObject) {
                model = Appacitive.Object._getClass(items[0].className);
            }

            return new Appacitive.Collection(items, _extend(opts, {
                model: model,
                query: this
            }));
        };

        this.fetch = function(options) {
            
            var promise = Appacitive.Promise.buildPromise(options);

            var request = this.toRequest(options);
            request.onSuccess = function(d) {
                self.results = _parseResult(d);
                promise.fulfill(self.results);
            };
            request.promise = promise;
            request.entity = this;
            return Appacitive.http.send(request);
        };
    };

})(global);(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    //Fields on which set operation is allowed
    var _allowObjectSetOperations = ["__link", "__endpointa", "__endpointb"];

    var _allowObjectEncode = ["__endpointa", "__endpointb"];

    var __privateMeta = { "__utcdatecreated": "datetime", "__utclastupdateddate": "datetime" };

    var isString = function(val) {
        return (_type.isString(val) || _type.isNumber(val) || _type.isBoolean(val));
    };

    var isGeocode = function(val) {
        return (val instanceof Appacitive.GeoCoord);
    };

    var isEncodable = function(val) {
        return (isString(val) || _type.isDate(val) || isGeocode(val));
    };

    var getMeta = function(attrs) {
        attrs = attrs || {};
        var meta = {};
        for (var m in attrs.__meta) {
            attrs.__meta[m].forEach(function(p) {
                meta[p] = m;
            });
        }

        return meta;
    };

    var _types = {
        "integer": function(value) { 
            if (value) {
                var res = parseInt(value);
                if (!isNaN(res)) return res;
            }
            return value;
        }, "decimal": function(value) { 
            if (value) {
                var res = parseFloat(value);
                if (!isNaN(res)) return res;
            }
            return value;
        }, "boolean": function(value) { 
            if (_type.isBoolean(value)) return value;
            if (value !== undefined && value !== null && (value.toString().toLowerCase() === 'true' || value === true || value > 0)) return true;
            return false;
        }, "date": function(value) { 
            if (_type.isDate(value)) return value;
            if (value) {
                var res = Appacitive.Date.parseISODate(value);
                if (res) return res;
            }
            return value;
        }, "datetime": function(value) { 
            if (_type.isDate(value)) return value;
            if (value) {
                var res = Appacitive.Date.parseISODate(value);
                if (res) return res;
            }
            return value;
        }, "time": function(value) { 
            if (_type.isDate(value)) return value;
            if (value) {
                var res = Appacitive.Date.parseISOTime(value);
                if (res) return res;
            }
            return value;
        }, "string": function(value) { 
            if (value) return value.toString();
            return value;
        }, "geocode": function(value) {

            if (isGeocode(value)) return value;

            // value is not string or its length is 0, return false
            if (!_type.isString(value) || value.trim().length == 0) return false;
              
            // Split value string by ,
            var split = value.split(',');

            // split length is not equal to 2 so return false
            if (split.length !== 2 ) return false;

            // validate the value
            return new Appacitive.GeoCoord(split[0], split[1]);
        }
    };

    _types["long"] = _types["integer"];
    _types["geography"] = _types["geocode"];
    _types["text"] = _types["string"];
    _types["bool"] = _types["boolean"];

    Appacitive.cast = _types;

    var encode = function(value) {
        if (_type.isNullOrUndefined(value)) return null; 
        else if (isString(value)) return ( value + '');
        else if (_type.isDate(value)) return Appacitive.Date.toISOString(value);
        else if (_type.isObject(value)) {
            if (isGeocode(value)) return value.toString();
            return (value.toJSON ? value.toJSON() : value);
        }
        return value;
    };

    Appacitive._encode = function(attrs) {
        var object = {};
        for (var key in attrs) {
            var value = attrs[key];
            if (_type.isArray(value)) {
                object[key] = [];
                value.forEach(function(v) {
                    var val = encode(v);
                    if (val) object[key].push(val);
                });
            } else {
                object[key] = encode(attrs[key]);
            }
        }
        return object;
    };

    Appacitive._decode = function(attrs) {
        var object = {}, meta = _extend({}, __privateMeta, getMeta(attrs));
        delete attrs.__meta;
        for (var key in attrs) {
            if (_type.isArray(attrs[key])) {
                object[key] = [];
                attrs[key].forEach(function(v) {
                    var val = (meta[key]) ? _types[meta[key]](v) : v;
                    object[key].push(val);
                });
            } else if (_type.isString(attrs[key])) {
                object[key] = (meta[key]) ? _types[meta[key]](attrs[key]) : attrs[key];
            } else {
                object[key] = attrs[key];
            }
        }
        return object;
    };

    //base object for objects and connections
    /**
    * @constructor
    **/
    var _BaseObject = function(objectOptions, optns) {

        var _snapshot = {};

        optns = optns || {};

        objectOptions = objectOptions || {};

        this.meta = {};

        //set default meta
        objectOptions.__meta = _extend(this.meta, objectOptions.__meta);

        if (optns && optns.parse) objectOptions = this.parse(objectOptions);
        
        if (_type.isObject(this.defaults) && !optns.setSnapShot) objectOptions = _extend({}, this.defaults, objectOptions);
        
        if (optns && optns.collection) this.collection = optns.collection;
        
        objectOptions = Appacitive._decode(objectOptions);

        var that = this;

        //Copy properties from source to destination object
        var _copy = function(src, des) {
            src.__meta = _extend(that.meta, src.__meta);
            that.meta = src.__meta;
            _mergePrivateFields(src);
            var obj = Appacitive._decode(src);
            for (var property in obj) {

                if (property == that.idAttribute) that.id = obj[property];

                if (_atomicProps[property]) delete _atomicProps[property];
                if (_multivaluedProps[property]) delete _multivaluedProps[property];
                if (_setOps[property]) delete _setOps[property];

                if (isEncodable(obj[property])) des[property] = obj[property];
                else if (_type.isObject(obj[property])) des[property] = _extend({}, des[property], obj[property]);
                else if (_type.isArray(obj[property])) {
                    
                    des[property] = [];
                
                    obj[property].forEach(function(v) {
                        if (isEncodable(v) || property == '__link') des[property].push(v);
                        else throw new Error("Multivalued property cannot add object or array as property of object");
                    });

                } else {
                    des[property] = obj[property];
                }
            }
        };

        var _mergePrivateFields = function(attrs, del) {
            var privateProps = ["id", "__id", "__utclastupdateddate", "__utcdatecreated", "__createdby", "__updatedby"];
            var map = { "id": "id", "__id" : "id", "__utclastupdateddate": "lastUpdatedAt", "__utcdatecreated": "createdAt", "__createdby": "createdBy", "__updatedby": "lastUpdatedBy" };
            privateProps.forEach(function(prop) {
                if (attrs[prop]) {
                    if ((prop === "__utcdatecreated" || prop === "__utclastupdateddate") && !_type.isDate(attrs[prop])) {
                        that[map[prop]] = Appacitive.Date.parseISODate(attrs[prop]);
                    }  else {
                        that[map[prop]] = attrs[prop];
                    }

                    if (del) delete attrs[prop];
                }
            });
        };

        this.base = Appacitive.Object.prototype;

        var __cid = parseInt(Math.random() * 100000000, 10);

        // Set client id
        this.cid = __cid;

        // Set id attribute
        this.idAttribute = '__id';

        //atomic properties
        var _atomicProps = {};

        //mutlivalued properties
        var _multivaluedProps = {};

        //list of properties on whom set operations performed
        var _setOps = {};

        var raw = {};
        _copy(objectOptions, raw);
        var object = raw;

        //will be used in case of creating an appacitive object for internal purpose
        if (optns.setSnapShot) _copy(object, _snapshot);
        
        if (!_snapshot[this.idAttribute] && raw[this.idAttribute]) _snapshot[this.idAttribute] = raw[this.idAttribute];

        // Set id property
        this.id = _snapshot[this.idAttribute];

        //Check whether __type or __relationtype is mentioned and set type property
        if (raw.__type) { 
            raw.__type = raw.__type.toLowerCase();
            this.entityType = 'type';
            this.type = 'object';
            this.className = raw.__type;
        } else if (raw.__relationtype) {
            raw.__relationtype = raw.__relationtype.toLowerCase();
            this.entityType = 'relation';
            this.type = 'connection';
            this.className = raw.__relationtype;
        }

        //attributes
        if (!object.__attributes) object.__attributes = {};
        if (!_snapshot.__attributes) _snapshot.__attributes = {};

        //tags
        var _removeTags = []; 
        if (!object.__tags) object.__tags = [];
        if (!_snapshot.__tags) _snapshot.__tags = [];

        //set attributes property
        this.attributes = object;

        //fields to be returned
        var _fields = '';

        //Set private property value in main object
        _mergePrivateFields(this.attributes);

        //Fileds to be ignored while update operation
        var _ignoreTheseFields = ["__id", "__revision", "__endpointa", "__endpointb", "__createdby", "__lastmodifiedby", "__type", "__relationtype", "__typeid", "__relationid", "__utcdatecreated", "__utclastupdateddate", "__tags", "__authType", "__link", "__acls", "__meta"];
        
        // parse api output to get error info
        var _getOutpuStatus = function(data) {
            data = data || {};
            data.message = data.message || 'Server error';
            data.code = data.code || '500';
            return data;
        };

        // converts object to json representation for data transfer
        this.toJSON = this.getObject = function() { 
            var obj = Appacitive._encode(_extend({ __meta: this.meta }, object)); 
            if (Object.prototype.hasOwnProperty("id")) obj.__id = this.id;
            return obj;
        };

        // Returns all properties of this object
        this.properties = function() {
            var properties = _extend({}, this.attributes);
            delete properties.__attributes;
            delete properties.__tags;
            return properties;
        };

        // accessor function for the object's attributes
        this.attr = function() {
            if (arguments.length === 0) {
                if (!object.__attributes) object.__attributes = {};
                return object.__attributes;
            } else if (arguments.length === 1) {
                if (!object.__attributes) object.__attributes = {};
                return object.__attributes[arguments[0]];
            } else if (arguments.length === 2) {
                if (!_type.isString(arguments[1]) && arguments[1] !== null)
                    throw new Error('only string values can be stored in attributes.');
                if (!object.__attributes) object.__attributes = {};
                object.__attributes[arguments[0]] = arguments[1];
            } else throw new Error('.attr() called with an incorrect number of arguments. 0, 1, 2 are supported.');

            triggerChangeEvent('__attributes');

            return object.__attributes;
        };

        //accessor function to get changed attributes
        var _getChangedAttributes = function() {
            if (!object.__attributes) return undefined;
            if (!_snapshot.__attributes) return object.__attributes;

            var isDirty = false;
            var changeSet = JSON.parse(JSON.stringify(_snapshot.__attributes));
            for (var property in object.__attributes) {
                if (object.__attributes[property] == null || object.__attributes[property] == undefined) {
                    changeSet[property] = null;
                    isDirty = true;
                } else if (object.__attributes[property] != _snapshot.__attributes[property]) {
                    changeSet[property] = object.__attributes[property];
                    isDirty = true;
                } else if (object.__attributes[property] == _snapshot.__attributes[property]) {
                    delete changeSet[property];
                }
            }
            if (!isDirty) return undefined;
            return changeSet;
        };

        this.getChangedAttributes = _getChangedAttributes;

        // accessor function for the object's aggregates
        this.aggregate = function() {
            var aggregates = {};
            for (var key in object) {
                if (!object.hasOwnProperty(key)) return;
                if (key[0] == '$') {
                    aggregates[key.substring(1)] = object[key];
                }
            }
            if (arguments.length === 0) return aggregates;
            else if (arguments.length == 1) return aggregates[arguments[0]];
            else throw new Error('.aggregates() called with an incorrect number of arguments. 0, and 1 are supported.');
        };

        this.tags = function()  {
            if (!object.__tags) return [];
            return object.__tags;
        };

        this.addTag = function(tag) {
            if (!tag || !_type.isString(tag) || !tag.length) return this;
            
            if (!object.__tags) object.__tags = [];

            object.__tags.push(tag);
            object.__tags = Array.distinct(object.__tags);

            if (!_removeTags || !_removeTags.length) {
                triggerChangeEvent('__tags');
                return this;
            } 

            var index = _removeTags.indexOf(tag);
            if (index != -1) _removeTags.splice(index, 1);

            triggerChangeEvent('__tags');

            return this;
        };

        this.removeTag = function(tag) {
            if (!tag || !_type.isString(tag) || !tag.length) return this;
            //tag = tag.toLowerCase();
            _removeTags.push(tag);
            _removeTags = Array.distinct(_removeTags);

            if (!object.__tags || !object.__tags.length) {
                triggerChangeEvent('__tags');
                return this;
            }

            var index = object.__tags.indexOf(tag);
            if (index != -1) object.__tags.splice(index, 1);

            triggerChangeEvent('__tags');

            return this;
        };

        var _getChangedTags = function() {
            if (!object.__tags) return undefined;
            if (!_snapshot.__tags) return object.__tags;

            var _tags = [];
            object.__tags.forEach(function(a) {
                if (_snapshot.__tags.indexOf(a) == -1)
                    _tags.push(a);
            });
            return _tags.length > 0 ? _tags : undefined;
        };

        this.getChangedTags = _getChangedTags;

        this.getRemovedTags = function() { return _removetags; };

        var setMutliItems = function(key, value, op, options) {

            if (!key || !_type.isString(key) ||  key.length === 0  || key.trim().indexOf('__') == 0 || key.trim().indexOf('$') === 0 || value == undefined || value == null) return this; 
            
            key = key.toLowerCase();

            try {

                var addItem = function(item) {
                    var val = item;
                    if (!isEncodable(val)) throw new Error("Multivalued property cannot have values of property as an object");

                    if (object[key] && _type.isArray(object[key])) {

                        if (op == 'additems') {
                            object[key].push(val);
                        } else if (op == 'adduniqueitems') {
                            var index = -1;

                            object[key].find(function(o, i) {  
                                if (_type.isEqual(o, val)) {
                                    index = i;
                                    return true;
                                } 
                                return false;
                            });
                            
                            if (index == -1) object[key].push(val);
                        } else if (op == 'removeitems') {
                            object[key].removeAll(val);
                        }
                    } else {
                        if (op != 'removeitems') object[key] = [val];
                    }

                    if (!_multivaluedProps[key]) _multivaluedProps[key] = { additems: [], adduniqueitems: [], removeitems: [] };

                    _multivaluedProps[key][op].push(val);
                };

                if (_type.isArray(value)) {
                    value.forEach(function(v) {
                        addItem(v);
                    });
                } else {
                    addItem(value);
                }

                triggerChangeEvent(key, options);

            } catch(e) {
                throw new Error("Unable to add item to " + key);
            }

            return that; 
        };

        this.add = function(key, value, options) {
            return setMutliItems.apply(this, [key, value, 'additems', options]);
        };

        this.addUnique = function(key, value, options) {
            return setMutliItems.apply(this, [key, value, 'adduniqueitems', options]);
        };

        this.remove = function(key, value, options) {
            return setMutliItems.apply(this, [key, value, 'removeitems', options]);
        };

        var hasChanged = function(property, prevValue, currValue, isInternal) {
            var changed = undefined;

            if (!_type.isEqual(currValue ,prevValue)) {
                if (property == '__tags') {
                    var changedTags = _getChangedTags();
                    if (changedTags && changedTags.length > 0) changed = changedTags; 
                } else if (property == '__attributes') {
                    var attrs = _getChangedAttributes();
                    if (!Object.isEmpty(attrs)) changed = attrs;
                } else {
                    if (_type.isArray(currValue)) {
                        if (_multivaluedProps[property] && !_setOps[property]) {
                            if (isInternal) {
                                changed = _multivaluedProps[property];
                            } else {
                                changed = currValue;
                            }
                        } else if (!currValue.equals(prevValue)) {
                            changed = currValue;
                        } 
                    } else if (_atomicProps[property] && !_setOps[property]) {
                        if (isInternal) {
                            changed = { incrementby : _atomicProps[property].value };
                        } else {
                            changed = currValue;
                        }
                    } else {
                        changed = currValue;
                    }
                }
            } 

            return changed;
        };

        var _getChanged = function(isInternal) {
            var isDirty = false;
            var changeSet = _extend({}, _snapshot);

            for (var p in changeSet) {
                if (p[0] == '$') delete changeSet[p];
            }

            for (var property in object) {
                var changed = hasChanged(property, changeSet[property], object[property], isInternal);

                if (changed == undefined) {
                    delete changeSet[property];
                } else {
                    isDirty = true;
                    changeSet[property] = changed;
                }
            }

            try {
                _ignoreTheseFields.forEach(function(c) {
                    if (changeSet[c]) delete changeSet[c];
                });
            } catch(e) {}

            if (isInternal) changeSet = Appacitive._encode(changeSet);

            var changedTags = _getChangedTags();
            if (isInternal) {
                if (changedTags && changedTags.length > 0) { 
                    changeSet["__addtags"] = changedTags; 
                    isDirty = true;
                }
                if (_removeTags && _removeTags.length > 0) {
                    changeSet["__removetags"] = _removeTags;
                    isDirty = true;
                }
            } else {
                if (changedTags && changedTags.length > 0) { 
                    changeSet["__tags"] = changedTags; 
                    isDirty = true;
                }
            }

            var attrs = _getChangedAttributes();
            if (attrs && !Object.isEmpty(attrs)) { 
                changeSet["__attributes"] = attrs;
                isDirty = true;
            } else delete changeSet["__attributes"];

            if (that.type == 'object' && that._aclFactory) {
                var acls = that._aclFactory.getChanged();
                if (acls) changeSet['__acls'] = acls;
            }

            if (isDirty && !Object.isEmpty(changeSet)) return changeSet;
            return false;
        };

        this.changed = function() {
            if (this.isNew()) return this.toJSON();
            return _getChanged();
        };

        this.hasChanged = function() {
            if (this.isNew()) return true;

            if (arguments.length === 0)
                return Object.isEmpty(_getChanged(true)) ? false : true;
            else if (arguments.length == 1 && _type.isString(arguments[0]) && arguments[0].length > 0)
                return (hasChanged(arguments[0]) == undefined) ? false : true;
            
            return false;
        };

        this.changedAttributes  = function() {
            if (this.isNew()) return this.toJSON();

            if (arguments.length === 0) {
                return _getChanged();
            } else if (arguments.length == 1 && _type.isArray(arguments[0]) && arguments[0].length) {
                var attrs = {};
                arguments[0].forEach(function(c) {
                    var value = hasChanged(c);
                    if (value != undefined) attrs.push(value);
                });
                return attrs;
            }
            return false;
        };

        this.previous = function() {
            if (this.isNew()) return null;

            if (arguments.length == 1 && _type.isString(arguments[0]) && arguments[0].length) {
                return _snapshot[arguments[0]]; 
            }
            return null;
        };

        this.previousAttributes = function() { 
            if (this.isNew()) return null; 
            return _extend({}, _snapshot); 
        };

        this.fields = function() {
            if (arguments.length == 1) {
                var value = arguments[0];
                if (_type.isString(value)) _fields = value;
                else if (_type.isArray(value)) _fields = value.join(',');
                return this;
            } else {
                return _fields;
            }
        };

        this.get = function(key, type) { 
            if (key) { 
                if (type && _types[type.toLowerCase()]) {
                    if (_types[type.toLowerCase()]) {
                        var res = _types[type.toLowerCase()](object[key]);
                        return res;
                    } else {
                        throw new Error('Invalid cast-type "' + type + '"" provided for get "' + key + '"');
                    }
                }
                return object[key];
            }
        };

        this.tryGet = function(key, value, type) {
            var res = this.get(key, type);
            if (res !== undefined) return res;
            return value;
        };

        var triggerChangeEvent = function(key, options) {
            if (options && !options.silent) {
                var changed = hasChanged(key, _snapshot[key], object[key]);

                if (changed[key] != undefined || (_ignoreTheseFields.indexOf(key) != -1)) {
                    var value = changed[key] || object[key];
                    // Trigger all relevant attribute changes.
                    that.trigger('change:' + key, that, value, {});
                    if (!options.ignoreChange) that.trigger('change', that, options);
                }
            }
        };

        var triggerDestroy = function(opts) {
            if (opts && !opts.silent) that.trigger('destroy', that, that.collection, opts);
        };

        var set = function(key, value, options) {

            if (!key || !_type.isString(key) ||  key.length === 0 || key.trim().indexOf('$') === 0) return this; 
            
            options = options || {};

            var oType = options.dataType;

            key = key.toLowerCase();

            try {

                if (_type.isNullOrUndefined(value)) { object[key] = null;}
                else if (isEncodable(value)) { object[key] = value; }
                else if (_type.isObject(value)) {
                    if (_allowObjectSetOperations.indexOf(key) !== -1) object[key] = value;
                    else throw new Error("Property cannot have value as an object");
                } else if (_type.isArray(value)) {
                    object[key] = [];

                    value.forEach(function(v) {
                        if (isEncodable(v)) object[key].push(v);
                        else throw new Error("Multivalued property cannot have values of property as an object");
                    });
                }

                delete _atomicProps[key];
                delete _multivaluedProps[key];
                delete _setOps[key];

                if (!_type.isEqual(object[key], _snapshot[key])) _setOps[key] = true;
            
                if (key == that.idAttribute) that.id = value; 

                return this;
            } catch(e) {
                throw new Error("Unable to set " + key);
            } 
        };

        this.set = function(key, val, options) {

            var attr, attrs, unset, changes, silent, changing, prev, current;

            if (key == null) return this;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (key == null || typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            options || (options = {});

            // Run validation.
            if (!this._validate(attrs, options)) return false;

            // Check for changes of `id`.
            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            _mergePrivateFields(attrs);

            var changed = false;

            // For each `set` attribute, update or delete the current value.
            for (attr in attrs) {
                val = attrs[attr];
                set.apply(this, [ attr, val, _extend({}, options, { ignoreChange: true }) ]);
            }

            if (options && !options.silent) {
                for (attr in attrs) {
                    var changedValue = hasChanged(attr, _snapshot[attr], object[attr]);
                    if ((changedValue != undefined) || (_ignoreTheseFields.indexOf(attr) != -1)) {
                        changed = true;
                        var value = object[key];
                        // Trigger relevant attribute change event.
                        that.trigger('change:' + key, that, value, {});
                    }
                }
            }

            if (changed) this.trigger('change', this, options);

            return this;
        };

        this.unset = function(key, options) {
            if (!key || !_type.isString(key) ||  key.length === 0 || key.indexOf('__') === 0) return this; 
            key = key.toLowerCase();
            delete object[key];
            triggerChangeEvent(key, options);
            return this;
        };

        // Run validation against the next complete set of model attributes,
        // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
        this._validate = function(attrs, options) {
            if (!options.validate || !this.validate || !_type.isFunction(this.validate)) return true;
            attrs = _extend({}, this.attributes, attrs);
            var error = this.validationError = this.validate(attrs, options) || null;
            if (!error) return true;
            this.trigger('invalid', this, error, _extend(options, {validationError: error}));
            return false;
        };

         // Check if the model is currently in a valid state.
        this.isValid = function(options) {
            return this._validate({}, _extend(options || {}, { validate: true }));
        };

        this.has = function(key) {
            if (!key || !_type.isString(key) ||  key.length === 0) return false; 
            if (object[key] && !_type.isUndefined(object[key])) return true;
            return false;
        };

        this.isNew = function() {
            return !this.has(this.idAttribute);
        };

        this.clone = function() {
            if (this.type == 'object') return Appacitive.Object._create(_extend({ __meta: this.meta }, this.toJSON()));
            return new Appacitive.connection._create(_extend({ __meta: this.meta }, this.toJSON()));
        };

        this.copy = function(properties, setSnapShot) { 
            if (properties) { 
                _copy(properties, object);
                if (setSnapShot) {
                    _copy(properties, _snapshot);
                }
            }
            return this;
        };

        this.mergeWithPrevious = function() {
            _copy(object, _snapshot);
            if (that._aclFactory) that._aclFactory.merge();
            _mergePrivateFields(_snapshot);
            _removeTags = [];
            _atomicProps = {};
            _multivaluedProps = {};
            _setOps = {};
            return this;
        };

        var _merge = function() {
            _copy(_snapshot, object);
            if (that._aclFactory) that._aclFactory.merge();
            _mergePrivateFields(object);
            _removeTags = [];
            _atomicProps = {};
            _multivaluedProps = {};
            _setOps = {};
        };

        this.rollback = function() {
            object = raw = {};
            _merge();
            return this;
        };

        var _atomic = function(key, amount, multiplier, options) {
            if (!key || !_type.isString(key) ||  key.length === 0 || key.indexOf('__') === 0) return this;

            key = key.toLowerCase();

            if (_type.isObject(object[key]) ||  _type.isArray(object[key])) {
                throw new Error("Cannot increment/decrement array/object");
            }

            try {
                if (_type.isObject(amount)) {
                    options = amount;
                    amount = multiplier;
                } else {
                    if (!amount || isNaN(Number(amount))) amount = multiplier;
                    else amount = Number(amount) * multiplier;
                }
                object[key] = isNaN(Number(object[key])) ? amount : Number(object[key]) + amount;

                if (!that.isNew()) {
                    _atomicProps[key] = { value : (_atomicProps[key] ? _atomicProps[key].value : 0) + amount };
                }

            } catch(e) {
                throw new Error('Cannot perform increment/decrement operation');
            }

            triggerChangeEvent(key, options);

            return that;
        };

        this.increment = function(key, amount, options) {
            return _atomic(key, amount, 1, options);
        };

        this.decrement = function(key, amount, options) {
            return _atomic(key, amount, -1, options);
        };

        /* crud operations  */

        /* save
           if the object has an id, then it has been created -> update
           else create */
        this._save = function() {
            if (this.id) return _update.apply(this, arguments);
            else return _create.apply(this, arguments);
        };

        // to create the object
        var _create = function(options) {

            options = options || {};

            var type = that.type;
            if (object.__type &&  (object.__type.toLowerCase() == 'user' ||  object.__type.toLowerCase() == 'device')) {
                type = object.__type.toLowerCase()
            }

            var clonedObject = that.toJSON();

            delete clonedObject.__meta;

            //remove __revision and aggregate poprerties
            for (var p in clonedObject) {
                if (p[0] == '$') delete clonedObject[p];
            }
            if (clonedObject["__revision"]) delete clonedObject["__revision"];
            
            if (type == 'object' && that._aclFactory) {
                var acls = that._aclFactory.getChanged();
                if (acls) clonedObject.__acls = acls;
            }

            if (clonedObject.__tags && clonedObject.__tags.length == 0) delete clonedObject.__tags;

            if (Object.isEmpty(clonedObject.__attributes)) delete clonedObject.__attributes;

            var request = new Appacitive._Request({
                method: 'PUT',
                type: type,
                op: 'getCreateUrl',
                args: [this.className, _fields],
                data: clonedObject,
                options: options,
                entity: that,
                onSuccess: function(data) {
                    var savedState = null;

                    if (data && data[type]) {
                        savedState = data[type];

                        _snapshot = Appacitive._decode(_extend({ __meta: _extend(that.meta, data.__meta) }, savedState));

                        that.id = object[that.idAttribute] = savedState[that.idAttribute];
                        
                        _merge();

                        if (that.type == 'connection') {
                            if (object.__endpointa.object) object.__endpointa.object.__meta = data.__ameta;
                            if (object.__endpointb.object) object.__endpointb.object.__meta = data.__bmeta;
                            that.parseConnection();
                        }
                        that.trigger('change:__id', that, that.id, { });

                        Appacitive.eventManager.fire(that.entityType + '.' + type + '.created', that, { object : that });

                        that.created = true;

                        if (!options.silent) that.trigger('sync', that, data[type], options);

                        request.promise.fulfill(that);
                    } else {
                        if (!options.silent) that.trigger('error', that, data.status, options);

                        Appacitive.eventManager.fire(that.entityType + '.' + type + '.createFailed', that, { error: data.status });
                        request.promise.reject(data.status, that);
                    }
                }
            });
                
            return request.send();
        };

        // to update the object
        var _update = function(options, promise) {

            if (!Appacitive.Promise.is(promise)) promise = Appacitive.Promise.buildPromise(options);

            var changeSet = _getChanged(true);

            options = options || {};

            if (!Object.isEmpty(changeSet)) {

                var type = that.type;
                
                var args = [that.className, (that.id) ? that.id : that.id, _fields];

                // for User and Device objects
                if (object && object.__type &&  ( object.__type.toLowerCase() == 'user' ||  object.__type.toLowerCase() == 'device')) { 
                    type = object.__type.toLowerCase();
                    args.splice(0, 1);
                }

                var request = new Appacitive._Request({
                    method: 'POST',
                    type: type,
                    op: 'getUpdateUrl',
                    args: args,
                    data: changeSet,
                    options: options,
                    entity: that,
                    onSuccess: function(data) {
                        if (data && data[type]) {
                            
                            _snapshot = Appacitive._decode(_extend({ __meta: _extend(that.meta, data.__meta) }, data[type]));

                            _merge();
                            
                            delete that.created;

                            if (!options.silent) that.trigger('sync', that, data[type], options);

                            Appacitive.eventManager.fire(that.entityType  + '.' + type + "." + that.id +  '.updated', that, { object : that });
                            request.promise.fulfill(that);
                        } else {
                            data = data || {};
                            data.status =  data.status || {};
                            data.status = _getOutpuStatus(data.status);
                            if (!options.silent) that.trigger('error', that, data.status, options);
                            Appacitive.eventManager.fire(that.entityType  + '.' + type + "." + that.id +  '.updateFailed', that, { object : data.status });
                            request.promise.reject(data.status, that);
                        }
                    }
                });
                
                return request.send();
            } else {
                promise.fulfill(that);
            }
            
            return promise;
        };

        var _fetch = function (options) {

            if (!that.id) throw new Error('Please specify id for get operation');
            
            options = options || [];

            var type = this.type;

            // for User and Device objects
            if (object && object.__type &&  ( object.__type.toLowerCase() == 'user' ||  object.__type.toLowerCase() == 'device')) { 
                type = object.__type.toLowerCase();
            }

            var request = new Appacitive._Request({
                method: 'GET',
                type: type,
                op: 'getGetUrl',
                args: [this.className, that.id, _fields],
                options: options,
                entity: that,
                onSuccess: function(data) {
                    if (data && data[type]) {
                        _snapshot = Appacitive._decode(_extend({ __meta: _extend(that.meta, data.__meta) }, data[type]));
                        _copy(_snapshot, object);
                        _mergePrivateFields(object);

                        if (that._aclFactory) that._aclFactory._rollback();
                        if (data.connection) {
                            if (!that.endpoints && (!that.endpointA || !that.endpointB)) {
                                that.setupConnection(object.__endpointa, object.__endpointb);
                            }
                        }

                        if (!options.silent) that.trigger('sync', that, data[type], options);

                        Appacitive.eventManager.fire(that.entityType  + '.' + type + "." + that.id +  '.updated', that, { object : that });
                        request.promise.fulfill(that);
                    } else {
                        data = data || {};
                        data.status =  data.status || {};
                        data.status = _getOutpuStatus(data.status);
                        request.promise.reject(data.status, that);
                    }
                }
            });
            return request.send();
        };

        // fetch ( by id )
        this._fetch = function(options) {
            return _fetch.apply(this ,[options]);
        };

        // delete the object
        this._destroy = function(opts) {
            opts = opts || {};

            var deleteConnections = opts.deleteConnections;
            
            if (_type.isBoolean(opts)) {
                deleteConnections = opts;
                opts = {};
            }

            if (!opts.wait) triggerDestroy(opts);

            // if the object does not have id set, 
            // just call success
            // else delete the object

            if (!that.id) return new Appacitive.Promise.buildPromise(opts).fulfill();

            var type = this.type;
            if (object.__type &&  (object.__type.toLowerCase() == 'user' ||  object.__type.toLowerCase() == 'device')) type = object.__type.toLowerCase()
            
            var request = new Appacitive._Request({
                method: 'DELETE',
                type: type,
                op: 'getDeleteUrl',
                args: [this.className, that.id, deleteConnections],
                options: opts,
                entity: this,
                onSuccess: function(data) {

                    if (data && data.status) {
                        object = {};
                        _snapshot = {};
                        
                        if (opts.wait) triggerDestroy(opts);
                        request.promise.fulfill(data.status);
                    } else {
                        data = data || {};
                        data.status =  data.status || {};
                        data.status = _getOutpuStatus(data.status);
                        request.promise.reject(data.status, that);
                    }
                }
            });
            return request.send();
        };
        this.del = this._destroy;

        if (this.type == 'object') {
            this._destroyWithConnections = function(options) {
                return this.destroy(_extend({ deleteConnections: true}, options));
            };
        }

    };

    _BaseObject.prototype.save = function() {
        return this._save.apply(this, arguments);
    };

    _BaseObject.prototype.fetch = function() {
        return this._fetch.apply(this, arguments);
    };

    _BaseObject.prototype.destroy = function() {
        return this._destroy.apply(this, arguments);
    };

    _BaseObject.prototype.destroyWithConnections = function() {
        return this._destroyWithConnections.apply(this, arguments);
    };

    Appacitive.BaseObject = _BaseObject;

    Appacitive.BaseObject._saveAll = function(objects, options, type) {
        var unsavedObjects = [], tasks = [];
        
        options = options || [];

        if (!_type.isArray(objects)) throw new Error("Provide an array of objects for Object.saveAll");     

        objects.forEach(function(o) {
            if (!(o instanceof Appacitive.BaseObject) && _type.isObject(o)) o = new Appacitive[type](o);
            if (unsavedObjects.find(function(x) { return x.id == o.id; })) return;
            unsavedObjects.push(o);

            tasks.push(o.save());
        });

        return Appacitive.Promise.when(tasks);
    };

    Appacitive.BaseObject.prototype.toString = function() {
        return JSON.stringify(this.getObject());
    };

    Appacitive.BaseObject.prototype.parse = function(resp, options) {
        return resp;
    };

    // Get the HTML-escaped value of an attribute.
    Appacitive.BaseObject.prototype.escape = function(attr) {
      return _.escape(this.get(attr));
    },

    Appacitive.Events.mixin(Appacitive.BaseObject.prototype);

})(global);
(function (global) {

    "use strict";

    var S4 = function () {
        return Math.floor(Math.random() * 0x10000).toString(16);
    };

    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    var _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };

    var encodeToBase64 = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }

        return output;
    };

    /**
     * @constructor
     **/
    global.Appacitive.GUID = function () {
        return encodeToBase64(
        S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()).toString();
    };

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    var accessTypes = ['allow', 'deny'];

    var states = ['create', 'read', 'update', 'delete', 'manageaccess'];

    var validatePermission = function(permissions) {
        var res = [];
        permissions.forEach(function(p) {
            if (_type.isString(p) && states.indexOf(p.toLowerCase()) != -1) {
                res.push(p.toLowerCase());
            }
        });

        return res;
    };

    Appacitive._Acl = function(o, setSnapshot) {

        var acls = o || [];     

        if (!_type.isArray(acls)) acls = [];

        var _snapshot = {} ;

        if (setSnapshot) {
            _snapshot = JSON.parse(JSON.stringify(acls));
        }

        acls = JSON.parse(JSON.stringify(acls));

        this.acls = acls;

        var changed = [];

        var setPermission = function(access, type, sid, permissions) {
            if (!sid) throw new Error("Specify valid user or usergroup");

            if ((sid instanceof Appacitive.Object) && sid.typeName == 'user' && !sid.isNew()) {
                sid = sid.id;
            } 

            var acl = acls.filter(function(a) { return  (a.sid == sid && a.type == type ); }), exists = false;

            if (!acl || acl.length == 0) {
                acl = { sid: sid, type: type, deny: [], allow: [] };
                acls.push(acl);
            }
            else acl = acl[0];
            
            if (!acl.allow) acl.allow = [];
            if (!acl.deny) acl.deny = [];

            permissions = validatePermission(permissions);

            var chAcl = changed.filter(function(a) { return (a.sid == sid && a.type == type); });
            if (!chAcl || chAcl.length == 0) {
                chAcl = { sid: sid, type: type };
                changed.push(chAcl);
            } else chAcl = chAcl[0];
            
            permissions.forEach(function(p) {
                for (var i = 0; i < accessTypes.length; i = i + 1) {
                    var ind = acl[accessTypes[i]].indexOf(p);
                    if (ind != -1) {
                        acl[accessTypes[i]].splice(ind, 1);
                        break;
                    }
                }

                if (access != 'dontcare') {
                    acl[access].push(p);
                }

                chAcl[p] = access;
            });

            return this;
        };

        var setPermissions = function(access, type, sids, permissions) {
            if (!sids) throw new Error("Please provide valid id or name for setting acls");
            if (!permissions) throw new Error("Please provide valid access permissions for setting acls");

            if (!_type.isArray(permissions)) permissions = [permissions];

            if (_type.isArray(sids)) {
                sids.forEach(function(sid) {
                    setPermission(access, type, sid, permissions);
                });
            } else {
                setPermission(access, type, sids, permissions); 
            }

            return this;
        };

        var setUpOps = function() {

            acls.allowUser = function(sids, permissions) {
                return setPermissions.apply(this, ['allow', 'user', sids, permissions]);
            };

            acls.allowGroup = function(sids, permissions) {
                return setPermissions.apply(this, ['allow', 'usergroup', sids, permissions]);
            };

            acls.denyUser = function(sids, permissions) {
                return setPermissions.apply(this, ['deny', 'user', sids, permissions]);
            };

            acls.denyGroup = function(sids, permissions) {
                return setPermissions.apply(this, ['deny', 'usergroup', sids, permissions]);
            };

            acls.resetUser = function(sids, permissions) {
                return setPermissions.apply(this, ['dontcare', 'user', sids, permissions]);
            };

            acls.resetGroup = function(sids, permissions) {
                return setPermissions.apply(this, ['dontcare', 'usergroup', sids, permissions]);
            };

            acls.allowAnonymous = function(permissions) {
                return setPermissions.apply(this, ['allow', 'usergroup', ['anonymous'], permissions]);
            };

            acls.denyAnonymous = function(permissions) {
                return setPermissions.apply(this, ['deny', 'usergroup', ['anonymous'], permissions]);
            };

            acls.resetAnonymous = function(permissions) {
                return setPermissions.apply(this, ['dontcare', 'usergroup', ['anonymous'], permissions]);
            };

            acls.allowLoggedIn = function(permissions) {
                return setPermissions.apply(this, ['allow', 'usergroup', ['anonymous'], permissions]);
            };

            acls.denyLoggedIn = function(permissions) {
                return setPermissions.apply(this, ['deny', 'usergroup', ['anonymous'], permissions]);
            };

            acls.resetLoggedIn = function(permissions) {
                return setPermissions.apply(this, ['dontcare', 'usergroup', ['anonymous'], permissions]);
            };
        };

        this._rollback = function() {
            changed = [];
            acls = JSON.parse(JSON.stringify(_snapshot));
            setUpOps();
            return this;
        };

        this.getChanged = function() {
            var chAcls = [];
            changed.forEach(function(a) {
                var acl = { sid: a.sid, type: a.type, allow: [], deny: [], dontcare: [] };
                states.forEach(function(s) {
                    if (a[s]) {
                        acl[a[s]].push(s);
                    }
                });

                accessTypes.forEach(function(at) {
                    if (acl[at].length == 0) delete acl[at];
                });

                if (acl['dontcare'].length == 0) delete acl['dontcare'];

                chAcls.push(acl);
            });

            if (chAcls.length == 0) return null;

            return chAcls;
        };

        this.toJSON = this.getChanged;

        this.merge = function() {
            changed = [];
            return this;
        };

        setUpOps();

        return this;
    };

    var _groupManager = function() {
        
        var _addRemoveMembers = function(op, groupName, members, options) {

            if (!groupName || !_type.isString(groupName) ||  groupName.length === 0) throw new Error("Please specify valid groupname"); 

            if (!_type.isArray(members)) members = [members];

            var cmd = {};

            cmd[op] = [];

            members.forEach(function(m) {
                if (!m) return;

                if ((m instanceof Appacitive.Object)  && m.typeName == 'user' && !m.isNew()) {
                    cmd[op].push(m.id);
                } else if (_type.isString(m)) {
                    cmd[op].push(m);
                }
            });


            if (cmd[op].length == 0) throw new Error("Please specify valid members as second argument");

            var request = new Appacitive._Request({
                method: 'POST',
                type: 'usergroup',
                op: 'getUpdateUrl',
                args: [groupName],
                data: cmd,
                entity: this,
                options: options,
                onSuccess: function(data) {
                    request.promise.fulfill(data);
                }
            });

            return request.send();
        };

        this.addMembers = function(groupName, members, options) {
            return _addRemoveMembers('add', groupName, members);
        };

        this.removeMembers = function(groupName, members, options) {
            return _addRemoveMembers('remove', groupName, members);
        };
    };

    Appacitive.Group = new _groupManager();

})(global);
    (function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    Appacitive.Object = function(attrs, options) {
        attrs = attrs || {};
        options = options || {};

        if (this.className) attrs.__type = this.className;
        
        if (_type.isString(attrs)) attrs = { __type : attrs };

        if (!attrs.__type) throw new Error("Cannot set object without __type");

        if (_type.isBoolean(options)) options = { setSnapShot: true };

        Appacitive.BaseObject.call(this, attrs, options);

        this.type = 'object';
        this.getObject = this.getObject;
        this.children = {};

        this.toJSON = function(recursive) {
            if (recursive) {
                var parseChildren = function(root) {
                    var objects = [];
                    root.forEach(function(obj) {
                        var tmp = obj.getObject();
                        if (obj.children && !Object.isEmpty(obj.children)) {
                            tmp.children = {};
                            for (var c in obj.children) {
                                tmp.children[c] = parseChildren(obj.children[c]);
                            }
                        }
                        if (obj.connection) tmp.__connection = obj.connection.toJSON();
                        objects.push(tmp);
                    });
                    return objects;
                };
                return parseChildren([this])[0];
            } else {
                return this.getObject();
            }
        };

        this.typeName = attrs.__type;

        this._aclFactory = new Appacitive._Acl(options.__acls, options.setSnapShot);

        this.acls = this._aclFactory.acls;

        if (_type.isFunction(this.initialize)) {
            this.initialize.apply(this, [attrs]);
        }

        return this;
    };

    Appacitive.Object.prototype = new Appacitive.BaseObject();

    Appacitive.Object.prototype.constructor = Appacitive.Object;

    Appacitive.Object.extend = function(typeName, protoProps, staticProps) {
        
        if (_type.isObject(typeName)) {
            staticProps = protoProps;
            protoProps = typeName;
            typeName = protoProps.typeName;
        }

        if (!_type.isString(typeName) || typeName.length == 0) {
          throw new Error("Appacitive.Object.extend's first argument should be the type-name.");
        }

        var entity = null;
    
        protoProps = protoProps || {};
        protoProps.className = typeName;

        entity = Appacitive._extend(Appacitive.Object, protoProps, staticProps);

        // Do not allow extending a class.
        delete entity.extend;

        // Set className in entity class
        entity.className = typeName;

        entity.type = typeName;

        __typeMap[typeName] = entity;

        return entity;
    };

    var __typeMap = {};

    var _getClass = function(className) {
        if (!_type.isString(className)) {
          throw "_getClass requires a string argument.";
        }
        var entity = __typeMap[className];
        if (!entity) {
          entity = Appacitive.Object.extend(className);
          __typeMap[className] = entity;
        }
        return entity;
    };

    Appacitive.Object._getClass = _getClass;

    Appacitive.Object._create = function(attributes, setSnapshot, typeClass) {
        var entity;
        if (this.className) entity = this;
        else entity = (typeClass) ? typeClass : _getClass(attributes.__type);
        return new entity(attributes).copy(attributes, setSnapshot);
    };

    //private function for parsing objects
    var _parseObjects = function(objects, typeClass, metadata) {
        var tmpObjects = [];
        objects.forEach(function(a) {
            var obj = Appacitive.Object._create(_extend(a, { __meta : metadata }), true, typeClass);
            tmpObjects.push(obj);
        });
        return tmpObjects;
    };

    Appacitive.Object._parseResult = _parseObjects;

    Appacitive.Object.multiDelete = function(attrs, options) {
        attrs = attrs || {};
        options = options || {};
        var models = [];
        if (this.className) attrs.type = this.className;

        if (_type.isArray(attrs) && attrs.length > 0) {
            if (attrs[0] instanceof Appacitive.Object) {
                models = attrs;
                attrs = { 
                    type:  models[0].className ,
                    ids :  models.map(function(o) { return o.id; }).filter(function(o) { return o; }) 
                };
            } else {
                attrs = {
                    type: this.className,
                    ids: attrs
                };
            }
        }
        if (!attrs.type || !_type.isString(attrs.type) || attrs.type.length === 0) throw new Error("Specify valid type");
        if (attrs.type.toLowerCase() === 'user' || attrs.type.toLowerCase() === 'device') throw new Error("Cannot delete user and devices using multidelete");
        if (!attrs.ids || attrs.ids.length === 0) throw new Error("Specify ids to delete");

        var request = new Appacitive._Request({
            method: 'POST',
            data: { idlist : attrs.ids },
            type: 'object',
            op: 'getMultiDeleteUrl',
            args: [attrs.type],
            options: options,
            onSuccess: function(d) {
                if (options && !options.silent) {
                    models.forEach(function(m) {
                        m.trigger('destroy', m, m.collection, options);
                    });
                }
                request.promise.fulfill();
            }
        });
        
        return request.send();
    };


    //takes typename and array of objectids and returns an array of Appacitive object objects
    Appacitive.Object.multiGet = function(attrs, options) {
        attrs = attrs || {};
        if (_type.isArray(attrs) && attrs.length > 0) {
            if (attrs[0] instanceof Appacitive.Object) {
                models = attrs;
                attrs = { 
                    ids :  models.map(function(o) { return o.id; }).filter(function(o) { return o; }) 
                };
            } else {
                attrs = {
                    ids: attrs
                };
            }
        }

        if (this.className) {
            attrs.type = this.className;
            attrs.entity = this;
        }


        if (!attrs.type || !_type.isString(attrs.type) || attrs.type.length === 0) throw new Error("Specify valid type");
        if (!attrs.ids || attrs.ids.length === 0) throw new Error("Specify ids to delete");

        var request = new Appacitive._Request({
            method: 'GET',
            type: 'object',
            op: 'getMultiGetUrl',
            args: [attrs.type, attrs.ids.join(','), attrs.fields],
            options: options,
            onSuccess: function(d) {
                request.promise.fulfill(_parseObjects(d.objects, attrs.entity, d.__meta));
            }
        });
            
        return request.send();
    };

    //takes object id , type and fields and returns that object
    Appacitive.Object.get = function(attrs, options) {
        attrs = attrs || {};
        
        if (_type.isString(attrs) && this.className) {
            attrs = {
                id: attrs
            };
        }

        if (this.className) {
            attrs.type = this.className;
            attrs.entity = this;
        }

        if (!attrs.type) throw new Error("Specify type");
        if (!attrs.id) throw new Error("Specify id to fetch");

        var obj = Appacitive.Object._create({ __type: attrs.type, __id: attrs.id });
        obj.fields = attrs.fields;

        return obj.fetch(attrs, options);
    };

    //takes relation type and returns query for it
    Appacitive.Object.prototype.getConnections = function(options) {
        if (this.isNew()) throw new Error("Cannot fetch connections for new object");
        options.objectId = this.get('__id');
        return new Appacitive.Queries.GetConnectionsQuery(options);
    };

    //takes relation type and returns a query for it
    Appacitive.Object.prototype.getConnectedObjects = function(options) {
        if (this.isNew()) throw new Error("Cannot fetch connections for new object");
        options = options || {};
        if (_type.isString(options)) options = { relation: options };
        options.type = this.get('__type');
        options.objectId = this.get('__id');
        options.object = this;
        return new Appacitive.Queries.ConnectedObjectsQuery(options);
    };
    Appacitive.Object.prototype.fetchConnectedObjects = Appacitive.Object.prototype.getConnectedObjects;
    
    // takes type and return a query for it
    Appacitive.Object.findAll = Appacitive.Object.findAllQuery = function(options) {
        options = options || {};
        if (this.className) {
            options.type = this.className;
            options.entity = this;
        }
        return new Appacitive.Queries.FindAllQuery(options);
    };

    Appacitive.Object.saveAll = function(objects, options) {
        return Appacitive.BaseObject._saveAll(objects, options, 'Object');
    };
 
})(global);
(function (global) {

    "use strict";
    
    var Appacitive = global.Appacitive;

    var _parseEndpoint = function(endpoint, type, base) {

        var result = { label: endpoint.label };
        if (endpoint.objectid)  result.objectid = endpoint.objectid;
        if (endpoint.object) {
            if (endpoint.object instanceof Appacitive.Object) {
                // provided an instance of Appacitive.ObjectCollection
                // stick the whole object if there is no __id
                // else just stick the __id
                if (endpoint.object.id) result.objectid = endpoint.object.id;
                else  result.object = endpoint.object.getObject();
            } else if (_type.isObject(endpoint.object)) {
                // provided a raw object
                // if there is an __id, just add that
                // else add the entire object
                if (endpoint.object.__id) result.objectid = endpoint.object.__id;
                else result.object = endpoint.object;

                endpoint.object =  Appacitive.Object._create(endpoint.object);
            } 
        } else {
            if (!result.objectid && !result.object) throw new Error('Incorrectly configured endpoints provided to parseConnection');
        }

        result.toJSON = function() {
            var d = _extend({}, this);
            if (d.object) {
                d.object = endpoint.object.toJSON();
                if (endpoint.object._aclFactory) {
                    var acls = endpoint.object._aclFactory.toJSON();
                    if (acls) d.object.__acls = acls;
                }
            }
            delete d.toJSON;
            return d
        };      

        base["endpoint" + type] = endpoint;
        return result;
    };

    var _convertEndpoint = function(endpoint, type, base) {
        if ( endpoint.object && _type.isObject(endpoint.object)) {
            if (!base['endpoint' + type]) {
                base["endpoint" + type] = {};
                base['endpoint' + type].object = Appacitive.Object._create(endpoint.object, true);
            } else {
                if (base['endpoint' + type] && base['endpoint' + type].object && base['endpoint' + type].object instanceof Appacitive.Object)
                    base["endpoint" + type].object.copy(endpoint.object, true);
                else 
                    base['endpoint' + type].object = Appacitive.Object._create(endpoint.object, true);
            }

            if (base["endpoint" + type]._aclFactory) {
                base["endpoint" + type]._aclFactory.merge();
            }

            base["endpoint" + type].objectid = endpoint.object.__id;
            base["endpoint" + type].label = endpoint.label;
            base["endpoint" + type].type = endpoint.type;
        } else {
            base["endpoint" + type] = endpoint;
        }
    };

    Appacitive.Connection = function(attrs, options) {
        attrs = attrs || {};
        options = options || {};

        if (this.className) attrs.__relationtype = this.className;
        
        if (_type.isString(attrs)) attrs = { __relationtype : attrs };
        
        if (!attrs.__relationtype && !attrs.relation ) throw new Error("Cannot set connection without relation");

        if (attrs.relation) {
            attrs.__relationtype = attrs.relation;
            delete attrs.relation;
        }

        if (_type.isBoolean(options)) options = { setSnapShot: true };

        if (attrs.endpoints && attrs.endpoints.length === 2) {
            attrs.__endpointa = attrs.endpoints[0];
            attrs.__endpointb = attrs.endpoints[1];
            delete attrs.endpoints;
        }

        Appacitive.BaseObject.call(this, attrs, options);
        this.type = 'connection';
        this.getConnection = this.getObject;

        this.parseConnection = function() {
            
            var typeA = 'A', typeB ='B';
            if ( attrs.__endpointa.label.toLowerCase() === this.get('__endpointb').label.toLowerCase() ) {
                if ((attrs.__endpointa.label.toLowerCase() != attrs.__endpointb.label.toLowerCase()) && (attrs.__endpointa.objectid == this.get('__endpointb').objectid || !attrs.__endpointa.objectid)) {
                    typeA = 'B';
                    typeB = 'A';
                }
            }

            _convertEndpoint(this.get('__endpointa'), typeA, this);
            _convertEndpoint(this.get('__endpointb'), typeB, this);

            this.endpoints = function() {
                if (arguments.length === 1 && _type.isString(arguments[0])) {
                    if (this.endpointA.label.toLowerCase() === arguments[0].toLowerCase()) return this.endpointA;
                    else if (this.endpointB.label.toLowerCase() === arguments[0].toLowerCase()) return this.endpointB;
                    else throw new Error("Invalid label provided");
                }
                var endpoints = [];
                endpoints.push(this.endpointA);
                endpoints.push(this.endpointB);
                return endpoints;
            };

            return this;
        };

        if (options.setSnapShot) {
            this.parseConnection(attrs);
        } else {
            if (attrs.__endpointa && attrs.__endpointb) this.setupConnection(this.get('__endpointa'), this.get('__endpointb'));
        } 

        this.relationName = attrs.__relationtype;

        if (_type.isFunction(this.initialize)) {
            this.initialize.apply(this, [attrs]);
        }

        return this;
    };

    Appacitive.Connection.prototype = new Appacitive.BaseObject();

    Appacitive.Connection.prototype.constructor = Appacitive.Connection;

    Appacitive.Connection.extend = function(relationName, protoProps, staticProps) {
        
        if (_type.isObject(relationName)) {
            staticProps = protoProps;
            protoProps = relationName;
            relationName = protoProps.relationName;
        }


        if (!_type.isString(relationName)) {
          throw new Error("Appacitive.Connection.extend's first argument should be the relationName.");
        }

        var entity = null;
    
        protoProps = protoProps || {};
        protoProps.className = relationName;

        entity = Appacitive._extend(Appacitive.Connection, protoProps, staticProps);

        // Do not allow extending a class.
        delete entity.extend;

        // Set className in entity class
        entity.className = relationName;

        entity.relation = relationName;

        __relationMap[relationName] = entity;

        return entity;
    };

    var __relationMap = {};

    var _getClass = function(className) {
        if (!_type.isString(className)) {
          throw "_getClass requires a string argument.";
        }
        var entity = __relationMap[className];
        if (!entity) {
          entity = Appacitive.Connection.extend(className);
          __relationMap[className] = entity;
        }
        return entity;
    };

    Appacitive.Connection._getClass = _getClass;

    Appacitive.Connection._create = function(attributes, setSnapshot, relationClass) {
        var entity;
        if (this.className) entity = this;
        else entity = (relationClass) ? relationClass : _getClass(attributes.__relationtype);
        return new entity(attributes).copy(attributes, setSnapshot);
    };

    //private function for parsing api connections in sdk connection object
    var _parseConnections = function(connections, relationClass, metadata) {
        var connectionObjects = [];
        if (!connections) connections = [];
        connections.forEach(function(c) {
            connectionObjects.push(Appacitive.Connection._create(_extend(c, { __meta : metadata }), true, relationClass));
        });
        return connectionObjects;
    };

    Appacitive.Connection._parseResult = _parseConnections;


    Appacitive.Connection.prototype.setupConnection = function(endpointA, endpointB) {
        
        // validate the endpoints
        if (!endpointA || (!endpointA.objectid &&  !endpointA.object) || !endpointA.label || !endpointB || (!endpointB.objectid && !endpointB.object) || !endpointB.label) {
            throw new Error('Incorrect endpoints configuration passed.');
        }

        // there are two ways to do this
        // either we are provided the object id
        // or a raw object
        // or an Appacitive.Object instance
        // sigh
        
        // 1
        this.set('__endpointa', _parseEndpoint(endpointA, 'A', this), { silent: true });

        // 2
        this.set('__endpointb', _parseEndpoint(endpointB, 'B', this), { silent: true });

        // 3
        this.endpoints = function() {

            if (arguments.length === 1 && _type.isString(arguments[0])) {
                if (this.endpointA.label.toLowerCase() === arguments[0].toLowerCase()) return this.endpointA;
                else if (this.endpointB.label.toLowerCase() === arguments[0].toLowerCase()) return this.endpointB;
                else throw new Error("Invalid label provided");
            }

            var endpoints = [];
            endpoints.push(this.endpointA);
            endpoints.push(this.endpointB);
            return endpoints;
        };

    };

    Appacitive.Connection.prototype.get = Appacitive.Connection.get = function(attrs, options) {
        attrs = attrs || {};
        if (_type.isString(attrs) && this.className) {
            attrs = {
                id: attrs
            };
        }

        if (this.className) {
            attrs.relation = this.className;
            attrs.entity = this;
        }
        
        if (!attrs.relation) throw new Error("Specify relation");
        if (!attrs.id) throw new Error("Specify id to fetch");
        var obj = Appacitive.Connection._create({ __relationtype: attrs.relation, __id: attrs.id });
        obj.fields = attrs.fields;
        return obj.fetch(options);
    };

    //takes relationname and array of connectionids and returns an array of Appacitive object objects
    Appacitive.Connection.multiGet = function(attrs, options) {
        attrs = attrs || {};
        
        if (_type.isArray(attrs) && attrs.length > 0) {
            if (attrs[0] instanceof Appacitive.Connection) {
                models = attrs;
                attrs = { 
                    ids :  models.map(function(o) { return o.id; }).filter(function(o) { return o; }) 
                };
            } else {
                attrs = {
                    ids: attrs
                };
            }
        }

        if (this.className) {
            attrs.relation = this.className;
            attrs.entity = this;
        }
        
        if (!attrs.relation || !_type.isString(attrs.relation) || attrs.relation.length === 0) throw new Error("Specify valid relation");
        if (!attrs.ids || attrs.ids.length === 0) throw new Error("Specify ids to delete");

        var request = new Appacitive._Request({
            method: 'GET',
            type: 'connection',
            op: 'getMultiGetUrl',
            args: [attrs.relation, attrs.ids.join(','), attrs.fields],
            options: options,
            onSuccess: function(d) {
                request.promise.fulfill(_parseConnections(d.connections, attrs.entity, d.__meta));
            }
        });
            
        return request.send();
    };

    //takes relationame, and array of connections ids
    Appacitive.Connection.multiDelete = function(attrs, options) {
        attrs = attrs || {};
        options = options || {};
        var models = [];
        if (this.className) attrs.relation = this.className;

        if (_type.isArray(attrs) && attrs.length > 0) {
            if (attrs[0] instanceof Appacitive.Connection) {
                models = attrs;
                attrs = { 
                    relation:  models[0].className ,
                    ids :  models.map(function(o) { return o.id; }).filter(function(o) { return o; }) 
                };
            } else {
                attrs = {
                    relation: this.className,
                    ids: attrs
                };
            }
        }
        if (!attrs.relation || !_type.isString(attrs.relation) || attrs.relation.length === 0) throw new Error("Specify valid relation");
        if (!attrs.ids || attrs.ids.length === 0) throw new Error("Specify ids to delete");

        var request = new Appacitive._Request({
            method: 'POST',
            data: { idlist : attrs.ids },
            type: 'connection',
            op: 'getMultiDeleteUrl',
            args: [attrs.relation],
            options: options,
            onSuccess: function(d) {
                if (options && !options.silent) {
                    models.forEach(function(m) {
                        m.trigger('destroy', m, m.collection, options);
                    });
                }
                request.promise.fulfill();
            }
        });
        
        return request.send();
    };

    
    //takes relation type and returns all connections for it
    Appacitive.Connection.findAll = Appacitive.Connection.findAllQuery = function(options) {
        options = options || {};
        if (this.className) {
            options.relation = this.className;
            options.entity = this;
        }
        return new Appacitive.Queries.FindAllQuery(options);
    };

    //takes 1 objectid and multiple aricleids and returns connections between both 
    Appacitive.Connection.interconnectsQuery = Appacitive.Connection.getInterconnects = function(options) {
        return new Appacitive.Queries.InterconnectsQuery(options);
    };

    //takes 2 objectids and returns connections between them
    Appacitive.Connection.betweenObjectsQuery = Appacitive.Connection.getBetweenObjects = function(options) {
        return new Appacitive.Queries.GetConnectionsBetweenObjectsQuery(options);
    };

    //takes 2 objects and returns connections between them of particluar relationtype
    Appacitive.Connection.betweenObjectsForRelationQuery = Appacitive.Connection.getBetweenObjectsForRelation = function(options) {
        options = options || {};
        if (this.className) {
            options.relation = this.className;
            options.entity = this;
        }
        return new Appacitive.Queries.GetConnectionsBetweenObjectsForRelationQuery(options);
    };

    Appacitive.Connection.saveAll = function(objects, options) {
        return Appacitive.BaseObject._saveAll(objects, options, 'Connection');
    };

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    var User = function(options, setSnapshot) {
        options = options || {};
        options.__type = 'user';
        Appacitive.Object.call(this, options, setSnapshot);
        return this;
    };

    var _authenticatedUser = null;

    User.currentUser = User.current = function() { return _authenticatedUser; };

    var _updatePassword = function(oldPassword, newPassword, options) {
        var userId = this.get('__id');
        if (!userId || !_type.isString(userId) || userId.length === 0) throw new Error("Please specify valid userid");
        if (!oldPassword || !_type.isString(oldPassword) || oldPassword.length === 0) throw new Error("Please specify valid oldPassword");
        if (!newPassword || !_type.isString(newPassword) || newPassword.length === 0) throw new Error("Please specify valid newPassword");

        var updatedPasswordOptions = { oldpassword : oldPassword, newpassword: newPassword };
        
        var that = this;

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getUpdatePasswordUrl',
            args: [userId],
            options: options,
            data: updatedPasswordOptions,
            entity: this,
            onSuccess: function(data) {
                request.promise.fulfill(that);
            }
        });
        return request.send();
    };

    var _link = function(link, options) {
        var userId = this.get('__id');

        if (!this.get('__id')) {
            this.set('__link', link);
            return Appacitive.Promise.buildPromise(options).fulfill(this);
        }

        var that = this;

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getLinkAccountUrl',
            args: [userId],
            options: options,
            data: link,
            entity: this,
            onSuccess: function(data) {
                var links = that.get('__link');
                if (!_type.isArray(links)) {
                    links = (links) ? [links] : [];
                }
                links.push(link);
                that.copy({__link: links }, true);
                request.promise.fulfill(that);
            }
        });
        return request.send();
    };

    User.setCurrentUser = function(user, token, expiry) {
        if (!user) throw new Error('Cannot set null object as user');
        var userObject = user;
        
        if (!(userObject instanceof Appacitive.User)) userObject = new Appacitive.User(user, true); 
        else if (!userObject.get('__id') || userObject.get('__id').length === 0) throw new Error('Specify user __id');
        else user = userObject.toJSON(); 

        Appacitive.localStorage.set('Appacitive-User', user);

        if (!expiry) expiry = 86400000;
        _authenticatedUser = userObject;

        if (token) Appacitive.Session.setUserAuthHeader(token, expiry);

        _authenticatedUser.logout = function(callback) { return Appacitive.Users.logout(callback); };

        _authenticatedUser.updatePassword = function(oldPassword, newPassword, options) {
            return _updatePassword.apply(this, [oldPassword, newPassword, options]);
        };

        _authenticatedUser.logout = function(callback) { return Appacitive.Users.logout(callback); };

        Appacitive.eventManager.clearAndSubscribe('type.user.' + userObject.get('__id') + '.updated', function(sender, args) {
            Appacitive.localStorage.set('Appacitive-User', args.object.getObject());
        });

        return _authenticatedUser;
    };
    

    //getter to get linkedaccounts
    User.prototype.linkedAccounts = function() {
        
        var accounts = this.get('__link');
        
        if (!accounts) accounts = [];
        else if (!_type.isArray(accounts)) accounts = [accounts];
        
        return accounts;
    };

    //method for getting all linked accounts
    User.prototype.getAllLinkedAccounts = function(options) {
        var userId = this.get('__id');
        
        if (!userId || !_type.isString(userId) || userId.length === 0) {
            return Appacitive.Promise.buildPromise(options).fulfill(this.linkedAccounts(), this);
        }

        var that = this;

        var request = new Appacitive._Request({
            method: 'GET',
            type: 'user',
            op: 'getGetAllLinkedAccountsUrl',
            args: [userId],
            options: options,
            entity: this,
            onSuccess: function() {
                var accounts = a.identities || []; 
                if (accounts.length > 0) that.set('__link', accounts);
                else that.set('__link', null);
                
                request.promise.fulfill(accounts, that);
            }
        });
        return request.send();
    };

    User.prototype.checkin = function(coords, options) {
        var userId = this.get('__id');
        if (!userId || !_type.isString(userId) || userId.length === 0) {
            if (onSuccess && _type.isFunction(onSuccess)) onSuccess();
        }
        if (!coords || !(coords instanceof Appacitive.GeoCoord)) throw new Error("Invalid coordinates provided");

        var that = this;

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getCheckinUrl',
            args: [userId, coords.lat, coords.lngerId],
            options: options,
            entity: this,
            onSuccess: function() {
                request.promise.fulfill(that);
            }
        });
        return request.send();
    };

    //method for linking facebook account to a user
    User.prototype.linkFacebook = function(accessToken, options) {
        
        if (!accessToken || !_type.isString(accessToken)) throw new Error("Please provide accessToken");

        var payload = {
            "authtype": "facebook",
            "accesstoken": accessToken,
            "name": "facebook"
        };

        return _link.apply(this, [payload, options]);
    };

    //method for linking twitter account to a user
    User.prototype.linkTwitter = function(twitterObj, options) {
        
        if (!_type.isObject(twitterObj) || !twitterObj.oAuthToken  || !twitterObj.oAuthTokenSecret) throw new Error("Twitter Token and Token Secret required for linking");
        
        var payload = {
            "authtype": "twitter",
            "oauthtoken": twitterObj.oAuthToken ,
            "oauthtokensecret": twitterObj.oAuthTokenSecret
        };

        if (twitterObj.consumerKey && twitterObj.consumerSecret) {
            payload.consumersecret = twitterObj.consumerSecret;
            payload.consumerkey = twitterObj.consumerKey;
        }

        return _link.apply(this, [payload, options]);
    };

    //method to unlink an oauth account
    User.prototype.unlink = function(name, options) {
        
        if (!_.isString(name)) throw new Error("Specify aouth account type for unlinking");

        var userId = this.get('__id');

        if (!this.get('__id')) {
            this.set('__link', null);
            promise.fulfill(this);
            return promise;
        }

        var that = this;

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getDelinkAccountUrl',
            args: [userId, name],
            options: options,
            entity: this,
            onSuccess: function(a) {
                var accounts = that.get('__link');
        
                if (!accounts) accounts = [];
                else if (!_type.isArray(accounts)) accounts = [accounts];

                if (accounts.length >= 0) {
                    var ind = null;
                    accounts.forEach(function(a, i) {
                        if (a.name == name.toLowerCase()) {
                            ind = i;
                            return;
                        }
                    });
                    if (ind != null) accounts.splice(ind, 1);
                    that.copy({ __link: accounts }, true);
                } else {
                    that.copy({ __link: [] }, true);
                }

                request.promise.fulfill(that);
            }
        });
        return request.send();
    };

    User.prototype.clone = function() {
        return new Appacitive.User(this.getObject());
    };

    Appacitive.User = Appacitive.Object.extend('user', User.prototype);

    //Remove article static properties
    delete Appacitive.User._create;
    delete Appacitive.User._parseResult;
    delete Appacitive.User.multiDelete;

    User.deleteUser = function(userId, options) {
        if (!userId) throw new Error('Specify userid for user delete');
        return new Appacitive.Object({ __type: 'user', __id: userId }).destroyWithConnections(options);
    };

    User.deleteCurrentUser = function(options) {
        
        var promise = Appacitive.Promise.buildPromise(options);

        var _callback = function() {
            Appacitive.Session.removeUserAuthHeader();
            promise.fulfill();
        };

        if (_authenticatedUser === null) { 
            _callback();
            return promise;
        }

        var currentUserId = _authenticatedUser.get('__id');
        
        this.deleteUser(currentUserId).then(function() { 
            _authenticatedUser = null;
            _callback();
        }, function() { 
            promise.reject.apply(promise, arguments);
        });

        return promise;
    };

    User.createNewUser = function(user, options) {
        user = user || {};
        user.__type = 'user';
        if (!user.username || !user.password || !user.firstname || user.username.length === 0 || user.password.length === 0 || user.firstname.length === 0) 
            throw new Error('username, password and firstname are mandatory');

        return new Appacitive.User(user).save(options);
    };

    User.createUser = User.createNewUser;

    //method to allow user to signup and then login 
    User.signup = function(user, options) {
        var that = this;
        var promise = Appacitive.Promise.buildPromise(options);

        this.createUser(user).then(function() {
            that.login(user.username, user.password).then(function() {
                promise.fulfill.apply(promise, arguments);
            }, function(staus) {
                promise.reject.apply(promise, arguments);
            });
        }, function() {
            promise.reject.apply(promise, arguments);
        });

        return promise;
    };

    //authenticate user with authrequest that contains username , password and expiry
    User.authenticateUser = function(authRequest, options, provider) {

        if (!authRequest.expiry) authRequest.expiry = 86400000;
        var that = this;

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getAuthenticateUserUrl',
            options: options,
            data: authRequest,
            onSuccess: function(data) {
                if (data && data.user) {
                    if (provider) data.user.__authType = provider;
                    _extend(data.user, { __meta: data.__meta });
                    that.setCurrentUser(data.user, data.token, authRequest.expiry);
                    Appacitive.User.trigger('login', _authenticatedUser, _authenticatedUser, data.token);
                    request.promise.fulfill({ user : _authenticatedUser, token: data.token });
                } else {
                    request.promise.reject(data.status);
                }
            }
        });
        return request.send();
    };

    //An overrride for user login with username and password directly
    User.login = function(username, password, options) {

        if (!username || !password || username.length ==0 || password.length == 0) throw new Error('Please specify username and password');

        var authRequest = {
            username : username,
            password: password,
            expiry: 86400000
        };

        return this.authenticateUser(authRequest, options, 'BASIC');
    };

    User.loginWithFacebook = function(accessToken, options) {
        
        if (!accessToken || !_type.isString(accessToken)) throw new Error("Please provide accessToken");

        options = options || {};    

        var createNew = true;

        if (options.create == false) createNew = false; 

        var authRequest = {
            "accesstoken": accessToken,
            "type": "facebook",
            "expiry": 86400000,
            "createnew": createNew
        };

        return this.authenticateUser(authRequest, options, 'FB');
    };

    User.loginWithTwitter = function(twitterObj, options) {
        
        if (!_type.isObject(twitterObj) || !twitterObj.oAuthToken  || !twitterObj.oAuthTokenSecret) throw new Error("Twitter Token and Token Secret required for linking");
        
        var createNew = true;

        if (options.create == false) createNew = false; 

        var authRequest = {
            "type": "twitter",
            "oauthtoken": twitterObj.oAuthToken ,
            "oauthtokensecret": twitterObj.oAuthTokenSecret,
            "expiry": 86400000,
            "createnew": createNew
        };

        if (twitterObj.consumerKey && twitterObj.consumerSecret) {
            authRequest.consumersecret = twitterObj.consumerSecret;
            authRequest.consumerkey = twitterObj.consumerKey;
        }

        return this.authenticateUser(authRequest, options, 'TWITTER');
    };

    User.validateCurrentUser = function(avoidApiCall, callback) {

        var promise = Appacitive.Promise.buildPromise({ success: callback });

        if (callback && _type.isBoolean(callback)) {
            avoidApiCall = callback;
            callback = function() {}; 
        }

        var token = Appacitive.localStorage.get('Appacitive-UserToken');

        if (!token) {
            promise.fulfill(false);
            return promise;
        }

        if (!avoidApiCall) {
            try {
                var that = this;
                this.getUserByToken(token).then(function(user) {
                    that.setCurrentUser(user, token);
                    promise.fulfill(true);
                }, function() {
                    promise.fulfill(false);
                });
            } catch (e) { 
                promise.fulfill(false);
            }
        } else {
            promise.fulfill(true);
        }

        return promise;
    };

    var _getUserByIdType = function(op, args, options) {
        options = options || {};
        var request = new Appacitive._Request({
            method: 'GET',
            type: 'user',
            op: op,
            options: options,
            args: args,
            onSuccess: function(data) {
                if (data && data.user) request.promise.fulfill(new Appacitive.User(_extend(data.user, { __meta: data.__meta }),  _extend(options, { setSnapShot: true })));
                else request.promise.reject(data.status);
            }
        });
        return request.send();
    };

    User.getUserByToken = function(token, options) {
        if (!token || !_type.isString(token) || token.length === 0) throw new Error("Please specify valid token");
        Appacitive.Session.setUserAuthHeader(token, 0, true);
        return _getUserByIdType("getUserByTokenUrl", [token], options);
    };

    User.getUserByUsername = function(username, options) {
        if (!username || !_type.isString(username) || username.length === 0) throw new Error("Please specify valid username");
        return _getUserByIdType("getUserByUsernameUrl", [username], options);
    };

    User.logout = function(makeApiCall, options) {
        _authenticatedUser = null;
        return Appacitive.Session.removeUserAuthHeader(makeApiCall, options);
    };

    User.sendResetPasswordEmail = function(username, subject, options) {

        if (!username || !_type.isString(username)  || username.length === 0) throw new Error("Please specify valid username");
        if (!subject || !_type.isString(subject) || subject.length === 0) throw new Error('Plase specify subject for email');

        var passwordResetOptions = { username: username, subject: subject };

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getSendResetPasswordEmailUrl',
            options: options,
            data: passwordResetOptions,
            onSuccess: function() {
                request.promise.fulfill();
            }
        });
        return request.send();
    };

    User.resetPassword = function(token, newPassword, options) {

        if (!token) throw new Error("Please specify token");
        if (!newPassword || newPassword.length === 0) throw new Error("Please specify password");

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getResetPasswordUrl',
            options: options,
            data: { newpassword: newPassword },
            args: [token],
            onSuccess: function() {
                request.promise.fulfill();
            }
        });
        return request.send();
    };

    User.validateResetPasswordToken = function(token, options) {
        
        if (!token) throw new Error("Please specify token");

        options = options || {};

        var request = new Appacitive._Request({
            method: 'POST',
            type: 'user',
            op: 'getValidateResetPasswordUrl',
            options: options,
            data: {},
            args: [token],
            onSuccess: function(data) {
                request.promise.fulfill(new Appacitive.User(_extend(data.user, { __meta: data.__meta }), _extend(options, { setSnapShot: true })));
            }
        });
        return request.send();
    };

    Appacitive.Users = Appacitive.User;

    Appacitive.Events.mixin(Appacitive.User);

})(global);
  (function(global) {

  var Appacitive = global.Appacitive;

  Appacitive.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (!this.model) throw new Error("Please specify model for collection");
    if (options.comparator !== void 0) this.comparator = options.comparator;
    if (options.query) this.query(options.query);
    else this.query(new Appacitive.Query(this.model));
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, { silent: true });
  };

  Appacitive.Events.mixin(Appacitive.Collection.prototype);

  // Define the Collection's inheritable methods.
  _extend(Appacitive.Collection.prototype, {
    
    models: [],

    /**
     * Initialize is an empty function by default. Override it with your own
     * initialization logic.
     */
    initialize: function(){},

    _query: null,

    /**
     * The JSON representation of a Collection is an array of the
     * models' attributes.
     */
    toJSON: function(options) {
      return this.models.map(function(model) { return model.toJSON(options); });
    },

    add: function(models, options) {
      options = options || {};
      var i, index, length, model, cid, id, cids = {}, ids = {}, at = options.at, merge = options.merge, toAdd = [], sort = options.sort, existing;
      models = _type.isArray(models) ? models.slice() : [models];

      for (i = 0, length = models.length; i < length; i++) {
        models[i] = this._prepareModel(models[i]);
        model = models[i];
        if (!model) throw new Error("Can't add an invalid model to a collection");

        cid = model.cid;
        if (cids[cid] || this._byCid[cid])  throw new Error("Duplicate cid: can't add the same model to a collection twice");
        
        id = model.id;
        if (id && ((existing = ids[id]) || (existing = this._byId[id]))) {
          existing.copy(model.toJSON(), options.setSnapShot);
          existing.children = model.children;
        } else {
          ids[id] = model;
          cids[cid] = model;

          toAdd.push(model);
          
          this._addReference(model, options);
        }
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      
      index = (options.at != null) ? options.at : this.models.length;
      this.models.splice.apply(this.models, [index, 0].concat(toAdd));
      if (sort && this.comparator) this.sort({silent: true});
      this.length = this.models.length;

      if (options.silent) return this;
      
      for (i = 0, length = toAdd.length; i < length; i++) {
        model = toAdd[i];
        options.index = i;
        model.trigger('add', model, this, options);
      }

      return this;
    },

    remove: function(models, options) {
      var i, l, index, model;
      options = options || {};
      models = _type.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue; 
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.models.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _extend({ at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _extend({ at: 0 }, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return Array.prototype.slice.apply(this.models, arguments);
    },

    /**
     * Gets a model from the set by id.
     * @param {String} id The Appacitive objectId identifying the Appacitive.Object to
     * fetch from this collection.
     */
    get: function(id) {
      return id && this._byId[(id instanceof Appacitive.BaseObject) ? id.id : id];
    },

    query: function(query) {
      if (query) {
        if ((query instanceof Appacitive.Query) || (query instanceof Appacitive.Queries.GraphAPI)) { 
          this._query = query;
          return this;
        } else {
          throw new Error("Cannot bind this query")
        }
      }
      else return this._query;
    },

    /**
     * Gets a model from the set by client id.
     * @param {} cid The Backbone collection id identifying the Appacitive.Object to
     * fetch from this collection.
     */
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    /**
     * Gets the model at the given index.
     *
     * @param {Number} index The index of the model to return.
     */
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (Object.isEmpty(attrs)) return first ? void 0 : [];
      return this.models[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    sort: function(options) {
      options = options || {};
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      //if (!_type.isFunction()) throw new Error('Comparator needs to be a function');
      
      if (this.comparator.length === 1) {
        this.models = this.models.sortBy(this.comparator);
      } else {
        this.models.sort(this.comparator.bind(this.models));
      }
      if (!options.silent) this.trigger('reset', this, options);
      
      return this;
    },

    /**
     * Plucks an attribute from each model in the collection.
     * @param {String} attr The attribute to return from each model in the
     * collection.
     */
    pluck: function(attr) {
      return this.models.map(function(model) { return model.get(attr); });
    },

    /**
     * Returns the first model in this collection
     */
    first: function() {
      return (this.length > 0) ? this.models[0] : null;
    },

    /**
     * Returns the last model in this collection
     */
    last: function() {
      return (this.length > 0) ? this.models[this.length - 1] : null;
    },

    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, length = this.models.length; i < length; i++) {
        this._removeReference(this.models[i], options);
      }
      this._reset();
      this.add(models, _extend({ silent: true }, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    fetch: function(options) {
      options = _clone(options) || {};
      
      var collection = this;
      var query = this.query() || new Appacitive.Query(this.model);
      
      var promise = Appacitive.Promise.buildPromise(options);

      query.fetch(options).then(function(results) {
        if (options.add) collection.add(results, _extend({ setSnapShot: true }, options));
        else collection.reset(results, options);
        promise.fulfill(collection);
      }, function() {
        promise.reject.apply(promise, arguments);
      });

      return promise;
    },


    mutiGet: function(options) {
      options = _clone(options) || {};
      
      var collection = this;
      
      var promise = Appacitive.Promise.buildPromise(options);

      var ids = options.ids || [];

      if (ids.length == 0) return promise.fulfill(collection);

      var args = { ids: ids, fields : options.fields };

      args[this.model.type || this.model.relation] = this.model.className;

      Appacitive.Object.multiGet(args).then(function(results) {
        if (options.add) collection.add(results, options);
        else collection.reset(results, options);
        promise.fulfill(collection);
      }, function() {
        promise.reject.apply(promise, arguments);
      });

      return promise;
    },

    saveAll: function(options) {
      return this.model.saveAll(_extend(options));
    },

    create: function(model, options) {
      var collection = this;
      options = options ? _clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var success = options.success;
      options.success = function() {
        if (options.wait) collection.add(model, _extend({ setSnapShot: true }, options));
        if (success) success(model, collection);
      };
      model.save(options);
      return model;
    },

    /**
     * Reset all internal state. Called when the collection is reset.
     */
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    /**
     * Prepare a model or hash of attributes to be added to this collection.
     */
    _prepareModel: function(model) {
      if (!(model instanceof Appacitive.BaseObject)) {
        model = new this.model(model);
      }

      if (!model.collection) model.collection = this;

      return model;
    },


    // Internal method to create a model's ties to a collection.
    _addReference: function(model) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    /**
     * Internal method to remove a model's ties to a collection.
     */
    _removeReference: function(model) {
      if (this === model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    /**
     * Internal method called every time a model in the set fires an event.
     * Sets need to update their indexes when models change ids. All other
     * events simply proxy through. "add" and "remove" events that originate
     * in other collections are ignored.
     */
    _onModelEvent: function(ev, model, collection, options) {
      if ((ev === 'add' || ev === 'remove') && collection !== this) return;
      if (ev === 'destroy') this.remove(model, options);
      if (model && ev === 'change:__id') {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }
  });

  Appacitive.Collection.extend = function(protoProps, classProps) {
    if (protoProps && protoProps.query) {
      protoProps._query = protoProps.query;
      delete protoProps.query;
    }
    var child = Appacitive._extend(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  var methods = ['forEach', 'each', 'map' ,'find', 'filter', 'every', 'some', 'indexOf', 'lastIndexOf', 'isEmpty', 'difference', 'without', 'reduce'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  methods.each(function(method) {
    Appacitive.Collection.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      return Array.prototype[method].apply(this.models, args);
    };
  });

})(global);

(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;
    
    var _browserFacebook = function() {

        var _accessToken = null;

        var _initialized = true;

        var _app_id = null;

        this.initialize = function(options) {
          if (!FB) throw "Facebook SDK needs be loaded before calling initialize.";
          if (!options.appId) throw new Error("Please provide appid");
          _app_id = options.appId;
          FB.init(options);
          _initialized = true;
        };

        this.requestLogin = function(scope) {

            scope = scope || {};

            if (!_initialized) throw new Error("Either facebook sdk has not yet been initialized, or not yet loaded.");
            var promise = new Appacitive.Promise();
            FB.login(function(response) {
                if (response && response.status === 'connected' && response.authResponse) {
                    _accessToken = response.authResponse.accessToken;
                    promise.fulfill(response.authResponse);
                } else {
                    promise.reject();
                }
            }, scope);

            return promise;
        };

        this.getCurrentUserInfo = function() {
            if (!_initialized) throw new Error("Either facebook sdk has not yet been initialized, or not yet loaded.");
            var promise = new Appacitive.Promise();
            
            FB.api('/me', function(response) {
                if (response && !response.error) {
                    _accessToken = FB.getAuthResponse().accessToken;
                    promise.fulfill(response);
                } else {
                    promise.reject();
                }
            });

            return promise;
        };

        this.accessToken = function() {
            if (arguments.length === 1) {
                _accessToken = arguments[0];
                return this;
            }
            return _accessToken;
        };

        this.getProfilePictureUrl = function(username) {
            return 'https://graph.facebook.com/' + username + '/picture';
        };

        this.logout = function() {
            _accessToken = null;
            var promise = new Appacitive.Promise();
            
            try {
                FB.logout(function() {
                    Appacitive.Users.logout();
                    promise.fulfill();
                });
            } catch(e) {
                promise.reject(e.message);
            }

            return promise;
        };
    };

    var _nodeFacebook = function() {

        var _accessToken = null;

        this.FB = null;

        var _app_id = null;

        var _app_secret = null;

        var _initialized = false;

        this.initialize = function (options) { 
            if (!Facebook) throw new Error("node-facebook SDK needs be loaded before calling initialize.");
            if (!options.appId) throw new Error("Please provide appid");
            if (!options.appSecret) throw new Error("Please provide app secret");

            _app_id = options.appId;
            _app_secret = options.appSecret;
            this.FB = new (require('facebook-node-sdk'))({ appId: _appId, secret: _app_secret });
            _initialized = true;
        };

        this.requestLogin = function(accessToken) {
            if (accessToken) _accessToken = accessToken;
            return new Appacitive.Promise().fulfill();
        };

        this.getCurrentUserInfo = function() {
            if (!_initialized) throw new Error("Either facebook sdk has not yet been initialized, or not yet loaded.");

            var promise = new Appacitive.Promise();

            if (this.FB && _accessToken) {
                this.FB.api('/me', function(err, response) {
                    if (response) {
                        promise.fulfill(response);
                    } else {
                        promise.reject("Access token is invalid");
                    }
                });
            } else {
                promise.reject("Either intialize facebook with your appid and appsecret or set accesstoken");
            }

            return promise;
        };

        this.accessToken = function() {
            if (arguments.length === 1) {
                _accessToken = arguments[0];
                return this;
            }
            return _accessToken;
        };

        this.getProfilePictureUrl = function(username) {
            return 'https://graph.facebook.com/' + username + '/picture';
        };

        this.logout = function() {
            Appacitive.Facebook.accessToken = "";
            return new Appacitive.Promise().fulfill();
        };
    };

    Appacitive.Facebook = Appacitive.runtime.isBrowser ? new _browserFacebook() : new _nodeFacebook();

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    var _emailManager = function() {

        var config = {
            smtp: {
                username: null,
                password: null,
                host: "smtp.gmail.com",
                port: 465,
                enablessl: true
            },
            from: null,
            replyto: null
        };

        this.getConfig = function() {
            var _copy = config;
            return _copy;
        };

        var _sendEmail = function (email, options) {
            
            var request = new Appacitive._Request({
                method: 'POST',
                type: 'email',
                op: 'getSendEmailUrl',
                options: options,
                data: email,
                entity: email,
                onSuccess: function(d) {
                    request.promise.fulfill(d.email);
                }
            });
            return request.send();
        };

        this.setupEmail = function(options) {
            options = options || {};
            config.smtp.username = options.username || config.smtp.username;
            config.from = options.from || config.from;
            config.smtp.password = options.password || config.smtp.password;
            config.smtp.host = options.smtp.host || config.smtp.host;
            config.smtp.port = options.smtp.port || config.smtp.port;
            config.smtp.enablessl = options.enableSSL || config.smtp.enablessl;
            config.replyto = options.replyTo || config.replyto;
        };


        this.sendTemplatedEmail = function(args, options) {
            
            if (!args || !args.to || !args.to.length || args.to.length === 0) {
                throw new Error('Atleast one receipient is mandatory to send an email');
            }
            if (!args.subject || args.subject.trim().length === 0) {
                throw new Error('Subject is mandatory to send an email');
            }

            if(!args.from && config.from) {
                throw new Error('from is mandatory to send an email. Set it in config or send it in options on the portal');
            } 

            if (!args.templateName) {
                throw new Error('template name is mandatory to send an email');
            }

            var email = {
                to: args.to || [],
                cc: args.cc || [],
                bcc: args.bcc || [],
                subject: args.subject,
                from: args.from,
                body: {
                    templatename: args.templateName || '',
                    data : args.data || {},
                    ishtml: (args.isHtml === false) ? false : true
                }
            };

            if (args.useConfig) {
                email.smtp = config.smtp;
                if(!args.from && !config.from) {
                    throw new Error('from is mandatory to send an email. Set it in config or send it in options');
                }
                email.from = args.from || config.from;
                email.replyto = args.replyTo || config.replyto;
            }

            return _sendEmail(email, options);
        };

        this.sendRawEmail = function(args, options) {

            if (!args || !args.to || !args.to.length || args.to.length === 0) {
                throw new Error('Atleast one receipient is mandatory to send an email');
            }
            if (!args.subject || args.subject.trim().length === 0) {
                throw new Error('Subject is mandatory to send an email');
            }

            if(!args.from && config.from) {
                throw new Error('from is mandatory to send an email. Set it in config or send it in options on the portal');
            } 

            if (!args.body) {
                throw new Error('body is mandatory to send an email');
            } 

            var email = {
                to: args.to || [],
                cc: args.cc || [],
                bcc: args.bcc || [],
                subject: args.subject,
                from: args.from,
                body: {
                    content: args.body || '',
                    ishtml: (args.isHtml === false) ? false : true
                }
            };

            if (args.useConfig) {
                email.smtp = config.smtp;
                if(!args.from && !config.from) {
                    throw new Error('from is mandatory to send an email. Set it in config or send it in options');
                }
                email.from = args.from || config.from;
                email.replyto = args.replyTo || config.replyto;
            }

            return _sendEmail(email, options);
        };

    };

    Appacitive.Email = new _emailManager();

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    var _pushManager = function() {

        this.send = function(args, options) {
            
            if (!args) throw new Error("Please specify push options");

            var request = new Appacitive._Request({
                method: 'POST',
                type: 'push',
                op: 'getPushUrl',
                options: options,
                data: args,
                entity: args,
                onSuccess: function(d) {
                    request.promise.fulfill(d.id);
                }
            });
            return request.send();
        };

        this.getNotification = function(notificationId, options) {

            if (!notificationId) throw new Error("Please specify notification id");

            var request = new Appacitive._Request({
                method: 'GET',
                type: 'push',
                op: 'getGetNotificationUrl',
                args: [notificationId],
                options: options,
                onSuccess: function(d) {
                    request.promise.fulfill(d.pushnotification);
                }
            });
            return request.send();
        };

        this.getAllNotifications = function(pagingInfo, options) {
            
            if (!pagingInfo)
                pagingInfo = { pnum: 1, psize: 20 };
            else {
                pagingInfo.pnum = pagingInfo.pnum || 1;
                pagingInfo.psize = pagingInfo.psize || 20;
            }

            var request = new Appacitive._Request({
                method: 'GET',
                type: 'push',
                op: 'getGetAllNotificationsUrl',
                args: [pagingInfo],
                options: options,
                onSuccess: function(d) {
                    request.promise.fulfill(d.pushnotifications, d.paginginfo);
                }
            });
            return request.send();
        };

    };

    Appacitive.Push = new _pushManager();

})(global);
(function (global) {

  "use strict";

  var Appacitive = global.Appacitive;

  var _file = function(ops) {
      
      ops = ops || {}; 
      this.fileId = ops.fileId;
      this.contentType = ops.contentType;
      this.fileData = ops.fileData;
      var that = this;

      var _getUrls = function(url, onSuccess, promise, description, options) {
          var request = new Appacitive.HttpRequest();
          request.url = url;
          request.method = 'GET';
          request.description = description;
          request.onSuccess = onSuccess;
          request.promise = promise;
          request.entity = that;
          request.options = options;
          Appacitive.http.send(request); 
      };

      var _upload = function(url, file, type, onSuccess, promise) {
          var request = new Appacitive.HttpRequest();
          request.url = url;
          request.method = 'PUT';
          request.log = false;
          request.description = 'Upload file';
          request.data = file;
          request.headers.push({ key:'Content-Type', value: type });
          request.send().then(onSuccess, function(d) {
            promise.reject(d, that);
          });
      };

      this.save = function(expiry, options) {
        if (typeof expiry !== 'number') {
          options = expiry;
          expiry = -1;
        }
          
        if (this.fileId && _type.isString(this.fileId) && this.fileId.length > 0)
          return _update(expiry, options);
        else
          return _create(expiry, options);
      };

      var _create = function(expiry, options) {
          if (!that.fileData) throw new Error('Please specify filedata');
          if(!that.contentType) {
            try { that.contentType = that.fileData.type; } catch(e) {}
          }
          if (!that.contentType || !_type.isString(that.contentType) || that.contentType.length === 0) that.contentType = 'text/plain';
          
          var promise = Appacitive.Promise.buildPromise(options);

          var url = Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.file.getUploadUrl(that.contentType, that.fileId ? that.fileId : '');
         
          _getUrls(url, function(response) {
                _upload(response.url, that.fileData, that.contentType, function() {
                    that.fileId = response.id;
                    
                    that.getDownloadUrl(expiry, options).then(function(res) {
                      return promise.fulfill(res, that);
                    }, function(e) {
                      return promise.reject(e);
                    });

                }, promise);
          }, promise, ' Get upload url for file ', options);

          return promise;
      };

      var _update = function(expiry, options) {
          if (!that.fileData) throw new Error('Please specify filedata');
          if(!that.contentType) {
            try { that.contentType = that.fileData.type; } catch(e) {}
          }
          if (!that.contentType || !_type.isString(that.contentType) || that.contentType.length === 0) that.contentType = 'text/plain';
          
          var promise = Appacitive.Promise.buildPromise(options);

          var url = Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.file.getUpdateUrl(that.fileId, that.contentType);
          
          _getUrls(url, function(response) {
              _upload(response.url, that.fileData, that.contentType, function() {
                  
                  that.getDownloadUrl(expiry, options).then(function(res) {
                    promise.fulfill(res, that);
                  }, function(e) {
                    promise.reject(e);
                  });

              }, promise);
          }, promise, ' Get update url for file ' + that.fileId, options);

          return promise;
      };

      this.destroy = function(options) {
          if (!this.fileId) throw new Error('Please specify fileId to delete');

          var promise = Appacitive.Promise.buildPromise(options);

          var request = new Appacitive.HttpRequest();
          request.url = Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.file.getDeleteUrl(this.fileId);
          request.method = 'DELETE';
          request.description = 'Delete file with id ' + this.fileId;
          request.onSuccess = function(response) {
              promise.fulfill();
          };
          request.promise = promise;
          request.entity = that;
          request.options= options;
          return Appacitive.http.send(request); 
      };

      this.getDownloadUrl = function(expiry, options) {
          if (!this.fileId) throw new Error('Please specify fileId to download');

          if (typeof expiry !== 'number') {
            options = expiry;
            expiry = -1;
          }
          
          var promise = Appacitive.Promise.buildPromise(options);

          var url = Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.file.getDownloadUrl(this.fileId, expiry);
 
          _getUrls(url, function(response) {
              that.url = response.uri;
              promise.fulfill(response.uri);
          }, promise,  ' Get download url for file ' + this.fileId, options);

          return promise;
      };

      this.getUploadUrl = function(options) {
          if (!that.contentType || !_type.isString(that.contentType) || that.contentType.length === 0) that.contentType = 'text/plain';

          var promise = Appacitive.Promise.buildPromise(options);

          var url = Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.file.getUploadUrl(this.contentType, this.fileId ? this.fileId : '');

          _getUrls(url, function(response) {
              that.url = response.url;
              promise.fulfill(response.url, that);
          }, promise, ' Get upload url for file ' + this.fileId, options);

          return promise;
      };
  };

  Appacitive.File = _file;

}(global));
(function (global) {
  
  "use strict";

  var Appacitive = global.Appacitive;
  
  Appacitive.Date = {};

  var pad = function (n) {
      if (n < 10) return '0' + n;
      return n;
  };

  Appacitive.Date.parseISODate = function (str) {
    try {
        var regexp = new RegExp("^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})" + "T" + "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" + "(.([0-9]+))?" + "Z?$");

        if (!regexp.exec(str)) return new Date(str);
          
        var parts = str.split('T'),
          dateParts = parts[0].split('-'),
          timeParts = parts[1].split('Z'),
          timeSubParts = timeParts[0].split(':'),
          timeSecParts = timeSubParts[2].split('.'),
          timeHours = Number(timeSubParts[0]),
          date = new Date();

        date.setUTCFullYear(Number(dateParts[0]));
        date.setUTCMonth(Number(dateParts[1])-1);
        date.setUTCDate(Number(dateParts[2]));
        
        date.setUTCHours(Number(timeHours));
        date.setUTCMinutes(Number(timeSubParts[1]));
        date.setUTCSeconds(Number(timeSecParts[0]));
        if (timeSecParts[1]) date.setUTCMilliseconds(Number(timeSecParts[1].substring(0, 3)));

        return date;
    } catch(e) {return null;}
  };

  Appacitive.Date.toISOString = function (date) {
    try {
      date = date.toISOString();
      date = date.replace('Z','0000Z');
      return date;
    } catch(e) { return null;}
  };

  Appacitive.Date.toISODate = function(date) {
    if (date instanceof Date) return String.format("{0}-{1}-{2}", date.getFullYear(), pad((date.getMonth() + 1)), pad(date.getDate()));
    throw new Error("Invalid date provided Appacitive.Date.toISODate method");
  };

  Appacitive.Date.toISOTime = function(date) {
    var padMilliseconds = function (n) {
                if (n < 10) return n + '000000';
           else if (n < 100) return n + '00000';
           else if (n < 1000) return n + '0000';
           else if (n < 10000) return n + '000';
           else if (n < 100000) return n + '00';
           else if (n < 1000000) return n + '0';
           return n;
    };
    if (date instanceof Date) return String.format("{0}:{1}:{2}.{3}", pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds()), padMilliseconds(date.getMilliseconds()));
    throw new Error("Invalid date provided Appacitive.Date.toISOTime method");
  };

  Appacitive.Date.parseISOTime = function(str) {
    try {
      var date = new Date();
    
      var parts = str.split('T');
      if (parts.length === 1) parts.push(parts[0]);
      
      var regexp = new RegExp("^([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" + "(.([0-9]+))?" + "Z?$");
      if (!regexp.exec(parts[1])) {
         return null;
      }

      var timeParts = parts[1].split('Z'),
      timeSubParts = timeParts[0].split(':'),
      timeSecParts = timeSubParts[2].split('.'),
      timeHours = Number(timeSubParts[0]);
      
      if (parts.length > 1) {
        date.setUTCHours(Number(timeHours));
        date.setUTCMinutes(Number(timeSubParts[1]));
        date.setUTCSeconds(Number(timeSecParts[0]));
        if (timeSecParts[1]) date.setUTCMilliseconds(Number(timeSecParts[1].substring(0, 3)));
      } else {
        date.setHours(Number(timeHours));
        date.setMinutes(Number(timeSubParts[1]));
        date.setSeconds(Number(timeSecParts[0]));
        if (timeSecParts[1]) date.setMilliseconds(Number(timeSecParts[1].substring(0, 3)));
      }

      return date;
    } catch(e) {return null;}
  };

})(global);
(function (global) {

    "use strict";

    var Appacitive = global.Appacitive;

    if (Appacitive.runtime.isBrowser) {

        var A_LocalStorage = function() {

            var _localStorage = (Appacitive.runtime.isBrowser) ? window.localStorage : { getItem: function() { return null; } };

            var isLocalStorageSupported = function() {
                var testKey = 'test';
                try {
                    _localStorage.setItem(testKey, '1');
                    _localStorage.removeItem(testKey);
                    return true;
                } catch (error) {
                    return false;
                }
            };

            this.set = function(key, value) {
                value = value || '';
                if (!key) return false;

                if (_type.isObject(value) || _type.isArray(value)) {
                    try {
                       value = JSON.stringify(value);
                    } catch(e){}
                }

                if (!isLocalStorageSupported()) {
                    Appacitive.Cookie.setCookie(key, value);
                    return this;
                } else {
                    key = Appacitive.getAppPrefix(key);
                    
                    _localStorage[key] = value;
                    return this;
                }
            };

            this.get = function(key) {
                if (!key) return null;

                var value;

                if (!isLocalStorageSupported()) {
                    value = Appacitive.Cookie.readCookie(key);
                } else {
                    key = Appacitive.getAppPrefix(key);
                    value = _localStorage.getItem(key);
                }

                if (!value) { return null; }

                // assume it is an object that has been stringified
                if (value[0] === "{") {
                    try {
                      value = JSON.parse(value);
                    } catch(e){}
                }

                return value;
            };
            
            this.remove = function(key) {
                if (!key) return;
                if (!isLocalStorageSupported()) {
                    Appacitive.Cookie.eraseCookie(key);
                    return;
                }
                key = Appacitive.getAppPrefix(key);
                try { delete _localStorage[key]; } catch(e){}
            };
        };
        Appacitive.localStorage = new A_LocalStorage();

    } else {
        var A_LocalStorage = function() {
            
            var _localStorage = [];

            this.set = function(key, value) {
                value = value || '';
                if (!key || _type.isString(key)) return false;

                key = Appacitive.getAppPrefix(key);

                _localStorage[key] = value;
                return this;
            };

            this.get = function(key) {
                if (!key || _type.isString(key)) return null;

                key = Appacitive.getAppPrefix(key);

                var value = _localStorage[key];
                if (!value) { return null; }

                return value;
            };
            
            this.remove = function(key) {
                if (!key || _type.isString(key)) return;
                key = Appacitive.getAppPrefix(key);
                try { delete _localStorage[key]; } catch(e){}
            };
        };

        Appacitive.localStorage = new A_LocalStorage();
    }
})(global);
(function (global) {

"use strict";

var Appacitive = global.Appacitive;

if (Appacitive.runtime.isBrowser) {

    var _cookieManager = function () {

        this.setCookie = function (name, value, minutes, erase) {
            name = Appacitive.getAppPrefix(name);
            var expires = '';
            if (minutes) {
                var date = new Date();
                date.setTime(date.getTime() + (minutes*60*1000));
                expires = "; expires=" + date.toGMTString();
            }

            if (!erase) {
                //for now lets make this a session cookie if it is not an erase
                if (!Appacitive.Session.persistUserToken) expires = '';
                else expires = "; expires=" +  new Date("2020-12-31").toGMTString();
            } else {
                expires = '; expires=Thu, 01-Jan-1970 00:00:01 GMT';
            }
            var domain = 'domain=' + window.location.hostname;
            if (window.location.hostname == 'localhost') domain = '';
            
            document.cookie = name + "=" + value + expires + "; path=/;" + domain;
        };

        this.readCookie = function (name) {
            name = Appacitive.getAppPrefix(name);
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i=0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        };

        this.eraseCookie = function (name) {
            this.setCookie(name, "" ,-1, true);
        };

    };

    Appacitive.Cookie = new _cookieManager();

} else {
    var _cookieManager = function () {

            this.setCookie = function (name, value) {
                    Appacitive.localStorage.set( 'cookie/' + name, value);
            };

            this.readCookie = function (name) {
                    return Appacitive.localStorage.get( 'cookie/' + name);
            };

            this.eraseCookie = function (name) {
                    Appacitive.localStorage.remove( 'cookie/' + name);
            };

    };
    Appacitive.Cookie = new _cookieManager();
}

})(global);
(function (global) {

    "use strict";

    var _cloud = function() {

        var apis = [];

        var registerApi = function() {

            if (arguments.length !== 2) throw "Invalid no. of arguments provided to cloud function declare" ;
            
            if (typeof arguments[0] !== 'string') throw "Error: Provide name fo cloud api" ;
            if (typeof arguments[1] !== 'function') throw "Error: Invalid api function provided for cloud api" ;

            var name = arguments[0];

            var regExp = /^[A-Za-z][A-Za-z_0-9]*$/;
            if (!regExp.test(name)) {
                throw "Error: Invalid name for api function " + name;
            }

            apis[name.toLowerCase()] = arguments[1];
        };

        this.declare = function() {
            registerApi.apply(null, arguments);         
        };

        this.declare.toString = function() { return "function () { [native code] }"; }

        var executeApi = function() {
            if (arguments.length < 2 || typeof arguments[0] !== 'string' || typeof arguments[1] !== 'object')
                throw new "Error: Invalid list of arguments passed to cloud api" ;

            var name = arguments[0].toLowerCase();

            var request = arguments[1].request;
            var response = arguments[1].response;

            if (typeof apis[name] == 'function') {
                var method = apis[name];
                setTimeout(function() {
                    method.apply(null , [request, response]);   
                }, 0);
            } else {
                throw { code: '404', message: "Error: Api with name " + arguments[0] + " doesn't exits" };
            }
        };

        this.execute = function() {
            executeApi.apply(null, arguments);          
        };

        this.execute.toString = function() { return "function () { [native code] }"; }

    };

    global.Appacitive.Cloud = new _cloud();

})(global);

(function (global) {

	"use strict";

	var _cloud = function() {

		var apis = [];

		var registerApi = function() {

			if (arguments.length !== 2) throw "Invalid no. of arguments provided to cloud function declare" ;
			
			if (typeof arguments[0] !== 'string') throw "Error: Provide name fo cloud api" ;
			if (typeof arguments[1] !== 'function') throw "Error: Invalid api function provided for cloud api" ;

			var name = arguments[0];

			var regExp = /^[A-Za-z][A-Za-z_0-9]*$/;
		    if (!regExp.test(name)) {
		    	throw "Error: Invalid name for api function " + name;
		    }

			apis[name.toLowerCase()] = arguments[1];
		};

		this.declare = function() {
			registerApi.apply(null, arguments);			
		};

		this.declare.toString = function() { return "function () { [native code] }"; }

		var executeApi = function() {
			if (arguments.length < 2 || typeof arguments[0] !== 'string' || typeof arguments[1] !== 'object')
				throw new "Error: Invalid list of arguments passed to cloud api" ;

			var name = arguments[0].toLowerCase();

			var request = arguments[1].request;
			var response = arguments[1].response;

			if (typeof apis[name] == 'function') {
				var method = apis[name];
				setTimeout(function() {
					method.apply(null , [request, response]);	
				}, 0);
			} else {
				throw { code: '404', message: "Error: Api with name " + arguments[0] + " doesn't exits" };
			}
		};

		this.execute = function() {
			executeApi.apply(null, arguments);			
		};

		this.execute.toString = function() { return "function () { [native code] }"; }

	};

	global.Appacitive.Cloud = new _cloud();

})(global);

if (typeof module !== 'undefined' && !global.Appacitive.runtime.isBrowser) module.exports =  global.Appacitive;
