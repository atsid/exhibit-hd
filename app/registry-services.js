module.exports = function (app, config) {
    app.get('/registry', config.middleware, function (request, response, next) {
        console.log("return list of all schemas filtered by param type (type name is TBD)");
        response.status(200);
        response.end();
    });

    app.put('/registry/:id', config.middleware, function (request, response, next) {
        console.log("save schema with id " + request.params.id);
        response.status(200);
        response.end();
    });

    app.delete('/registry/:id', config.middleware, function (request, response, next) {
        console.log("delete schema with id " + request.params.id);
        response.status(204);
        response.end();
    });
}