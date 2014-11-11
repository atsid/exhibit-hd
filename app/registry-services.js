module.exports = function (app, config) {
    var assert = require('assert');
    var zkplus = require('zkplus');

    var client = zkplus.createClient(config.zookeepers);
    client.connect();

    app.get('/registry', config.middleware, function (request, response, next) {
        console.log("return list of all schemas filtered by param type (type name is TBD)");

        client.get('/objects', function(err, obj) {
            response.send(obj);
        });
    });

    app.put('/registry/:id', config.middleware, function (request, response, next) {
        console.log("save schema with id " + request.params.id);

        client.put('/objects/' + request.params.id, request.body, function(err) {
            assert.ifError(err);
        });

        response.status(200);
        response.end();
    });

    app.delete('/registry/:id', config.middleware, function (request, response, next) {
        console.log("delete schema with id " + request.params.id);
        response.status(204);
        response.end();
    });
}