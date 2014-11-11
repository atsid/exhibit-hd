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
                    someObj[id] = JSON.parse(obj.toString());

                    callback();
                })
            }, function (err) {
                assert.ifError(err);
                response.send(someObj).end();
            })
        });
    });

    app.get('/registry/:id', config.middleware, function (request, response, next) {
        var path = '/exhibit/registry/' + request.params.id;

        client.exists(path, function (err, status) {
            if (status) {
                client.getData(path, function (err, obj) {
                    assert.ifError(err);
                    response.status(200).send(JSON.parse(obj.toString())).end();
                });
            } else {
                response.status(404).end();
            }
        });
    });

    app.put('/registry/:id', config.middleware, function (request, response, next) {

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

                    response.status(200);
                    response.end();
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
    });

    app.delete('/registry/:id', config.middleware, function (request, response, next) {
        var path = '/exhibit/registry/' + request.params.id;
        client.exists(path, function (err, status) {
            if (status) {
                client.remove(path, function (err) {
                    assert.ifError(err);

                    response.status(204);
                    response.end();
                })
            } else {
                response.status(404);
                response.end();
            }
        });
    });
}