module.exports = function (app, config) {
    var assert = require('assert');
    var zkplus = require('zkplus');

    var client = zkplus.createClient(config.zookeepers);
    client.connect();

    app.get('/registry', config.middleware, function (request, response, next) {
        console.log("return list of all schemas filtered by param type (type name is TBD)");


        client.readdir('/objects', function (err, nodes) {
            assert.ifError(err);

            var someObj = {};
            var requiredCount = nodes.length;
            var foundCount = 0;

            for (var i = 0; i < nodes.length; i++) {
                var id = nodes[i];
                client.get('/objects/' + id, function(err, obj) {
                    someObj[id] = obj;

                    console.log("Wrining " + id);

                    foundCount++;
                    if(foundCount == requiredCount) {
                        console.log("Writing response " + someObj);
                        response.send(someObj);
                    }
                })
            }
            console.log("Exiting function");
            //response.send(someObj);
            //console.log(nodes); // => ['00000000', 'baz']
            //response.send(someObj);
        });

/*        client.get('/objects', function(err, obj) {
            response.send(obj);
        });*/
    });

    app.put('/registry/:id', config.middleware, function (request, response, next) {
        console.log("save schema with id " + request.params.id);

        client.mkdirp('/objects', function(err) {
            assert.ifError(err);
        });
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