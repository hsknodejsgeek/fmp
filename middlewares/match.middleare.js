const { validate } = require("../schema");
const { VALIDATION_ERROR, SUCCESS, EMAIL_PRESENT, PRESENT, TOKEN_EXPIRES_IN, USER_TYPE_USER, PENDING, BAD_REQUEST, NOT_VALID, ACTIVE, AUTH_DATA, USER_TYPE_INVESTOR, ACCOUNT_VERIFIED } = require("../constants/common.constants");
const { httpResponse } = require("../controller/response.controller");
var { v4: uuid } = require('uuid');
const { create_match_schema, update_match_schema } = require("../schema/match.schema");
const { check_match_controller, update_match_controller, clear_match_table_controller } = require("../controller/match.controller");

/** Create match validation */
exports.create_match_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(create_match_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Create match */
exports.create_match_middleware = async (req, res, next) => {
    try {
        const { uid, influencer_uid, status } = req.body;

        const match_information = { id: uuid(), uid, influencer_uid, status };

        const get_data_query = { uid, influencer_uid };

        const { status: check_plan_status, response: check_plan_response } = await check_match_controller(get_data_query);

        if(check_plan_status === SUCCESS) {
            return next(httpResponse(req, res, PRESENT, {
                message: "Match request is already present, please try with other one."
            }));
        }

        const { status: match_status, response: match_response } = await insert_subscription_plan_controller(match_information);

        if (match_status === SUCCESS) {
            return httpResponse(req, res, match_status, {
                message: "Subscription plan has been created successfully."
            });
        } else next(httpResponse(req, res, match_status, match_response));

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

/** Update match validation */
exports.update_match_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(update_match_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Update match */
exports.update_match_plan_middleware = async (req, res, next) => {
    try {
        const { id, match_status } = req.body;

        const match_query = { id };
        const match_information = { match_status };

        const { status: match_status, response: match_response } = await update_match_controller(match_query, match_information);

        if (match_status === SUCCESS) {
            const { affectedRows, changedRows } = match_response;

            if (affectedRows === 0) {
                return next(httpResponse(req, res, BAD_REQUEST, {
                    message: "Match ID is invalid."
                }));
            } else if(changedRows === 0) {
                return httpResponse(req, res, SUCCESS, {
                    message: "No recored updated."
                });
            } else return httpResponse(req, res, SUCCESS, {
                message: "Match has been updated successfully."
            });
        } else next(httpResponse(req, res, plan_status, match_response));

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

/** Clear match model middleware */
exports.clear_match_model_middleware = async (req, res, next) => {
    try {
        await clear_match_table_controller();
        return httpResponse(req, res, SUCCESS, {
            message: "Successfully clear match model."
        });
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
