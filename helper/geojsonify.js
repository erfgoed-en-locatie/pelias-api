
var GeoJSON = require('geojson');

function suggest( docs ){

  // emit a warning if the doc format is invalid
  // @note: if you see this error, fix it ASAP!
  function warning(){
    console.error( 'error: invalid doc', __filename );
    return false; // remove offending doc from results
  }

  // flatten & expand data for geojson conversion
  var geodata = docs.map( function( doc ){

    // something went very wrong
    if( !doc || !doc.payload ) return warning();

    // split payload id string in to geojson properties
    if( 'string' !== typeof doc.payload.id ) return warning();
    var idParts = doc.payload.id.split('/');
    doc.type = idParts[0];
    doc.id = idParts[1];

    // split payload geo string in to geojson properties
    if( 'string' !== typeof doc.payload.geo ) return warning();
    var geoParts = doc.payload.geo.split(',');
    doc.lat = parseFloat( geoParts[1] );
    doc.lng = parseFloat( geoParts[0] );

    // remove payload from doc
    delete doc.payload;
    return doc;

  // filter-out invalid entries
  }).filter( function( doc ){
    return doc;
  });

  // convert to geojson
  return GeoJSON.parse( geodata, { Point: ['lat', 'lng'] } );

}

function search( docs ){

  // emit a warning if the doc format is invalid
  // @note: if you see this error, fix it ASAP!
  function warning(){
    console.error( 'error: invalid doc', __filename );
    return false; // remove offending doc from results
  }

  // flatten & expand data for geojson conversion
  var geodata = docs.map( function( doc ){

    // ======= doc: =======
    // {
    //   "_source": {
    //     "uri": "http://data.erfgeo.nl/grs/Place/Ootmarsum/1",
    //     "date_created": "2014-11-18T10:46:26.893Z",
    //     "source": {
    //       "name": "Ootmarsum",
    //       "uri": "http://vocab.getty.edu/tgn/1048021",
    //       "dataset": "tgn"
    //     },
    //     "relationship": {
    //       "created": "2014-11-18T10:46:26.893Z",
    //       "author": "bert@waag.org",
    //       "type": "grs:approximation",
    //       "uri": "http://data.erfgeo.nl/grs/Relationship/Ootmarsum/1"
    //     },
    //     "target": {
    //       "name": "Ootmarsum",
    //       "uri": "http://lod.geodan.nl/basisreg/bag/woonplaats/id_1412",
    //       "startDate": 2014,
    //       "endDate": null,
    //       "dataset": "bag",
    //       "geometry": {
    //         "type": "MultiPolygon",
    //         "coordinates": [
    //           [
    //             [
    //               [
    //                 6.891786,
    //                 52.415643
    //               ],
    //               [
    //                 6.892063,
    //                 52.415336
    //               ]
    //             ]
    //           ]
    //         ]
    //       }
    //     }
    //   }
    // }

    // ======= MAAR WE WILLEN: =======
    // {
    //   "type": "FeatureCollection",
    //   "features": [
    //     {
    //       "type": "Feature",
    //       "properties": {
    //         "uri": "http://data.erfgeo.nl/grs/Place/Amstelodamum/1",
    //         "date_created": "2014-11-14 12:00:55",
    //         "source": {
    //           "name": "Amstelodamum",
    //           "uri": "http://vocab.getty.edu/tgn/7006952",
    //           "startDate": 1764,
    //           "endDate": 1894,
    //           "dataset": "tgn"
    //         },
    //         "relationship": {
    //           "created": "2014-11-14 14:04:41",
    //           "author": "taco@waag.org",
    //           "type": "grs:approximation",
    //           "uri": "http://data.erfgeo.nl/grs/Relationship/Amstelodamum/1"
    //         },
    //         "target": {
    //           "name": "Amsterdam Stadsdeel Centrum",
    //           "uri": "http://bag.nl/plaats/amsterdam-centrum",
    //           "startDate": 2014,
    //           "endDate": null,
    //           "dataset": "bag"
    //         }
    //       },
    //       "geometry": {
    //         "type": "Polygon",
    //         "coordinates": [
    //           [
    //             [4.896469, 52.386912],
    //             [4.809820, 52.328593],
    //             [4.801368, 52.357154],
    //             [4.887973, 52.326120],
    //             [4.941001, 52.325332],
    //             [4.969253, 52.377275],
    //             [4.901001, 52.408074],
    //             [4.901275, 52.326762],
    //             [4.896469, 52.386915]
    //           ]
    //         ]
    //       }
    //     }
    //   ]
    // }

    var geometry = doc.target.geometry;
    delete doc.target.geometry;

    var output = {
      type: "Feature",
      properties: doc,
      geometry: geometry
    };

    return output;

  // filter-out invalid entries
  }).filter( function( doc ){
    return doc;
  });

  // convert to geojson
  //return GeoJSON.parse( geodata, { Point: ['lat', 'lng'] } );
  return {
    type: "FeatureCollection",
    features: geodata
  }

}

module.exports.suggest = suggest;
module.exports.search = search;