const { ERROR, SUCCESS } = require("../constants/common.constants");
var { db_client } = require("../db/connection.db");

exports.insert_subscription_plan_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, name, duration, super_likes, boost_profie_duration, plan_type, boost_profile, price } = data || {};
            db_client().query("insert into subscription_plans(id, name, duration, super_likes, boost_profie_duration, plan_type, boost_profile, price) values(?, ?, ?, ?, ?, ?, ?, ?)", [id, name, duration, super_likes, boost_profie_duration, plan_type, boost_profile, price], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.get_subscription_plan_detail_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id } = data || {};
            db_client().query("select * from `subscription_plans` where id=?;", [id], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                result = result && result.length ? result[0] : {};
                return resolve({ status: result && result.id ? SUCCESS : ERROR, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.get_subscription_plans_list_controller = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            db_client().query("select count(*) as plans_count from subscription_plans;", (err, subscription_plan_detail) => {
                if(err) return reject({ status: ERROR, response: err });
                const count = subscription_plan_detail && subscription_plan_detail.length ? subscription_plan_detail[0].plans_count : 0;

                return db_client().query("select * from `subscription_plans`;", (err, result) => {
                    if(err) return reject({ status: ERROR, response: err });
                    result = result && result.length ? result : [];
                    return resolve({ status: SUCCESS, response: result, count });
                });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_subscription_plan_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id } = query || {};
            const { name, duration, super_likes, boost_profie_duration, boost_profile, price } = data || {};
            db_client().query("update `subscription_plans` set name=? name=?, duration=?, super_likes=?, boost_profie_duration=?, boost_profile=?, price=? where id=?", [name, duration, super_likes, boost_profie_duration, plan_type, boost_profile, price, id], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result && result.length ? result[0] : {} });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.clear_subscription_plans_table_controller = () => {
    return new Promise((resolve, reject) => {
        try {
            db_client().query("truncate table subscription_plans;", [], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.insert_subscription_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, uid, sid, subscription } = data || {};
            db_client().query("insert into subscriptions(id, uid, sid, subscription) values(?, ?, ?, ?)", [id, uid, sid, subscription], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.get_subscription_detail_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, status } = data || {};
            db_client().query("select * from `subscriptions` where id=? and status=?;", [id, status], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                result = result && result.length ? result[0] : {};
                return resolve({ status: result && result.id ? SUCCESS : ERROR, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}