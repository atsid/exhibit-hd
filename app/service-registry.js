module.exports = function (app, config) {
    var assert = require('assert');
    var zookeeper = require('node-zookeeper-client');
    var async = require('async');

    var client = zookeeper.createClient(
        config.zookeeperConfiguration.zookeepers,
        {sessionTimeout: 10000}
    );
    client.connect();

    app.get('/service-registry', config.middleware, function (request, response, next) {
        client.getChildren('/exhibit/registry/service', function (err, nodes) {
            assert.ifError(err);

            var someObj = {};

            async.each(nodes, function (id, callback) {
                client.getData('/exhibit/registry/service/' + id, function (err, obj) {
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

    app.get('/service-registry/:id', config.middleware, function (request, response, next) {
        var path = '/exhibit/registry/service/' + request.params.id;

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

    app.put('/service-registry/:id', config.middleware, function (request, response, next) {
        var path = '/exhibit/registry/service/' + request.params.id;
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

        client.exists(path, function (err, status) {
            if (status) {
                setZookeeperData(err);
            } else {
                client.mkdirp(path, setZookeeperData);
            }
        });
    });

    app.post('/service-registry/', config.middleware, function (request, response, next) {
        var path = '/exhibit/registry/service/autogenid';
        var setZookeeperData = function (err, newpath) {
            assert.ifError(err);

            console.log("new path " + newpath)

            client.setData(
                newpath,
                new Buffer(JSON.stringify(request.body)),
                function (error, param) {
                    if (error) {
                        console.log('Failed to create node: %s due to: %s.', path, error);
                    }

                    assert.ifError(error);

                    response.status(200);
                    response.end();
                }
            );
        };

        client.mkdirp(path, 2, setZookeeperData);
    });

    app.delete('/service-registry/:id', config.middleware, function (request, response, next) {
        var path = '/exhibit/registry/service/' + request.params.id;
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