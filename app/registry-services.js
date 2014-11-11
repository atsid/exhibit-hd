module.exports = function (app, config) {
    var assert = require('assert');
    var zookeeper = require('node-zookeeper-client');
    var async = require('async');

    var client = zookeeper.createClient(
        config.zookeeperConfiguration.zookeepers,
        {sessionTimeout: 10000}
    );
    client.connect();

    app.get('/registry', config.middleware, function (request, response, next) {
        client.getChildren('/exhibit', function (err, nodes) {
            assert.ifError(err);

            var someObj = {};

            async.each(nodes, function (id, callback) {
                client.getData('/exhibit/' + id, function (err, obj) {
                    assert.ifError(err);
                    console.log('Found object with id ' + id);
                    someObj[id] = JSON.parse(obj.toString());

                    callback();
                })
            }, function (err) {
                assert.ifError(err);
                response.send(someObj);
            })
        });
    });

    app.get('/registry/:id', config.middleware, function (request, response, next) {
        client.getData('/exhibit/' + request.params.id, function (err, obj) {
            assert.ifError(err);
            console.log('Found object with id ' + request.params.id);
            response.status(200).send(JSON.parse(obj.toString())).end();
        });
    });

    app.put('/registry/:id', config.middleware, function (request, response, next) {
        console.log("save schema with id " + request.params.id);

        var path = '/exhibit/' + request.params.id;
        client.mkdirp('/exhibit', function (err) {
            assert.ifError(err);

            client.create(
                path,
                new Buffer(JSON.stringify(request.body)),
                //CreateMode.EPHEMERAL,
                function (error, path) {
                    if (error) {
                        console.log('Failed to create node: %s due to: %s.', path, error);
                    }

                    assert.ifError(error);

                    console.log('Node: %s is created.', path);
                }
            );
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