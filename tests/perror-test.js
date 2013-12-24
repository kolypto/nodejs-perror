'use strict';

var util = require('util'),
    perror = require('../')
    ;

/** Test simple errors
 * @param {test|deepEqual} test
 */
exports.testSimple = function(test){
    var SimpleError = perror('SimpleError');

    // Test name
    test.strictEqual(SimpleError.prototype.name, 'SimpleError');

    // Test instance
    var e = new SimpleError('Hey!'); // !!! LINE 17

    test.ok(e instanceof Error); // inheritance ok
    test.ok(e instanceof SimpleError); // inheritance ok
    test.ok(!e.hasOwnProperty('code')); // no code here
    test.strictEqual(e.name, 'SimpleError'); // has name
    test.ok(e.hasOwnProperty('name')); // `name` not in prototype
    test.strictEqual(e.message, 'Hey!'); // plain message
    test.ok(!('data' in e)); // `data` was not set, so does not exist
    test.ok(!('httpCode' in e)); // `httpCode` not set

    // toString works
    test.strictEqual(e+'', 'SimpleError: Hey!');

    // Stack is fine
    test.ok(/^SimpleError/.test(e.stack)); // string ok
    test.ok(/perror-test.js:17/.test(e.stack)); // line number ok

    // Test instance with data
    var e = new SimpleError('Hey!', {a:1});
    test.strictEqual(e.message, 'Hey!'); // plain message
    test.ok('data' in e); // `data` was set
    test.deepEqual(e.data, {a:1}); // `data` ok

    test.done();
};

/** Test with predefined message
 * @param {test|deepEqual} test
 */
exports.testMessage = function(test){
    var MessageError = perror('MessageError', 'Test error');

    // Test instance
    var e = new MessageError('Hey!');

    test.ok(!e.hasOwnProperty('code')); // no code here
    test.strictEqual(e.message, 'Test error: Hey!');
    test.strictEqual(e+'', 'MessageError: Test error: Hey!');

    test.done();
};

/** Test with code
 * @param {test|deepEqual} test
 */
exports.testCode = function(test){
    var CodeError = perror(100, 'MessageError');

    // Test instance
    var e = new CodeError('Hey!');

    test.ok(e.hasOwnProperty('code')); // code is set
    test.strictEqual(e.code, 100); // code ok
    test.strictEqual(e+'', 'MessageError: Hey!');

    test.done();
};

/** Test inheritance
 * @param {test|deepEqual} test
 */
exports.testInheritance = function(test){
    var NumberError = perror('NumberError', TypeError);

    // Test instance
    var e = new NumberError('Hey!');
    test.ok(e instanceof TypeError); // inheritance ok
    test.ok(e instanceof Error); // inheritance ok
    test.ok(!((new Error()) instanceof TypeError)); // just in case
    test.strictEqual(e+'', 'NumberError: Hey!');

    test.done();
};

/** Test httpCode
 * @param {test|deepEqual} test
 */
exports.testHttpCode = function(test){
    var NotFoundError = perror('NotFoundError', 'Not found').httpCode(404);

    // Test instance
    var e = new NotFoundError('Hey!');

    test.ok(!e.hasOwnProperty('code')); // no code here
    test.ok(e.hasOwnProperty('httpCode')); // httpCode is here
    test.strictEqual(e.httpCode, 404); // httpCode ok
    test.strictEqual(e.message, 'Not found: Hey!');
    test.strictEqual(e+'', 'NotFoundError: Not found: Hey!');

    test.done();
};

/** Test Code, Message, httpCode
 * @param {test|deepEqual} test
 */
exports.testCodeMessageHttp = function(test){
    var CustomError = perror(10, 'CustomError', 'Custom Error').httpCode(501);

    // Test instance
    var e = new CustomError('Hey!', {a:1});

    test.strictEqual(e.name, 'CustomError');
    test.strictEqual(e.code, 10);
    test.strictEqual(e.httpCode, 501);
    test.strictEqual(e.message, 'Custom Error: Hey!');
    test.deepEqual(e.data, { a:1 });

    return test.done();
};

/** Test wrapping
 * @param {test|deepEqual} test
 */
exports.testWrapping = function(test){
    // An error with defaults
    var GenericError = perror(1024, 'GenericError', 'Generic Error').httpCode(500);
    // A specific error with overrides
    var CustomError = perror(10, 'CustomError', 'Custom Error').httpCode(501);

    // Just in case...
    test.strictEqual(new GenericError('Hey!')+'', 'GenericError: Generic Error: Hey!');
    test.strictEqual(new CustomError('Hey!')+'', 'CustomError: Custom Error: Hey!');

    // Test instance
    var e = new GenericError(new CustomError('Hey!', {a:1}), {b:2});

    test.ok(e instanceof GenericError); // Still the same instance
    test.ok(!(e instanceof CustomError)); // Original prototype lost

    test.strictEqual(e.name, 'CustomError'); // overridden
    test.strictEqual(e.message, 'Generic Error: Custom Error: Hey!'); // merged messages
    test.strictEqual(e.code, 10); // overridden
    test.strictEqual(e.httpCode, 501); // overridden
    test.deepEqual(e.data, {a:1}); // overridden

    test.done();
};
