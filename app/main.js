/**
 * Simple express app to serve tutorial pages and services.
 */
var express = require('express')
    , http = require('http')
    , path = require('path')
    , registry = require('./registry-services');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname));

registry(app, {
    middleware: [express.bodyParser()]
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});