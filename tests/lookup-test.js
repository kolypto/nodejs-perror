'use strict';

var perror = require('../');

/** Test perror.Lookup
 * @param {test|deepEqual} test
 */
exports.testLookup = function(test){
    var namespace = {
        AuthError:    perror(403, 'AuthError', 'Unauthorized'),
        NotFound:     perror(404, 'NotFound', 'Not found'),
        ServerError:  perror(500, 'ServerError', 'Server Error')
    };
    var lookup = new perror.Lookup(namespace);

    // By code
    test.strictEqual(lookup.code(403).name, 'AuthError'); // Found ok
    test.strictEqual(lookup.code(999).name, 'Error'); // Default!

    // By name
    test.strictEqual(lookup.name('AuthError').code, 403); // Found ok
    test.strictEqual(lookup.code('LOL').code, undefined); // Default!

    test.done();
};
