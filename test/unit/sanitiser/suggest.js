
var suggest  = require('../../../sanitiser/suggest'),
    _sanitize = suggest.sanitize,
    middleware = suggest.middleware,
    defaultError = 'invalid param \'input\': text length, must be >0',
    defaultClean = { input: 'test', lat: 0, layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood' ], lon: 0, size: 10, zoom: 10 },
    sanitize = function(query, cb) { _sanitize({'query':query}, cb); }

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'sanitizee has a valid middleware');
    t.end();
  });
};

module.exports.tests.sanitize_input = function(test, common) {
  var inputs = {
    invalid: [ '', 100, null, undefined, new Date() ],
    valid: [ 'a', 'aa', 'aaaaaaaa' ]
  };
  test('invalid input', function(t) {  
    inputs.invalid.forEach( function( input ){
      sanitize({ input: input, lat: 0, lon: 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'input\': text length, must be >0', input + ' is an invalid input');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
  test('valid input', function(t) {  
    inputs.valid.forEach( function( input ){
      sanitize({ input: input, lat: 0, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.input = input;
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean, expected, 'clean set correctly (' + input + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lat = function(test, common) {
  var lats = {
    invalid: [ -181, -120, -91, 91, 120, 181 ],
    valid: [ 0, 45, 90, -0, '0', '45', '90' ]
  };
  test('invalid lat', function(t) {  
    lats.invalid.forEach( function( lat ){
      sanitize({ input: 'test', lat: lat, lon: 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'lat\': must be >-90 and <90', lat + ' is an invalid latitude');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
  test('valid lat', function(t) {  
    lats.valid.forEach( function( lat ){
      sanitize({ input: 'test', lat: lat, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lat = parseFloat( lat );
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean, expected, 'clean set correctly (' + lat + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lon = function(test, common) {
  var lons = {
    invalid: [ -360, -181, 181, 360 ],
    valid: [ -180, -1, -0, 0, 45, 90, '-180', '0', '180' ]
  };
  test('invalid lon', function(t) {  
    lons.invalid.forEach( function( lon ){
      sanitize({ input: 'test', lat: 0, lon: lon }, function( err, clean ){
        t.equal(err, 'invalid param \'lon\': must be >-180 and <180', lon + ' is an invalid longitude');
        t.equal(clean, undefined, 'clean not set');
        
      });
    });
    t.end();
  });
  test('valid lon', function(t) {  
    lons.valid.forEach( function( lon ){
      sanitize({ input: 'test', lat: 0, lon: lon }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lon = parseFloat( lon );
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean, expected, 'clean set correctly (' + lon + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_zoom = function(test, common) {
  test('invalid zoom value', function(t) {
    sanitize({ zoom: 'a', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 10, 'default zoom set');
      t.end();
    });
  });
  test('below min zoom value', function(t) {
    sanitize({ zoom: -100, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 1, 'min zoom set');
      t.end();
    });
  });
  test('above max zoom value', function(t) {
    sanitize({ zoom: 9999, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 18, 'max zoom set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_size = function(test, common) {
  test('invalid size value', function(t) {
    sanitize({ size: 'a', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    sanitize({ size: -100, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    sanitize({ size: 9999, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_layers = function(test, common) {
  test('unspecified', function(t) {
    sanitize({ layers: undefined, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, defaultClean.layers, 'default layers set');
      t.end();
    });
  });
  test('invalid layer', function(t) {
    sanitize({ layers: 'test_layer', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      var msg = 'invalid param \'layer\': must be one or more of geoname,osmnode,osmway,admin0,admin1,admin2,neighborhood,poi,admin';
      t.equal(err, msg, 'invalid layer requested');
      t.end();
    });
  });
  test('poi (alias) layer', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    sanitize({ layers: 'poi', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, poi_layers, 'poi layers set');
      t.end();
    });
  });
  test('admin (alias) layer', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood'];
    sanitize({ layers: 'admin', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, admin_layers, 'admin layers set');
      t.end();
    });
  });
  test('poi alias layer plus regular layers', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    var reg_layers = ['admin0', 'admin1'];
    sanitize({ layers: 'poi,admin0,admin1', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, reg_layers.concat(poi_layers), 'poi + regular layers');
      t.end();
    });
  });
  test('admin alias layer plus regular layers', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood'];
    var reg_layers   = ['geoname', 'osmway'];
    sanitize({ layers: 'admin,geoname,osmway', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, reg_layers.concat(admin_layers), 'admin + regular layers set');
      t.end();
    });
  });
  test('alias layer plus regular layers (no duplicates)', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    sanitize({ layers: 'poi,geoname,osmnode', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, poi_layers, 'poi layers found (no duplicates)');
      t.end();
    });
  });
  test('multiple alias layers (no duplicates)', function(t) {
    var alias_layers = ['geoname','osmnode','osmway','admin0','admin1','admin2','neighborhood'];
    sanitize({ layers: 'poi,admin', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, alias_layers, 'all layers found (no duplicates)');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('invalid input params', function(t) {
    sanitize( undefined, function( err, clean ){
      t.equal(err, defaultError, 'handle invalid params gracefully');
      t.end();
    });
  });
};

module.exports.tests.middleware_failure = function(test, common) {
  test('middleware failure', function(t) {
    var res = { status: function( code ){
      t.equal(code, 400, 'status set');
    }};
    var next = function( message ){
      t.equal(message, defaultError);
      t.end();
    };
    middleware( {}, res, next );
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { input: 'test', lat: 0, lon: 0 }};
    var next = function( message ){
      t.equal(message, undefined, 'no error message set');
      t.deepEqual(req.clean, defaultClean);
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /suggest ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};