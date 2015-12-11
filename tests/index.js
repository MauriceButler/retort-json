var test = require('tape'),
    jsonRetorter = require('../'),
    errors = require('generic-errors'),
    logger = {info: function(){}},
    expectedHeaders = {'Content-Type': 'application/json'};

function fakeServerCall(handler, request, response){
    handler(request || {}, response || {});
}

test('retort puts request and response on passed in object.', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            t.ok(retort.request, 'retort.request exists');
            t.ok(retort.response, 'retort.response exists');
        });

    fakeServerCall(routeHandler);
});

test('retort sends 200 on .ok', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.ok();
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 200);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort sends 404 on .notFound', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.notFound();
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 404);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort sends 403 on .forbidden', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.forbidden();
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 403);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort sends 401 on .unauthorised', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.unauthorised();
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 401);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort sends 422 on .unprocessable', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.unprocessable('some error');
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 422);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort sends 500 on .error', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.error('some error');
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 500);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort handles empty error', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.error();
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 500);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort handles non standard error code', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.error(new errors.BaseError({code: 666}));
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 666);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort handles non standard error code as string', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.error(new errors.BaseError({code: 'WAT IM A STRING NOW?!?!'}));
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 500);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort handles standard error code as string', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.error(new errors.BaseError({code: '411'}));
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 411);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort upgrades error code less than 400', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.error(new errors.BaseError({code: 200}));
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 500);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort sends 404 on .okOrNotFound with no data', function(t){
    t.plan(2);

    var retorter = jsonRetorter(logger),
        routeHandler = retorter(function(retort){
            retort.okOrNotFound();
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 404);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(){}
    });
});

test('retort sends 200 on .okOrNotFound with data', function(t){
    t.plan(3);

    var retorter = jsonRetorter(logger),
        testData = { foo: 'bar' },
        routeHandler = retorter(function(retort){
            retort.okOrNotFound(testData);
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 200);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(data){
            t.equal(data, JSON.stringify(testData));
        }
    });
});

test('can add methods', function(t){
    t.plan(1);

    var retorter = jsonRetorter(logger),
        responseObject = {};

    retorter.okRaw = function(request, response, data){
        response.end(data);
    };

    var routeHandler = retorter(function(retort){
        retort.okRaw(responseObject);
    });

    fakeServerCall(routeHandler, {}, {
        end: function(data){
            t.equal(data, responseObject, 'response was raw');
        }
    });
});

test('can override methods', function(t){
    t.plan(1);

    var retorter = jsonRetorter(logger);

    retorter.ok = function(){
        t.pass('ok overriden');
    };

    var routeHandler = retorter(function(retort){
        retort.ok();
    });

    fakeServerCall(routeHandler);
});

test('use generic-errors', function(t){
    t.plan(3);

    var retorter = jsonRetorter(logger),
        notFoundError = new errors.NotFound('Totally not found'),
        routeHandler = retorter(function(retort){
            retort.error(notFoundError);
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 404);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(data){
            t.equal(data, JSON.stringify(notFoundError));
        }
    });
});

test('use serialised generic error', function(t){
    t.plan(3);

    var retorter = jsonRetorter(logger),
        notFoundError = {
            __genericError: true,
            code: 404,
            message: 'Totally not found'
        },
        routeHandler = retorter(function(retort){
            retort.error(notFoundError);
        });

    fakeServerCall(routeHandler, {}, {
        writeHead: function(code, headers){
            t.equal(code, 404);
            t.deepEqual(headers, expectedHeaders);
        },
        end: function(data){
            t.equal(data, JSON.stringify(notFoundError));
        }
    });
});