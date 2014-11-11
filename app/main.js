/**
 * Simple express app to serve tutorial pages and services.
 */
var express = require('express')
    , http = require('http')
    , path = require('path')
    , registry = require('./registry-services')
    , serviceRegistry = require('./service-registry')
    , bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);

var options = {
    extensions: ["jsonld"],
    setHeaders: function (res, path, stat) {
        res.set("Content-Type", "application/ld+json");
    }
};

app.use("/schema", express.static(__dirname + "/schema", options));

app.get("/api/", function (req, res, next) {
    res.set("Content-Type", "application/ld+json");
    res.status(200).sendFile(__dirname + "/store/api.jsonld");
});

app.get("/api/services", function (req, res, next) {
    console.log("requested services");
    res.set("Content-Type", "application/ld+json");
    res.status(200).sendFile(__dirname + "/store/list.jsonld");
});

app.get("/api/services/:id", function (req, res, next) {
    console.log("requested service: " + req.params.id);
    res.set("Content-Type", "application/ld+json");
    res.status(200).sendFile(__dirname + "/store/" + req.params.id + ".jsonld");
});


registry(app, {
    middleware: [bodyParser.json()],
    zookeeperConfiguration: {zookeepers: "54.148.38.31:2181"}
});

serviceRegistry(app, {
    middleware: [bodyParser.json()]
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});