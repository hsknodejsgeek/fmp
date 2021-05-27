const { validate } = require("../schema");
const { signup_schema, change_password_schema, verify_phone_number_otp_schema } = require("../schema/user.schema");
const { VALIDATION_ERROR, SUCCESS, LOGIN_TYPE_CUSTOM_USER, EMAIL_PRESENT, PRESENT, TOKEN_EXPIRES_IN, USER_TYPE_USER, PENDING, BAD_REQUEST, NOT_VALID, ACTIVE, AUTH_DATA, USER_TYPE_INVESTOR, ACCOUNT_VERIFIED } = require("../constants/common.constants");
const { httpResponse } = require("../controller/response.controller");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
var { v4: uuid } = require('uuid');
const { insert_user_info_controller, get_user_info_detail_controller, clear_user_table_controller, update_forgot_password_code_user_controller, update_change_password_user_controller, update_user_login_otp_controller, update_user_verification_status_controller } = require("../controller/user.controller");
const { getDate } = require("../controller/helper.controller");

/** Signup validation */
exports.signup_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(signup_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Signup */
exports.signup_middleware = async (req, res, next) => {
    try {
        const { country_code, phone } = req.body;
        const phone_number_otp = (Math.random()).toString().split('.')[1].substr(0, 4);

        const user_information = {
            id: uuid(),
            slug: uuid(),
            phone_number: phone,
            country_code,
            access_token: uuid(),
            loggin_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            login_type: LOGIN_TYPE_CUSTOM_USER,
            access_token: uuid()
        }

        const get_data_query = { phone_number: phone };

        const { status: check_user_status, response: check_user_response } = await get_user_info_detail_controller(get_data_query);

        if (check_user_status === SUCCESS) {
            let { id } = check_user_response || {};

            const otp_query = { id };
            const otp_data = { phone_number_otp }
            await update_user_login_otp_controller(otp_query, otp_data);

            return httpResponse(req, res, SUCCESS, {
                message: "OTP has been sent successfully.",
                otp: phone_number_otp
            });
        }

        const { status: user_status, response: user_response } = await insert_user_info_controller(user_information);

        const { status: get_user_status, response: get_user_response } = await get_user_info_detail_controller(get_data_query);

        if (user_status === SUCCESS) {
            let { id, email, slug } = get_user_response || {};

            // const token = jwt.sign({ id }, slug, { expiresIn: TOKEN_EXPIRES_IN });

            // return httpResponse(req, res, user_status, {
            //     token,
            //     user: { uid: id, email }
            // });

            const otp_query = { id };
            const otp_data = { phone_number_otp }
            await update_user_login_otp_controller(otp_query, otp_data);

            return next(httpResponse(req, res, SUCCESS, {
                message: "OTP has been sent successfully.",
                otp: phone_number_otp
            }));
        } else next(httpResponse(req, res, user_status, user_response));

    } catch (error) {
        console.log("error ===> ", error)
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            const { code } = response || {};
            switch (code) {
                case "ER_DUP_ENTRY":
                    return next(httpResponse(req, res, PRESENT, {
                        message: "Email is already present, please try with other one."
                    }));
                default:
                    return next(httpResponse(req, res, status, response));
            }
        } else return next(error);
    }
}

/** Clear user model middleware */
exports.clear_user_model_middleware = async (req, res, next) => {
    try {
        await clear_user_table_controller();
        return httpResponse(req, res, SUCCESS, {
            message: "Successfully clear user."
        });
    } catch (error) {
        console.log("error ===> ", error)
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            const { code } = response || {};
            switch (code) {
                default:
                    return next(httpResponse(req, res, status, response));
            }
        } else return next(error);
    }
}

/** Change password validation */
exports.change_password_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(change_password_schema, req.body);

        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Change password */
exports.change_password_middleware = async (req, res, next) => {
    try {
        const { id } = req[AUTH_DATA];
        const { old_password, password } = req.body;

        let user_information_query = { id, password: md5(old_password) };
        let user_information_data = { password: md5(password) };

        const { status: update_user_information_status, response: update_user_information_res } = await update_change_password_user_controller(user_information_query, user_information_data);

        if (update_user_information_status === SUCCESS) {
            const { affectedRows, changedRows } = update_user_information_res;

            if (affectedRows === 0) {
                return next(httpResponse(req, res, BAD_REQUEST, {
                    message: "Password is incorrect."
                }));
            } else if (changedRows === 0) {
                return httpResponse(req, res, SUCCESS, {
                    message: "No recored updated."
                });
            } else return httpResponse(req, res, SUCCESS, {
                message: "Password updated successfully."
            });
        } else return next(httpResponse(req, res, update_user_information_status, update_user_information_res))

    } catch (error) {
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            const { code } = response || {};
            switch (code) {
                default:
                    return next(httpResponse(req, res, status, response));
            }
        } else return next(error);
    }
}

/** Verify phone number otp validation */
exports.verify_phone_number_otp_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(verify_phone_number_otp_schema, req.body);

        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Verify phone number otp */
exports.verify_phone_number_otp_middleware = async (req, res, next) => {
    try {
        const { phone, phone_number_otp } = req.body;

        let user_information_query = { phone, phone_number_otp };
        let user_information_data = { otp: null, verification_status: ACCOUNT_VERIFIED };

        const get_data_query = { phone_number: phone };

        const { status: update_user_information_status, response: update_user_information_res } = await update_user_verification_status_controller(user_information_query, user_information_data);

        if (update_user_information_status === SUCCESS) {
            const { affectedRows, changedRows } = update_user_information_res;

            if (affectedRows === 0) {
                return next(httpResponse(req, res, BAD_REQUEST, {
                    message: "Phone number or OTP is incorrect."
                }));
            } else if (changedRows === 0) {
                return httpResponse(req, res, SUCCESS, {
                    message: "No recored updated."
                });
            } else {
                const { status: get_user_status, response: get_user_response } = await get_user_info_detail_controller(get_data_query);

                if (get_user_status === SUCCESS) {
                    let { id, email, slug } = get_user_response || {};

                    const token = jwt.sign({ id }, slug, { expiresIn: TOKEN_EXPIRES_IN });

                    return httpResponse(req, res, SUCCESS, {
                        token,
                        user: { uid: id, email }
                    });
                } else next(httpResponse(req, res, user_status, user_response));
            }
        } else return next(httpResponse(req, res, update_user_information_status, update_user_information_res))

    } catch (error) {
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            const { code } = response || {};
            switch (code) {
                default:
                    return next(httpResponse(req, res, status, response));
            }
        } else return next(error);
    }
}