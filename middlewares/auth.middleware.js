const { getAuthoriztionToken, httpResponse } = require('../controller/response.controller');
const { BAD_REQUEST, FORBIDDEN, REQUEST_DATA, AUTH_DATA, USER_TYPE_SUPER_ADMIN, USER_TYPE_MARKETING, USER_TYPE_CONTENT_WRITER, ERROR, SUCCESS, ACTIVE } = require("../constants/common.constants");
const jwt = require("jsonwebtoken");
const { get_user_info_detail_controller } = require('../controller/user.controller');
// const { get_user_controller } = require('../controller/user.controller');

exports.validate_header = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return next(httpResponse(req, res, BAD_REQUEST, {
            message: "Authorization token is not found."
        }));
    }

    const app_token = getAuthoriztionToken();
    if (token === app_token) {
        next();
    } else next(httpResponse(req, res, FORBIDDEN, {
        message: "Authorization token is not matched.",
        token: app_token
    }));
}

exports.user_auth_middleware = async (req, res, next, roles) => {
    try {
        if (!roles || !Array.isArray(roles) || (Array.isArray(roles) && roles && !roles.length)) {
            return next(httpResponse(req, res, BAD_REQUEST, {
                message: "Roles are not specified."
            }));
        }

        const is_prefix_present = req.headers.token ? req.headers.token.search(/Bearer/gi) : "";
        const token = req.headers.token ? req.headers.token.replace(/Bearer/gi, "").trim() : "";

        if (!token) {
            return next(httpResponse(req, res, BAD_REQUEST, {
                message: "Auth token is not found."
            }));
        }

        if (is_prefix_present === -1) {
            return next(httpResponse(req, res, BAD_REQUEST, {
                message: "Auth token's prefix did not found."
            }));
        }

        const token_data = jwt.decode(token, { complete: true });

        const id = token_data && token_data.payload ? token_data.payload.id : "";
        const { status, response = {} } = await get_user_info_detail_controller({ id });

        if (status !== SUCCESS) {
            return next(httpResponse(req, res, FORBIDDEN, {
                message: "User not found, Somthing went wrong with auth token!"
            }));
        }

        const { user_type, delete_status } = response;

        if (delete_status === ACTIVE) {
            return next(httpResponse(req, res, FORBIDDEN, {
                message: "Admin has deleted you!"
            }));
        }

        if (!user_type) {
            return next(httpResponse(req, res, BAD_REQUEST, {
                message: "Invalid, Auth token does not have user role."
            }));
        }

        const is_valid_role = roles.indexOf(user_type);

        if (is_valid_role === -1) {
            return next(httpResponse(req, res, BAD_REQUEST, {
                message: "User does not have API access."
            }));
        }

        if (status === SUCCESS) {
            const { slug, id: uid } = response;
            const data = jwt.verify(token, slug);

            req[AUTH_DATA] = { id: uid, token };
            next();
        } else next(httpResponse(req, res, FORBIDDEN, {
            message: "Somthing went wrong with auth token!"
        }));
    } catch (error) {
        let status = error && error.status && typeof error.status === "string" ? error.status : null;

        if (status) {
            let response = error.response;
            return next(httpResponse(req, res, status, response));
        } else return next(error);
    }
}
