const { validate } = require("../schema");
const { login_schema, session_login_schema, forgot_password_schema, reset_password_schema, oauth2_login_schema } = require("../schema/user.schema");
const { VALIDATION_ERROR, SUCCESS, EMAIL_PRESENT, PRESENT, TOKEN_EXPIRES_IN, USER_TYPE_USER, PENDING, BAD_REQUEST, NOT_VALID, ACTIVE, AUTH_DATA, USER_TYPE_INVESTOR, ACCOUNT_VERIFIED, INACTIVE } = require("../constants/common.constants");
const { httpResponse } = require("../controller/response.controller");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
var { v4: uuid } = require('uuid');
const { insert_user_info_controller, get_user_info_detail_controller, login_user_controller, update_forgot_password_code_user_controller, update_reset_password_user_controller, oauth2_login_user_controller } = require("../controller/user.controller");
const { getDate } = require("../controller/helper.controller");

/** Login validation */
exports.login_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(login_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Login */
exports.login_middleware = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user_information = { email, password: md5(password) }

        const { status: user_status, response: user_response } = await login_user_controller(user_information);

        if (user_status === SUCCESS) {
            const { slug, id, email, deleted_status } = user_response;

            if(deleted_status === ACTIVE) return next(httpResponse(req, res, NOT_VALID, {
                message: "Admin has removed your account."
            }));

            if(!id) {
                return next(httpResponse(req, res, NOT_VALID, {
                    message: "either email or password is incorrect."
                }));
            }

            const token = jwt.sign({ id }, slug, { expiresIn: TOKEN_EXPIRES_IN });
            httpResponse(req, res, user_status, {
                token: token,
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
                default:
                    return next(httpResponse(req, res, status, response));
            }
        } else return next(error);
    }
}

/** Oauth2 login validation */
exports.oauth2_login_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(oauth2_login_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        console.log("oauth2 ===> login issue")
        next(httpResponse(req, res, VALIDATION_ERROR, error));
    }
}

/** Login */
exports.oauth2_login_middleware = async (req, res, next) => {
    try {
        const { first_name, last_name, email, oauth2_id, login_type } = req.body;

        const user_information = { oauth2_id }

        const { status: user_status, response: user_response } = await oauth2_login_user_controller(user_information);

        if (user_status === SUCCESS && user_response && user_response.id) {
            const { slug, id, email, deleted_status } = user_response;

            if(deleted_status === ACTIVE) return next(httpResponse(req, res, NOT_VALID, {
                message: "Admin has removed your account."
            }));

            const token = jwt.sign({ id }, slug, { expiresIn: TOKEN_EXPIRES_IN });
            return httpResponse(req, res, user_status, {
                token: token,
                user: { uid: id, email, created: false }
            });
        } else {
            const oauth_user_information = { 
                id: uuid(),
                slug: uuid(),
                first_name,
                last_name,
                email,
                oauth2_id,
                login_type,
                access_token: uuid(),
                verification_status: ACCOUNT_VERIFIED,
                loggin_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
    
            const get_data_query = { oauth2_id };

            const user_information_query = { email };
            const { status: user_information_status, response: user_information_response } = await oauth2_login_user_controller(user_information_query);
    
            if(user_information_status === SUCCESS && user_information_response && user_information_response.id) return next(httpResponse(req, res, NOT_VALID, {
                message: "Email is already present, please try again."
            }));

            const { status: user_status, response: user_response } = await insert_user_info_controller(oauth_user_information);
    
            const { status: get_user_status, response: get_user_response } = await get_user_info_detail_controller(get_data_query);
    
            if (user_status === SUCCESS) {
                let { id, email, slug } = get_user_response || {};
    
                const token = jwt.sign({ id }, slug, { expiresIn: TOKEN_EXPIRES_IN });
    
                return httpResponse(req, res, user_status, {
                    token,
                    user: { uid: id, email, created: true }
                });
            } else next(httpResponse(req, res, user_status, user_response));
        }

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

/** Session Login Validation */
exports.session_login_validation_middleware = async (req, res, next) => {
    try {
        const { token } = req.headers;
        const data = await validate(session_login_schema, { token });
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Session Login */
exports.session_login = async (req, res, next) => {
    try {
        const { id, token } = req[AUTH_DATA];
        const query = { id };

        const { status: user_status, response: user_response } = await get_user_info_detail_controller(query);

        if (user_status === SUCCESS) {
            const { id, email } = user_response;

            let user_data = Object.assign({
                token: token,
                user: { uid: id, email }
            });

            return httpResponse(req, res, user_status, user_data);
        } else next(httpResponse(req, res, NOT_VALID, {
            message: "Token is Invalid."
        }));

    } catch (error) {
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            next(httpResponse(req, res, status, response));
            return;
        }

        next(error);
    }
}

/** Forgot password validation */
exports.forgot_password_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(forgot_password_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Forgot password */
exports.forgot_password_middleware = async (req, res, next) => {
    try {
        const { email } = req.body;
        const query = { email: email };
        const forgot_password_code = parseInt(Math.random()*1000000);
        const forgot_password_data = { forgot_password_code };

        const [ get_user_data, update_user_passowrd ] = await Promise.all([
            get_user_info_detail_controller(query),
            update_forgot_password_code_user_controller(query, forgot_password_data)
        ]);

        const { status: user_status, response: user_response } = get_user_data;

        if (user_status === SUCCESS) {
            const { _id: uid } = user_response;

            // http://localhost:3000/auth/reset_password?uid=6f49ad01-32f8-4bde-899a-7e5e181433de&token=639501

            // const mail_data = {
            //     to: email,
            //     uid,
            //     forgot_password_access_token
            // }
            // await send_forgot_password_controller(mail_data);

            console.log("forgot_password_code ===> ", forgot_password_code);
            return httpResponse(req, res, user_status, {
                message: "Reset password code has been sent on your email address."
            });
        } else next(httpResponse(req, res, BAD_REQUEST, {
            message: "No user record found."
        }));

    } catch (error) {
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            return next(httpResponse(req, res, status, response));
        } return next(error);
    }
}

/** Reset forgot password validation */
exports.reset_forgot_password_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(reset_password_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Reset forgot password */
exports.reset_forgot_password_middleware = async (req, res, next) => {
    try {
        const { uid, forgot_password_access_token, password } = req.body;
        const query = { uid, forgot_password_access_token };
        const reset_password_data = { password: md5(password) };

        const { status: user_status, response: user_response } = await update_reset_password_user_controller(query, reset_password_data);

        if (user_status === SUCCESS) {
            const { affectedRows, changedRows } = user_response;

            if (affectedRows === 0) {
                return next(httpResponse(req, res, BAD_REQUEST, {
                    message: "either user ID or forgot password token is invalid."
                }));
            } else if(changedRows === 0) {
                return httpResponse(req, res, SUCCESS, {
                    message: "No recored updated."
                });
            } else return httpResponse(req, res, SUCCESS, {
                message: "Password updated successfully."
            });

        } else next(httpResponse(req, res, user_status, user_response));

    } catch (error) {
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            return next(httpResponse(req, res, status, response));
        } return next(error);
    }
}