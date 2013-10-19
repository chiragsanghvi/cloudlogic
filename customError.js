var restify = require('restify');
var util = require('util');

/* custom error message for get handler */
var CustomError = function (code, message, body) {
  restify.RestError.call(this, {
    restCode: code,
    statusCode: code,
    constructorOpt: InvalidError,
    message: message,
    body: body
  });

  this.name = 'InvalidError';
};

util.inherits(CustomError, restify.RestError);

module.exports = CustomError;
