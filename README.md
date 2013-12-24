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
* Automatically wraps other error objects
* Extremely lightweight
* Unit-tested



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

It returns an Error object which accepts the following arguments:

* `message: String|Error`: Error message string, or another Error object to wrap.
* `data: *?`: Arbitrary metadata to store into the `data` property


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

try { throw new RuntimeError; }
catch(e){
    // Standard Error object fields
    e.name;
    e.message;
    // Convertible to string
    console.log(e);
}
```


Code and Message
----------------

Throwing Errors
---------------

HTTP-compatible errors
----------------------

Inheritance
-----------
