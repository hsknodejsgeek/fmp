const sanitize_html = require('sanitize-html');

const handleErrors = (res) => {
    const details = res && res.details ? res.details : [];
    return new Promise((resolve, reject) => {
        reject(details.map(ele => ({
            message: ele.message,
            key: ele.context.key
        })))
    })
}

const validate = (schema, data) => {
    return schema.validateAsync(data, {
        abortEarly: false
    }).catch(handleErrors);
}

const customHtmlSanitizeValue = (value, params) => {
    const sanitizedHtml = sanitize_html(value, {
        allowedTags: [],
        allowedAttributes: {},
    });

    if (!sanitizedHtml) return params.error("string.sanitize_html");

    return sanitizedHtml;
}

const customSanitizeMessage = { "string.sanitize_html": "Invalid value, make sure input doesn't contain any html tag." };

module.exports = {
    validate,
    customHtmlSanitizeValue,
    customSanitizeMessage
}