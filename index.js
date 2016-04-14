var createRetorter = require('retort'),
    errors = require('generic-errors');

function transformError(error, code){
    if(!error){
        error = {
            message: 'An unknown error occured'
        };
    }

    if(typeof error === 'string'){
        error = {
            message: error
        };
    }

    if(!('code' in error)){
        error.code = code || 500;
    }

    error.code = parseInt(error.code, 10) || 500;

    if(error.code < 400){
        error.code = 500;
    }

    if(!errors.BaseError.isGenericError(error)){
        var stack = error.stack;

        error = new errors.BaseError(error);

        error.stack = stack || error.stack;
    }

    return error;
}

function createErrorHandler(logger, code){
    return function(request, response, data){
        var error = errors[code] ? new errors[code](data) : transformError(data, code);

        logger.info(error);

        response.writeHead(error.code, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(error));
    };
}

module.exports = function(logger){
    if(!logger){
        logger = console;
    }

    return createRetorter({
        ok: function(request, response, data){
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(data));
        },
        okOrNotFound: function(request, response, data){
            if(!data){
                return this.notFound(request, response);
            }

            this.ok(request, response, data);
        },
        redirect: function(request, response, location){
            response.statusCode = 302;
            response.setHeader('Location', location);
            response.end();
        },
        error: createErrorHandler(logger),
        badRequest: createErrorHandler(logger, 400),
        unauthorised: createErrorHandler(logger, 401),
        forbidden: createErrorHandler(logger, 403),
        notFound: createErrorHandler(logger, 404),
        unprocessable: createErrorHandler(logger, 422)
    });
};