[![Version](https://badge.fury.io/js/perror.png)](https://npmjs.org/package/perror)
[![Dependency Status](https://gemnasium.com/kolypto/nodejs-perror.png)](https://gemnasium.com/kolypto/nodejs-perror)
[![Build Status](https://travis-ci.org/kolypto/nodejs-perror.png?branch=master)](https://travis-ci.org/kolypto/nodejs-perror)

perror
======
Smart named Error objects with HTTP compatibility.

Key features:

* Error object presets
* Predefined codes and messages
* HTTP-compatible errors
* Errors can contain additional debug data
* JSON-friendly
* Automatically wraps other error objects
* Extremely lightweight
* Unit-tested






Table of Contents
=================

* <a href="#example">Example</a>
* <a href="#perror-1">perror()</a>
* <a href="#use-cases">Use Cases</a>
    * <a href="#generic-errors">Generic Errors</a>
    * <a href="#code-and-message">Code and Message</a>
    * <a href="#error-instances">Error Instances</a>
        * <a href="#throwing-errors">Throwing Errors</a>
        * <a href="#wrapping-errors">Wrapping Errors</a>
    * <a href="#http-compatible-errors">HTTP-compatible errors</a> 



Example
=======

```js
var perror = require('perror');

// Create an error  with code, name and predefined title.
// The associated HTTP code is optional
var NotFoundError = perror(1, 'NotFound', 'Not found').httpCode(404);

// Another error with no code and message: both are `undefined`
var GenericError = perror('GenericError');

// Throw it
try {
    // Set a message, provide some debug context data
    throw new NotFoundError('Page was not found', { page_url: '/index' });
}
// Catch it
catch(e){
    e.name; // Error name: 'NotFound'
    e.code; // Code: 1
    e.message; // Error message: 'Not found: Page was not found'
    e.httpCode; // HTTP error code: 404
    e.data; // Debug data: { page_url: '/index' } (if provided)
    e.stack; // stack trace still available
}
```



perror()
========
`perror()` builds an Error object constructor with some presents and fine-tuning.

The errors are indistinguishable from generic `Error` objects, including names and stack traces.

The generic signature is:

> perror([code, ] name [, message] [, superCtor])

Arguments:

* `code: Number?`: Optional numeric error code, stored into the `code` property.
  When not provided - the property is not set.

  Note: only numeric error codes are supported!
* `name: String`: Error object name. Is stored into the `name` property.
* `message: String?`: Optional error message prefix. If specified - is prepended to the error message.
* `superCtor: Function?`: Optional parent superclass constructor. Use to inherit from specific error objects.

It returns an Error object which accepts the following arguments:

* `message: String|Error`: Error message string, or another Error object to wrap.
* `data: *?`: Arbitrary metadata to store into the `data` property

In addition, the following chain methods are available:

* `httpCode(Number)`: Associate an HTTP code with the error. Is stored into the `httpCode` property.
* `extra(Object)`: Add arbitrary fields to error instances: the provided object fields are copied into the error instance.

An error instance has the following properties:

* `name: String`: Error name
* `message: String`: Error message
* `code: Number?`: Error code, if set
* `data: *?`: Error debug data, if provided
* `httpCode: Number?`: HTTP error code, if set



Use Cases
=========

Generic Errors
--------------
You can use `perror()` to create generic error objects.

> perror(name[, superCtor])

Arguments:

* `name: String`: Name for the error object
* `superCtor: Function?`: Optional parent Error object to inherit from. By default, it inherits from `Error`.

The function returns a generic Error object constructor.

Example:

```js
var RuntimeError = perror('RuntimeError');

try { throw new RuntimeError('something bad'); }
catch(e){
    // Standard Error object fields
    e.name;
    e.message;
    // Convertible to string
    console.log(e); // -> 'RuntimeError: something bad'
}
```


Code and Message
----------------
You can associate numeric error codes and message prefixes with the error object.

> perror([code, ], name[, message] [, superCtor])

Example:

```js
var NotFoundError = perror(10, 'NotFoundError', 'Not found');

try { throw new NotFoundError('page'); }
catch(e){
    e.name; // -> 'NotFoundError'
    e.code; // -> 10
    e.message; // -> 'Not Found: page'
}
```

Error Instances
---------------

### Throwing Errors
Each Error constructor built by `perror()` accepts two arguments: the message, and the optional debug data.

Example:

```js
var RuntimeError = perror('RuntimeError');

try {
    throw new RuntimeError('broken', { a: 1 });
}
catch(e){
    e.data; // -> { a: 1 }
}
```

### Wrapping Errors
Error objects from `perror()` can wrap other objects: all properties are copied to the wrapper, saving the original message prefix.

Is useful when you need to make sure the value got from elsewhere is an Error object with some known fields,
like `httpCode` (see below).

Example:

```js
    // An error with defaults
    var GenericError = perror(1024, 'GenericError', 'Generic Error');

    // A specific error with overrides
    var CustomError = perror(10, 'CustomError', 'Custom Error');

    try {
        throw new GenericError(
            new CustomError('Hey!')
        );
    } catch(e){
        e.code; // -> 10              -- copied
        e.name; // -> 'CustomError'   -- copied
        e.message; // -> 'Generic Error: Custom Error: Hey!'   -- merged
    }
```

HTTP-compatible errors
----------------------
The Error constructor has a `httpCode(Number)` method which allows you to specify an associated HTTP error code.
This comes extremely handy when the exception is to be reported via HTTP.

Combine it with Wrapping and get defaults for your HTTP response codes in case of errors!

Example:

```js
var ServerError = perror('ServerError').httpCode(500);

app.get('/', function(req, res){
    get_page(function(err, page){
        if (err){
            err = new ServerError(err); // wrap it to get a guaranteed httpCode
            res.type('json').send(
                err.httpCode,
                err // send the whole error object. stack trace is not exported
            );
        }
    });
});
```






perror.Lookup
=============
Having all those names and codes at hand, it's natural to desire a tool that creates Error objects by name or code.

perror.Lookup does precisely this: construct it with an object of Errors (most probably - a module), and enjoy the
lookup!

```js
var perror = require('perror);

// Define your objects
exports.AuthError   = perror(403, 'AuthError',   'Unauthorized');
exports.NotFound    = perror(404, 'NotFound',    'Not found');
exports.ServerError = perror(500, 'ServerError', 'Server Error');

// Create the Lookup
var lookup = exports.lookup = new perror.Lookup(exports);

// Throw errors by name & code
throw lookup.code(403, 'Invalid password');
throw lookup.name('NotFound', 'Page not found');
```

*Note*: both `code()` and `name()` use the generic `Error` object when no matching Error is found!
