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
        client.getChildren('/exhibit/registry', function (err, nodes) {
            assert.ifError(err);

            var someObj = {};

            async.each(nodes, function (id, callback) {
                client.getData('/exhibit/registry/' + id, function (err, obj) {
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
        client.getData('/exhibit/registry/' + request.params.id, function (err, obj) {
            assert.ifError(err);
            console.log('Found object with id ' + request.params.id);
            response.status(200).send(JSON.parse(obj.toString())).end();
        });
    });

    app.put('/registry/:id', config.middleware, function (request, response, next) {
        console.log("save schema with id " + request.params.id);

        var setZookeeperData = function (err) {
            assert.ifError(err);

            client.setData(
                path,
                new Buffer(JSON.stringify(request.body)),
                function (error, path) {
                    if (error) {
                        console.log('Failed to create node: %s due to: %s.', path, error);
                    }

                    assert.ifError(error);

                    console.log('Node: %s is created.', path);
                }
            );
        };

        var path = '/exhibit/registry/' + request.params.id;
        client.exists(path, function (err, status) {
            if (status) {
                setZookeeperData(err);
            } else {
                client.mkdirp(path, setZookeeperData);
            }
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