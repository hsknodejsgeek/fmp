const Joi = require('@hapi/joi');
const { customHtmlSanitizeValue, customSanitizeMessage } = require('.');
const { ACTIVE, INACTIVE, PLAN_TYPE_FREE, PLAN_TYPE_GOLD, PLAN_TYPE_GOLD_PLUS } = require('../constants/common.constants');

exports.create_subscription_plan_schema = Joi.object({
    name: Joi.string().max(100).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    duration: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    price: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    super_likes: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    boost_profie_duration: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    plan_type: Joi.string().valid(PLAN_TYPE_FREE, PLAN_TYPE_GOLD, PLAN_TYPE_GOLD_PLUS).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    boost_profile: Joi.string().valid(ACTIVE, INACTIVE).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.edit_subscription_plan_schema = Joi.object({
    id: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    name: Joi.string().max(100).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    duration: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    price: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    super_likes: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    boost_profie_duration: Joi.number().custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).required(),
    boost_profile: Joi.string().valid(ACTIVE, INACTIVE).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.get_subscription_plan_schema = Joi.object({
    id: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});

exports.add_subscription_schema = Joi.object({
    uid: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required(),
    sid: Joi.string().min(36).max(36).custom(customHtmlSanitizeValue).message({ ...customSanitizeMessage }).trim().required()
});