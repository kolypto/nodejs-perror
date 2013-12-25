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
        extraFields.code = +code; // cast to Number

    // Prepare the message prefix
    var messagePrefix = (message? message + ': ' : '');

    // Create the error
    var E = function(message, data){
        // Parent
        Error.call(this, message);

        // Capture stack trace
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        else
            this.stack = (new Error()).stack;

        // Fields
        this.name = name;
        this.message = messagePrefix + message;
        if (data !== undefined)
            this.data = data;

        // Extra fields
        for (var i in extraFields)
            if (extraFields.hasOwnProperty(i))
                this[i] = extraFields[i];

        // Error wrapper
        if (message instanceof Error){
            // Copy its properties
            for (var f in message)
                if (message.hasOwnProperty(f))
                    this[f] = message[f];

            // Fine tuning
            this.message = messagePrefix + message.message; // Preserve the prefix
            this.stack = message.stack; // Copy the stack
        }
    };
    util.inherits(E, superCtor || Error);
    E.prototype.name = name;

    // Chaining methods

    E.httpCode = function(httpCode){
        extraFields.httpCode = httpCode;
        return E;
    };

    E.extra = function(obj){
        for (var i in obj)
            if (obj.hasOwnProperty(i))
                extraFields[i] = obj[i];
        return E;
    };

    // Finish
    return E;
};
