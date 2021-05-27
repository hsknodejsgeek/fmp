var crypto = require('crypto');
var {
    SUCCESS,
    ERROR,
    NOT_VALID,
    NOT_CHANGED,
    PRESENT,
    EMAIL_PRESENT,
    PHONE_PRESENT,
    NO_VALUE,
    NOT_AUTHORIZED,
    EMPTY_OBJECT,
    BAD_REQUEST,
    VALIDATION_ERROR,
    VERIFICATION_ERROR,
    FORBIDDEN,
    LOGGED_IN,
    LOGGED_OUT,
    INTERNAL_SERVER_ERROR,
    MODEL_VALIDATION_ERROR
} = require('../constants/common.constants');
var md5 = require('md5');
var moment = require('moment-timezone');
var path = require("path");

require('dotenv').config({ path: path.join(__dirname, '.env') });

var isObjectEmpty = function (obj, cb = undefined) {
    if (!cb && !obj) return true;

    let names = Object.getOwnPropertyNames(obj);
    cb && cb((names.length === 0) ? true : false, names);

    if (!cb) return (names.length === 0) ? true : false;
}

/**
 * Check for, is data array format?
 * @param {*object} obj 
 * @param {*function} cb 
 */
var isDataArray = function isDataArray(obj, cb) {
    cb(obj.length !== undefined ? true : false);
}

/**
 * For sorting
 * @param {*any} a 
 * @param {*any} b 
 */
var compare = function (a, b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}

/**
 * Validate email address
 * @param {*string} email 
 */
var validateEmail = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
     * Validate mobile
     * @param {*string} number
     */
var validateMobile = function (number) {
    // var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (number && number.length >= 10 && number.length <= 12);
}

/**
 * Encypt data
 * @param {*string} salt 
 * @param {*string} data 
 */
var encryptData = function (salt, data) {
    return new Promise((resolve, reject) => {

        const randomKey = (Math.random() * 10000000).toString().replace(/\D/gi, '').substr(0, 7);
        const algorithm = 'aes-256-gcm';

        if (data) {
            crypto.scrypt(data, salt, 16, (err, derivedKey) => {
                if (err) reject(err);
                else {
                    const key = derivedKey.toString("hex");
                    const iv = Buffer.alloc(16, 0);

                    const cipher = crypto.createCipheriv(algorithm, key, iv);
                    let encrypted = cipher.update(data, 'utf8', 'hex');
                    encrypted += cipher.final('hex');
                    resolve(encrypted);
                }
            });
        } else {
            crypto.scrypt(randomKey, salt, 16, (err, derivedKey) => {
                if (err) reject(err);
                else {
                    const key = derivedKey.toString('hex');
                    const iv = Buffer.alloc(16, 0);
                    const cipher = crypto.createCipheriv(algorithm, key, iv);
                    let encrypted = cipher.update(data, 'utf8', 'hex');
                    encrypted += cipher.final('hex');
                    resolve(encrypted);
                }
            });
        }
    })
}

/**
 * Random token
 * @param {*string} username 
 */
var generateToken = function (username, cb) {

    var tempToken = Math.floor(Math.random() * 1000000000) + '';

    var encrypt = '';
    var cipher = crypto.createCipher('aes192', username)
        .on('readable', function () {
            var data = cipher.read();
            if (data) {
                encrypt += data.toString('hex');
            }
        })
        .on('end', function () {
            cb(encrypt, username);
        });
    cipher.write(tempToken);
    cipher.end();
}

/**
 * Decrypt the data
 * @param {*string} username 
 * @param {*string} password 
 * @param {*function} cb 
 */
var decryptData = function (username, password, cb) {
    if (password) {
        var decipher = crypto.createDecipher('aes192', username)
            .on('readable', function () {
                var data = decipher.read();
                if (data) {
                    cb(data.toString('utf8'));
                }
            });
        decipher.write(password, 'hex');
        decipher.end();
    }
}

/**
 * http response while operation has done
 * @param {*request} req 
 * @param {*response} res 
 * @param {*string} status 
 * @param {*array|object} response 
 */
