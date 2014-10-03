
var cluster = require('cluster'),
      // app = require('./app'),
      multicore = true,
      port = ( process.env.PORT || 3100 );

/** cluster webserver across all cores **/
if( multicore ){

  if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

  // Code to run if we're in a worker process
  } else {

    var app = require('express')();

    /** ----------------------- middleware ----------------------- **/

    app.use( require('./middleware/toobusy') ); // should be first
    app.use( require('./middleware/headers') );
    app.use( require('./middleware/cors') );
    app.use( require('./middleware/jsonp') );

    /** ----------------------- sanitisers ----------------------- **/

    var sanitisers = {};
    sanitisers.suggest  = require('./sanitiser/suggest');
    sanitisers.search   = sanitisers.suggest;
    sanitisers.reverse  = require('./sanitiser/reverse');

    /** ----------------------- controllers ----------------------- **/

    var controllers     = {};
    controllers.index   = require('./controller/index');
    controllers.suggest = require('./controller/suggest');
    controllers.search  = require('./controller/search');

    /** ----------------------- routes ----------------------- **/

    // api root
    app.get( '/', controllers.index() );

    // suggest API
    app.get( '/suggest', sanitisers.suggest.middleware, controllers.suggest() );

    // search API
    app.get( '/search', sanitisers.search.middleware, controllers.search() );

    // reverse API
    app.get( '/reverse', sanitisers.reverse.middleware, controllers.search(undefined, require('./query/reverse')) );


    /** ----------------------- error middleware ----------------------- **/

    app.use( require('./middleware/404') );
    app.use( require('./middleware/500') );
    app.listen( process.env.PORT || 3100 );

    console.log('Application running!');

  }

  // Listen for dying workers
  cluster.on('exit', function (worker) {

    // Replace the dead worker,
    // we're not sentimental
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();

  });

  // @todo: not finished yet
  // cluster(app)
  //   .use(cluster.stats())
  //   .listen( process.env.PORT || 3100 );
}
else {
  // console.log( 'listening on ' + port );
  // app.listen( process.env.PORT || 3100 );
}
