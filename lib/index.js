'use strict';

var util = require('util')
    ;

/** Build an Error constructor with predefined fields.
 *
 * @param {Number?} code
 *      Optional error code.
 *      Note: only supports integers and numeric strings
 * @param {String} name
 *      Error name
 * @param {String?} message
 *      Optional error message prefix
 * @param {Function?} [superCtor=Error]
 *      Optional parent Error constructor
 * @returns {function(message: String, data:*)} Error constructor
 */
var PError = module.exports = function(code, name, message, superCtor){
    // Arguments
    if (isNaN(code)){ // (name, message, superCtor)
        superCtor = message;
        message = name;
        name = code;
        code = undefined;
    }
    if (message && typeof(message) === 'function'){ // ([code], name, superCtor)
        superCtor = message;
        message = undefined;
    }

    // Extra fields: these are copied into error objects
    var extraFields = {
    };
    if (code !== undefined)
        extraFields.code = code;

    // Create the error
    var E = function(msg, data){
        // Parent
        Error.call(this, message);

        // Capture stack trace
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        else
            this.stack = (new Error()).stack;

        // Fields
        this.name = name;
        this.message = (message? message + ': ' : '') + msg;
        if (data !== undefined)
            this.data = data;

        // Extra fields
        for (var i in extraFields)
            if (extraFields.hasOwnProperty(i))
                this[i] = extraFields[i];
    };
    util.inherits(E, superCtor || Error);
    E.prototype.name = name;

    // Chaining methods

    E.httpCode = function(httpCode){
        extraFields.httpCode = httpCode;
        return E;
    };

    // Finish
    return E;
};