
var logger = require('../src/logger'),
    _sanitize = require('../sanitiser/_sanitize'),
    sanitizers = {
      id: require('../sanitiser/_id')
    };

var sanitize = function(req, cb) { _sanitize(req, sanitizers, cb); }

// export sanitize for testing
module.exports.sanitize = sanitize;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    if( err ){
      res.status(400); // 400 Bad Request
      return next(err);
    }
    req.clean = clean;
    next();
  });
};