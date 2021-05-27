const { validate } = require("../schema");
const { signup_schema, change_password_schema, admin_signup_schema, users_list_schema, user_delete_schema } = require("../schema/user.schema");
const { VALIDATION_ERROR, SUCCESS, EMAIL_PRESENT, PRESENT, TOKEN_EXPIRES_IN, USER_TYPE_USER, PENDING, BAD_REQUEST, NOT_VALID, ACTIVE, AUTH_DATA, USER_TYPE_INVESTOR, ACCOUNT_VERIFIED , USER_TYPE_ADMIN} = require("../constants/common.constants");
const { httpResponse } = require("../controller/response.controller");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
var { v4: uuid } = require('uuid');
const { insert_user_info_controller, get_user_info_detail_controller, clear_user_table_controller, update_forgot_password_code_user_controller, update_change_password_user_controller, insert_admin_user_controller, get_user_list_controller, update_user_delete_status_controller } = require("../controller/user.controller");
const { getDate } = require("../controller/helper.controller");

/** Admin Signup validation */
exports.admin_signup_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(admin_signup_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Signup */
exports.admin_signup_middleware = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user_information = { 
            id: uuid(),
            slug: uuid(),
            email,
            password: md5(password),
            user_type: USER_TYPE_ADMIN,
            verification_status: ACCOUNT_VERIFIED,
            access_token: uuid(),
            loggin_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        }

        const get_data_query = { email };

        const { status: check_user_status, response: check_user_response } = await get_user_info_detail_controller(get_data_query);

        if(check_user_status === SUCCESS) {
            return next(httpResponse(req, res, PRESENT, {
                message: "Email is already present, please try with other one."
            }));
        }

        const { status: user_status, response: user_response } = await insert_admin_user_controller(user_information);

        const { status: get_user_status, response: get_user_response } = await get_user_info_detail_controller(get_data_query);

        if (user_status === SUCCESS) {
            let { id, email, slug } = get_user_response || {};

            const token = jwt.sign({ id }, slug, { expiresIn: TOKEN_EXPIRES_IN });

            return httpResponse(req, res, user_status, {
                token,
                user: { uid: id, email }
            });
        } else next(httpResponse(req, res, user_status, user_response));

    } catch (error) {
        console.log("error ===> ", error)
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            const { code } = response || {};
            switch(code){
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

/** Admin Users List validation */
exports.admin_users_list_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(users_list_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Users List */
exports.admin_users_list_middleware = async (req, res, next) => {
    try {
        let { page, limit, search } = req.body;
        limit = parseInt(limit);
        const skip = (page-1) * limit;

        const query = { skip, limit, search };

        const { status: user_status, response: user_response, count } = await get_user_list_controller(query);

        if (user_status === SUCCESS) {
            return httpResponse(req, res, user_status, {
                data: user_response,
                total: count,
                page
            });
        } else next(httpResponse(req, res, user_status, user_response));

    } catch (error) {
        console.log("error ===> ", error)
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            const { code } = response || {};
            switch(code){
                default:
                    return next(httpResponse(req, res, status, response));
            }
        } else return next(error);
    }
}

/** Delete user validation */
exports.admin_delete_user_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(user_delete_schema, req.params);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Delete User */
exports.admin_delete_user_middleware = async (req, res, next) => {
    try {
        let { id, status } = req.params;

        const query = { id, status };

        const { status: user_status, response: user_response } = await update_user_delete_status_controller(query);

        if (user_status === SUCCESS) {
            return httpResponse(req, res, user_status, {
                message: status === ACTIVE ? "User blocked successfully." : "User unblocked successfully."
            });
        } else next(httpResponse(req, res, user_status, user_response));

    } catch (error) {
        console.log("error ===> ", error)
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            const { code } = response || {};
            switch(code){
                default:
                    return next(httpResponse(req, res, status, response));
            }
        } else return next(error);
    }
}