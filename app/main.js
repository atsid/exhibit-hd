/**
 * Simple express app to serve tutorial pages and services.
 */
var express = require('express')
    , http = require('http')
    , path = require('path')
    , schemaRegistry = require('./schema-registry')
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

app.get("/mock-services", function (req, res, next) {
    res.set("Content-Type", "application/ld+json");
    res.status(200).sendFile(__dirname + "/store/list.jsonld");
});

app.get("/mock-services/:id", function (req, res, next) {
    res.set("Content-Type", "application/ld+json");
    res.status(200).sendFile(__dirname + "/store/" + req.params.id + ".jsonld");
});


schemaRegistry(app, {
    middleware: [bodyParser.json()],
    zookeeperConfiguration: {zookeepers: "54.148.38.31:2181"}
});

serviceRegistry(app, {
    middleware: [bodyParser.json()],
    zookeeperConfiguration: {zookeepers: "54.148.38.31:2181"}
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});