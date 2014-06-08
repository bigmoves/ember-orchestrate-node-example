'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = Number(process.env.PORT || 3000);

app.use(require('./middleware/cors'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

app.use(function(req, res, next){
  console.log('%s %s %s %s', req.ip, req.method, req.url, res.statusCode);
  next();
});

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
   // configure stuff here
}

/*
// catch all route
app.all('/app/*', function(req, res, next) {
  res.sendfile('public/index.html');
});
*/

require('./routes')(app);

app.listen(port, function() {
  console.log("Listening on " + port);
});
