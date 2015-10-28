# retort-json

A retort that defaults to JSON responses

# retorter

A request/response wrapper for use at the very last part of your routing for JSON APIs.

## usage

Say you have a route:

``` javascript
    "abc/`id`": function(request, response, tokens){

    }
```

To respond ok with some data in the form of JSON, you would usually have to:

``` javascript
    "abc/`id`": function(request, response, tokens){
        someFunction(tokens.id, function(error, data){
            response.end(JSON.stringify(data));
        });
    }
```

Which isn't so bad, but then handle the error case

``` javascript
    "abc/`id`": function(request, response, tokens){
        someFunction(function(error, data){
            if(error){
                //Log maybe?
                console.log(error);

                // set the 500 code
                response.statusCode = 500;

                // API error, so stringify it.
                response.end(JSON.stringify(error));

                return;
            }

            response.end(JSON.stringify(data));
        });
    }
```


With JSON retorter, a set of actions has been defined that can be performed on a request, and use them to respond without having to do all that setup every time.

``` javascript
    "abc/`id`": retorter(function(retort, tokens){
        someFunction(tokens.id, function(error, data){
            if(error){
                return retort.error(error);
            }

            retort.ok(data);
        });
    })
```

Which, if you use something like [wraperr](https://www.npmjs.org/package/wraperr) can be even tighter:

``` javascript
    "abc/`id`": retorter(function(retort, tokens){
        someFunction(tokens.id, wraperr(retort.ok, retort.error));
    })
```

You can also get access to the origininal request and response objects via the passed in retort object

``` javascript
    "abc/`id`": retorter(function(retort, tokens){

        retort.request

        retort.response

    })
```

