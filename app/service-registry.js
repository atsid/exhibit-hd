module.exports = function (app, config) {
    app.get('/service-registry', config.middleware, function (request, response, next) {
        console.log("return list of all service registry instances filtered by param types (type name is TBD)");
        response.status(200);
        response.end();
    });

    app.get('/service-registry/:id', config.middleware, function (request, response, next) {
        console.log("return individual service registry for " + request.params.id);
        response.status(200).end();
    });

    app.put('/service-registry/:id', config.middleware, function (request, response, next) {
        console.log("save registry entry with id " + request.params.id);
        response.status(200);
        response.end();
    });

    app.post('/service-registry/', config.middleware, function (request, response, next) {
        console.log("save new registry entry");
        response.status(201);
        response.end();
    });

    app.delete('/service-registry/:id', config.middleware, function (request, response, next) {
        console.log("delete registry entry with id " + request.params.id);
        response.status(204);
        response.end();
    });
}