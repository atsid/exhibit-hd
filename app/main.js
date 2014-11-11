/**
 * Simple express app to serve tutorial pages and services.
 */
var express = require('express')
    , http = require('http')
    , path = require('path')
    , registry = require('./registry-services')
    , serviceRegistry = require('./service-registry');

var app = express();

app.set('port', process.env.PORT || 3000);

var options = {
    extensions: ["jsonld"],
    setHeaders: function (res, path, stat) {
        res.set("Content-Type", "application/ld+json");
    }
};

app.use("/schema", express.static(__dirname + "/schema", options));

app.get("/services", function (req, res, next) {
    console.log("requested services");
    res.set("Content-Type", "application/ld+json");
    res.status(200).sendFile(__dirname + "/schema/services/store/list.jsonld");
});

app.get("/services/:id", function (req, res, next) {
    console.log("requested service: " + req.params.id);
    res.set("Content-Type", "application/ld+json");
    res.status(200).sendFile(__dirname + "/schema/services/store/" + req.params.id + ".jsonld");
});


//registry(app, {
//    middleware: [express.bodyParser()],
//    zookeepers: {
//        servers: [{
//            host: '54.148.38.31',
//            port: 2181
//        }]
//    }
//});
//
//serviceRegistry(app, {
//    middleware: [express.bodyParser()]
//});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});