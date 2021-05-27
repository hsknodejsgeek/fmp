const Joi = require('@hapi/joi');
const { customHtmlSanitizeValue, customSanitizeMessage } = require('.');
const { YES, NO, IMAGE_PRIMARY, IMAGE_OTHER, LOGIN_TYPE_FACEBOOK, LOGIN_TYPE_GOOGLE, DEVICE_TYPE_ANDROID, DEVICE_TYPE_IOS, DEVICE_TYPE_WEB, ACTIVE, INACTIVE } = require('../constants/common.constants');

exports.signup_schema = Joi.object({
    phone: Joi.string().max(10).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    country_code: Joi.string().max(5).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.verify_phone_number_otp_schema = Joi.object({
    phone: Joi.string().max(10).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    phone_number_otp: Joi.string().max(4).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.admin_signup_schema = Joi.object({
    email: Joi.string().email().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    password: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.login_schema = Joi.object({
    email: Joi.string().email().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    password: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    device_type: Joi.string().valid(DEVICE_TYPE_WEB, DEVICE_TYPE_ANDROID, DEVICE_TYPE_IOS).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim(),
    device_token: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage })
});

exports.oauth2_login_schema = Joi.object({
    email: Joi.string().email().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim(),
    first_name: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim(),
    last_name: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim(),
    oauth2_id: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    login_type: Joi.string().valid(LOGIN_TYPE_FACEBOOK, LOGIN_TYPE_GOOGLE).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    device_type: Joi.string().valid(DEVICE_TYPE_WEB, DEVICE_TYPE_ANDROID, DEVICE_TYPE_IOS).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim(),
    device_token: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage })
});

exports.session_login_schema = Joi.object({
    token: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.forgot_password_schema = Joi.object({
    email: Joi.string().email().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.reset_password_schema = Joi.object({
    uid: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    forgot_password_access_token: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    password: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.change_password_schema = Joi.object({
    password: Joi.string().custom(customHtmlSanitizeValue).trim().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")).message({ "string.pattern.base": "Invalid password, password must have atleast 8 characters, one uppercase character, one lower case character and one special character.", ...customSanitizeMessage }).required(),
    old_password: Joi.string().custom(customHtmlSanitizeValue).trim().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")).message({ "string.pattern.base": "Invalid password, password must have atleast 8 characters, one uppercase character, one lower case character and one special character.", ...customSanitizeMessage }).required()
});

exports.users_list_schema = Joi.object({
    page: Joi.number().min(1).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    limit: Joi.number().min(1).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    search: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim()
});

exports.user_delete_schema = Joi.object({
    id: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    status: Joi.string().valid(ACTIVE, INACTIVE).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim()
});

exports.edit_profile_schema = Joi.object({
    image: Joi.object({
        url: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim(),
        type: Joi.string().valid(IMAGE_PRIMARY, IMAGE_OTHER).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim()
    }).required(),
    first_name: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    last_name: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    dob: Joi.date().iso().required(),
    about_me: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    exercise: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    star_sign: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    education_level: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    drinking: Joi.string().valid(YES, NO).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    smoking: Joi.string().valid(YES, NO).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    pets_canibis: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    kids: Joi.string().valid(YES, NO).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    religion: Joi.string().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});