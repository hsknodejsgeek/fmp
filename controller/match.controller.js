const { ERROR, SUCCESS } = require("../constants/common.constants");
var { db_client } = require("../db/connection.db");

exports.insert_match_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, uid, influencer_uid, status } = data || {};
            db_client().query("insert into matches(id, uid, influencer_uid, status) values(?, ?, ?, ?)", [id, uid, influencer_uid, status], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_match_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id } = query || {};
            const { match_status } = data || {};
            db_client().query("update `matches` set match_status=? where id=?", [match_status, id], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result && result.length ? result[0] : {} });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.check_match_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { uid, influencer_uid } = query || {};
            const { match_status } = data || {};
            db_client().query("select * from `matches` where uid=? and influencer_uid=?", [uid, influencer_uid], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result && result.length ? result[0] : {} });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.clear_match_table_controller = () => {
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