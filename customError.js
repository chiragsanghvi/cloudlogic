var restify = require('restify');
var util = require('util');

/* custom error message for get handler */
var CustomError = function (code, message, body) {
  restify.RestError.call(this, {
    restCode: code,
    statusCode: code,
    constructorOpt: CustomError,
    message: message,
    body: body
  });

  this.name = 'CustomError';
};

util.inherits(CustomError, restify.RestError);

module.exports = CustomError;