var httpResponse = function (req, res, status, response) {
    let error = undefined;

    if (status !== SUCCESS) error = new Error();

    switch (status) {
        case SUCCESS:
            res.status(200)
                .json({
                    status: 200,
                    data: response,
                    message: SUCCESS,
                    error_stack: null,
                    error: false
                })
            break;
        case ERROR:
            error.status = 501;
            error._response = null;
            error._message = ERROR;
            error._error_stack = response;
            error._error = true;
            return error;
        case NOT_VALID:
            error.status = 401;
            error._response = null;
            error._message = NOT_VALID;
            error._error_stack = response;
            error._error = true;
            return error;
        case PRESENT:
            error.status = 409;
            error._response = null;
            error._message = PRESENT;
            error._error_stack = response;
            error._error = true;
            return error;
        case EMAIL_PRESENT:
            error.status = 409;
            error._response = null;
            error._message = EMAIL_PRESENT;
            error._error_stack = response;
            error._error = true;
            return error;
        case PHONE_PRESENT:
            error.status = 409;
            error._response = null;
            error._message = PHONE_PRESENT;
            error._error_stack = response;
            error._error = true;
            return error;
        case NO_VALUE:
            error.status = 404;
            error._response = null;
            error._message = NO_VALUE;
            error._error_stack = response;
            error._error = true;
            return error;
        case NOT_AUTHORIZED:
            error.status = 401;
            error._response = null;
            error._message = NOT_AUTHORIZED;
            error._error_stack = response;
            error._error = true;
            return error;
        case EMPTY_OBJECT:
            error.status = 400;
            error._response = null;
            error._message = EMPTY_OBJECT;
            error._error_stack = response;
            error._error = true;
            return error;
        case BAD_REQUEST:
            error.status = 400;
            error._response = null;
            error._message = BAD_REQUEST;
            error._error_stack = response;
            error._error = true;
            return error;
        case VALIDATION_ERROR:
            error.status = 422;
            error._response = null;
            error._message = VALIDATION_ERROR;
            error._error_stack = response;
            error._error = true;
            return error;
        case MODEL_VALIDATION_ERROR:
            error.status = 422;
            error._response = null;
            error._message = MODEL_VALIDATION_ERROR;
            error._error_stack = response;
            error._error = true;
            return error;
        case VERIFICATION_ERROR:
            error.status = 304;
            error._response = null;
            error._message = VERIFICATION_ERROR;
            error._error_stack = response;
            error._error = true;
            return error;
        case FORBIDDEN:
            error.status = 409;
            error._response = null;
            error._message = FORBIDDEN;
            error._error_stack = response;
            error._error = true;
            return error;
        case LOGGED_IN:
            res.status(200)
                .json({
                    status: 200,
                    data: response,
                    message: LOGGED_IN,
                    keys: [],
                    error: false
                })
            break;
        case LOGGED_OUT:
            res.status(200)
                .json({
                    status: 200,
                    data: response,
                    message: LOGGED_OUT,
                    keys: [],
                    error: false
                })
            break;
        default:
            error.status = 500;
            error._response = null;
            error._message = INTERNAL_SERVER_ERROR;
            error._error_stack = response;
            error._error = true;
            return error;
    }
}

/**
 * Check for, is data array format?
 * @param {*object} obj 
 * @param {*function} cb 
 */
var close = function (client, status, response, cb) {
    if (client) {
        client.close();
        cb(status, response);
    } else {
        cb(status, response);
    }
}

/**
 * Merge objects
 * @param {*object} obj 
 * @param {*function} oldObj 
 */
var mergeObject = function (obj, oldObj) {
    return Object.assign(obj, oldObj)
}

/**
 * Get authorization token
 */
var getAuthoriztionToken = () => {
    console.log(`${process.env.APP_KEY} === ${process.env.APP_TIME_ZONE} === ${process.env.APP_TIME_FORMAT}`)
    return md5(`${process.env.APP_KEY}${md5(moment(new Date()).tz(process.env.APP_TIME_ZONE).format(process.env.APP_TIME_FORMAT))}`);
}

module.exports = {
    isObjectEmpty,
    isDataArray,
    compare,
    validateEmail,
    encryptData,
    generateToken,
    decryptData,
    httpResponse,
    close,
    mergeObject,
    getAuthoriztionToken
}