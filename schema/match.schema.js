const Joi = require('@hapi/joi');
const { customHtmlSanitizeValue, customSanitizeMessage } = require('.');
const { INTERESTED, NOT_INTERESTED, SUPER_LIKE, ACCEPT, REJECT, PENDING } = require('../constants/common.constants');

exports.create_match_schema = Joi.object({
    uid: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    influencer_uid: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    status: Joi.string().valid(INTERESTED, NOT_INTERESTED, SUPER_LIKE).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.update_match_schema = Joi.object({
    id: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    match_status: Joi.string().valid(ACCEPT, REJECT, PENDING).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});