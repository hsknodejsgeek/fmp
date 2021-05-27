const { validate } = require("../schema");
const { VALIDATION_ERROR, SUCCESS, EMAIL_PRESENT, PRESENT, TOKEN_EXPIRES_IN, USER_TYPE_USER, PENDING, BAD_REQUEST, NOT_VALID, ACTIVE, AUTH_DATA, USER_TYPE_INVESTOR, ACCOUNT_VERIFIED } = require("../constants/common.constants");
const { httpResponse } = require("../controller/response.controller");
var { v4: uuid } = require('uuid');
const { create_subscription_plan_schema, edit_subscription_plan_schema } = require("../schema/subscription.schema");
const { get_subscription_plan_detail_controller, insert_subscription_plan_controller, clear_subscription_plans_table_controller, update_subscription_plan_controller, get_subscription_plans_list_controller, get_subscription_detail_controller, insert_subscription_controller } = require("../controller/subscription.controller");

/** Create subscription plan validation */
exports.create_subscription_plan_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(create_subscription_plan_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Create subscription plan */
exports.create_subscription_plan_middleware = async (req, res, next) => {
    try {
        const { name, duration, super_likes, boost_profie_duration, plan_type, boost_profile, price } = req.body;

        const plan_information = { id: uuid(), name, duration, super_likes, boost_profie_duration, plan_type, boost_profile, price };

        const get_data_query = { plan_type };

        const { status: check_plan_status, response: check_plan_response } = await get_subscription_plan_detail_controller(get_data_query);

        if(check_plan_status === SUCCESS) {
            return next(httpResponse(req, res, PRESENT, {
                message: "Subscription plan is already present, please try with other one."
            }));
        }

        const { status: plan_status, response: plan_response } = await insert_subscription_plan_controller(plan_information);

        if (plan_status === SUCCESS) {

            return httpResponse(req, res, plan_status, {
                message: "Subscription plan has been created successfully."
            });
        } else next(httpResponse(req, res, plan_status, plan_response));

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

/** Update subscription plan validation */
exports.update_subscription_plan_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(edit_subscription_plan_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Update subscription plan */
exports.update_subscription_plan_middleware = async (req, res, next) => {
    try {
        const { id, name, duration, super_likes, boost_profie_duration, boost_profile, price } = req.body;

        const plan_query = { id };
        const plan_information = { name, duration, super_likes, boost_profie_duration, boost_profile, price };

        const { status: plan_status, response: plan_response } = await update_subscription_plan_controller(plan_query, plan_information);

        if (plan_status === SUCCESS) {
            const { affectedRows, changedRows } = plan_response;

            if (affectedRows === 0) {
                return next(httpResponse(req, res, BAD_REQUEST, {
                    message: "Subscription plan ID is invalid."
                }));
            } else if(changedRows === 0) {
                return httpResponse(req, res, SUCCESS, {
                    message: "No recored updated."
                });
            } else return httpResponse(req, res, SUCCESS, {
                message: "Subscription plan has been updated successfully."
            });
        } else next(httpResponse(req, res, plan_status, plan_response));

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

/** List subscription plans */
exports.list_subscription_plans_middleware = async (req, res, next) => {
    try {

        const { status: plan_status, response: plan_response, count } = await get_subscription_plans_list_controller();

        if (plan_status === SUCCESS) {
            httpResponse(req, res, SUCCESS, {
                plans: plan_response,
                total: count
            })
        } else next(httpResponse(req, res, plan_status, plan_response));

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

/** Add subscription validation */
exports.add_subscription_validation_middleware = async (req, res, next) => {
    try {
        const data = await validate(add_subscription_schema, req.body);
        req.body = data;
        next();
    } catch (error) {
        next(httpResponse(req, res, VALIDATION_ERROR, error))
    }
}

/** Add subscription plan */
exports.add_subscription_middleware = async (req, res, next) => {
    try {
        const { uid, sid } = req.body;

        const get_data_query = { id: uid, status: ACTIVE };
        const get_plan_query = { id: sid };

        const [ plan_response, subscription_detail ] = await Promise.all([
            get_subscription_plan_detail_controller(get_plan_query),
            get_subscription_detail_controller(get_data_query)
        ]);

        const { status: plan_detail_status, response: plan_detail_response } = plan_response || {};
        const { status: subscription_detail_status, response: subscription_detail_response } = subscription_detail || {};

        if(subscription_detail_status === SUCCESS) {
            return next(httpResponse(req, res, PRESENT, {
                message: "Subscription is already present."
            }));
        }

        if(plan_detail_status !== SUCCESS) {
            return next(httpResponse(req, res, BAD_REQUEST, {
                message: "Subscription plan not found."
            }));
        }

        const plan_information = { id: uuid(), uid, sid, subscription: plan_detail_response };

        const { status: plan_status, response: plan_response } = await insert_subscription_controller(plan_information);

        if (plan_status === SUCCESS) {

            return httpResponse(req, res, plan_status, {
                message: "User subscription has been created successfully."
            });
        } else next(httpResponse(req, res, plan_status, plan_response));

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

/** Clear subscription plan model middleware */
exports.clear_subscription_paln_model_middleware = async (req, res, next) => {
    try {
        await clear_subscription_plans_table_controller();
        return httpResponse(req, res, SUCCESS, {
            message: "Successfully clear subscription plans."
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
