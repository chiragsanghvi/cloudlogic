///--- Globals
var InvalidHeaderError = require('restify').InvalidHeaderError;

///--- Helpers

function parseBasic(string) {
    var decoded;
    var index;
    var pieces;

    decoded = (new Buffer(string, 'base64')).toString('utf8');
    if (!decoded)
            throw new InvalidHeaderError('Authorization header invalid');

    index = decoded.indexOf(':');
    if (index === -1) {
        pieces = [decoded];
    } else {
        pieces = [decoded.slice(0, index), decoded.slice(index + 1)];
    }

    if (!pieces || typeof (pieces[0]) !== 'string' || pieces.length != 2)
            throw new InvalidHeaderError('Authorization header invalid');

    var args = {};

    var auth = ["ak", "ut" , "e", "appid"];

    index = pieces[0].indexOf('=');
    if (index > 0  && index != (pieces[0].length -1)) {
        var key = pieces[0].substring(0, index).toLowerCase();
        var value = pieces[0].substring(index + 1);

        if (key === 'appid') {
            args[key] = value;
        } else {
            throw new InvalidHeaderError('BasicAuth content ' + 'is invalid.');
        }
    }

    var isSet = false;

    pieces = pieces[1].split(':');

    for (var i=0; i < pieces.length; i=i+1) {
        if (typeof pieces[i] == 'string') {
            index = pieces[i].indexOf('=');
            if (index > 0  && index != (pieces[i].length -1)) {
                var key = pieces[i].substring(0, index).toLowerCase();
                var value = pieces[i].substring(index + 1);

                if (auth.indexOf(key) !== -1) {
                    args[key] = value;
                    isSet = true;
                }
            }
        }
    }
    
    if (!isSet) {
        throw new InvalidHeaderError('BasicAuth content ' + 'is invalid.');
    }

    return args;
}

/**
 * Returns a plugin that will parse the client's Authorization header.
 *
 * Subsequent handlers will see `req.authorization`, which looks like:
 *
 * {
 *   scheme: <Basic|Signature|...>,
 *   credentials: <Undecoded value of header>,
 *   basic: {
 *     //all arguments
 *   }
 * }
 *
 *
 * @return {Function} restify handler.
 * @throws {TypeError} on bad input
 */
function authorizationParser() {

        function parseAuthorization(req, res, next) {

                req.authorization = {};

                if (!req.headers.authorization) return (next());

                var pieces = req.headers.authorization.split(' ', 2);
                if (!pieces || pieces.length !== 2) {
                        var e = new InvalidHeaderError('BasicAuth content ' + 'is invalid.');
                        return (next(e));
                }

                delete req.headers.authorization;

                req.authorization.scheme = pieces[0];
                req.authorization.credentials = pieces[1];
                
                try {
                    switch (pieces[0].toLowerCase()) {
                        case 'basic':
                                req.authorization.basic = parseBasic(pieces[1]);
                                break;

                        default:
                                break;
                    }
                } catch (e2) {
                    return (next(e2));
                }

                return (next());
        }

        return (parseAuthorization);
}

module.exports = authorizationParser;