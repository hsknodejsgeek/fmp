// const nodemailer = require('nodemailer');
const { SUCCESS, ERROR } = require("../constants/common.constants");
require('dotenv').config();

// let mailTransporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.NODEMAILER_USER,
//         pass: process.env.NODEMAILER_USER_PASSWORD
//     }
// });

/** Send mail on forgot password */
exports.send_forgot_password_controller = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { from, to, uid, forgot_password_access_token } = data;

            let mailDetails = {
                from: 'meharsharma80001@gmail.com',
                to: to,
                subject: 'Forgot Passoword',
                text: `<h1>Forgot Password</h1><br/><a href="${process.env.WEB_APP_BASE_URL}/reset_password/${uid}/${forgot_password_access_token}">Reset Password</>`
            };

            // mailTransporter.sendMail(mailDetails, function (err, data) {
            //     if (err) {
            //         resolve({
            //             status: ERROR, response: {
            //                 message: 'Error Occurs'
            //             }
            //         });
            //     } else {
            //         resolve({
            //             status: SUCCESS, response: {
            //                 message: 'Email sent successfully'
            //             }
            //         });
            //     }
            //     // console.log("send mail ===> ", err, data);
            // });
        } catch (error) {
            console.log("error ===> ", error);
            resolve({ status: ERROR, response: error });
        }
    });
}

