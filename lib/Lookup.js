'use strict';

/** Create a Lookup to construct errors by name or code
 * @param {Object.<String, Error>} errors
 *      The object to index, most probably, the module.
 * @constructor
 */
var Lookup = exports.Lookup = function(errors){
    this._codes = {};
    this._names = {};

    // Build the index
    for (var i in errors)
        if (typeof errors[i] === 'function'){
            if ('code' in errors[i].prototype)
                this._codes[ errors[i].prototype.code ] = errors[i];
            this._names[ errors[i].prototype.name ] = errors[i];
        }
};

/** Dynamically construct an Error object
 * @param {Function} constructor
 *      Constructor
 * @param {Array} args
 *      Arguments
 * @returns {Error}
 */
Lookup.prototype.construct = function(constructor, args){
    // see: http://stackoverflow.com/a/14378462/134904
    var instance = Object.create(constructor.prototype);
    var result = constructor.apply(instance, args);
    return typeof result === 'object' ? result : instance;
};

/** Construct an Error by code
 * @param {Number} code
 *      The Error code to search for.
 *      When no error is found, the `Error` object is used instead
 * @param {String} message
 * @param {*?} data
 * @returns {Error}
 */
Lookup.prototype.code = function(code, message, data){
    return this.construct(this._codes[code] || Error, Array.prototype.slice.call(arguments, 1));
};

/** Construct an Error by name
 * @param {Number} name
 *      The Error name to search for.
 *      When no error is found, the `Error` object is used instead
 * @param {String} message
 * @param {*?} data
 * @returns {Error}
 */
Lookup.prototype.name = function(name, message, data){
    return this.construct(this._names[name] || Error, Array.prototype.slice.call(arguments, 1));
};
