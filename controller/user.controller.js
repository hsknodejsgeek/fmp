const { ERROR, SUCCESS } = require("../constants/common.constants");
var { db_client } = require("../db/connection.db");
const { forgot_password_schema } = require("../schema/user.schema");

exports.insert_user_info_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, country_code, phone_number, slug, loggin_ip, access_token, first_name, last_name, email, oauth2_id, login_type } = data || {};
            db_client().query("insert into users(id, country_code, phone_number, slug, login_ip, access_token, first_name, last_name, email, oauth2_id, login_type) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, country_code, phone_number, slug, loggin_ip, access_token, first_name, last_name, email, oauth2_id, login_type], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.insert_admin_user_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, email, password, slug, user_type, verification_status, loggin_ip, access_token } = data || {};
            db_client().query("insert into users(id, email, password, slug, user_type, verification_status, login_ip, access_token) values(?, ?, ?, ?, ?, ?, ?, ?)", [id, email, password, slug, user_type, verification_status, loggin_ip, access_token], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.get_user_info_detail_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { phone_number, id, email, oauth2_id } = data || {};
            db_client().query("select * from `users` where phone_number=? or id=? or email=? or oauth2_id=?;", [phone_number, id, email, oauth2_id], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                result = result && result.length ? result[0] : {};
                return resolve({ status: result && result.id ? SUCCESS : ERROR, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.get_user_list_controller = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { limit, skip, search } = data || {};
            const where = search ? `where first_name LIKE '%${search}%' or last_name LIKE '%${search}%' or phone_number LIKE '%${search}%' or email LIKE '%${search}%'` : "";
            db_client().query("select count(*) as users_count from users "+where, (err, user_detail) => {
                if(err) return reject({ status: ERROR, response: err });
                const count = user_detail && user_detail.length ? user_detail[0].users_count : 0;
                console.log("users count ===> ", typeof limit, typeof skip, count, user_detail[0]);
                return db_client().query("select * from `users` "+ where +" limit ? offset ? ;", [limit, skip], (err, result) => {
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

exports.login_user_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { email, password } = data || {};
            db_client().query("select * from `users` where email=? and password=?", [email, password], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result && result.length ? result[0] : {} });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.oauth2_login_user_controller = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { oauth2_id, email } = data || {};
            db_client().query("select * from `users` where oauth2_id = ? or email=?", [oauth2_id, email], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result && result.length ? result[0] : {} });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_forgot_password_code_user_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { email } = query || {};
            const { forgot_password_code } = data || {};
            db_client().query("update `users` set forgot_password_code=? where email=?", [forgot_password_code, email], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result && result.length ? result[0] : {} });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_reset_password_user_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { uid, forgot_password_access_token } = query || {};
            const { password } = data || {};
            db_client().query("update `users` set password=? where id=? and forgot_password_code=?", [password, uid, forgot_password_access_token], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_change_password_user_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, password: old_password } = query || {};
            const { password } = data || {};
            db_client().query("update `users` set password=? where id=? and password=?", [id, old_password, password], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_user_login_otp_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { id } = query || {};
            const { phone_number_otp } = data || {};
            db_client().query("update `users` set phone_number_otp=? where id=?", [phone_number_otp, id], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_user_verification_status_controller = (query, data) => {
    return new Promise((resolve, reject) => {
        try {
            const { phone, phone_number_otp } = query || {};
            const { otp, verification_status } = data || {};
            db_client().query("update `users` set phone_number_otp=?, verification_status=? where phone_number=? and phone_number_otp=?", [otp, verification_status, phone, phone_number_otp], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.clear_user_table_controller = () => {
    return new Promise((resolve, reject) => {
        try {
            db_client().query("truncate table users;", [], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}

exports.update_user_delete_status_controller = (query) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, status } = query || {};
            db_client().query("update `users` set deleted_status=? where id=?", [status, id], (err, result) => {
                if(err) return reject({ status: ERROR, response: err });
                return resolve({ status: SUCCESS, response: result && result.length ? result[0] : {} });
            });
        } catch (error) {
            return reject({ status: ERROR, response: error });
        }
    });
}