// Define variables & dependencies

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const async = require('async');
const locationModel = require('./location')();
const controllers = require('./controller');
const Location = mongoose.model('Location');
const fs = require('fs');
const path = require('path');
const uri = 'mongodb://localhost:27017/geospatial_db';
const options = { useNewUrlParser: true, useUnifiedTopology: true };

const app = express();

// Bootstrap mongoose and load dummy data
const init = () => {
  // load data from file and transform it to Object
  mongoose.connect(uri, options).then(
    () => { 
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

      // clean db and load new data
      Location.deleteOne(() => {
        async.each(data, (item, callback) => {
          // create a new location
          Location.create(item, callback);
        }, (err) => {
          if (err) throw err;
        });
      });
     },
    err => {
      console.log('error...');
     }
  );
};

// Bootstrap mongoose and load dummy data
init();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.get('/', controllers.index);
app.get('/api/locations', controllers.findLocation);

// Start the server
// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

const server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});