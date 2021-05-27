var express = require('express');
const { clear_user_table_controller } = require('../controller/user.controller');
const { signup_validation_middleware, signup_middleware, clear_user_model_middleware, verify_phone_number_otp_validation_middleware, verify_phone_number_otp_middleware } = require('../middlewares/user.middleware');
var router = express.Router();

/** Signup user */
router.post("/signup",
    signup_validation_middleware,
    signup_middleware
);

/** Verify phone number */
router.post("/verify_phone_number",
    verify_phone_number_otp_validation_middleware,
    verify_phone_number_otp_middleware
);

/** Clear user data */
router.delete("/user/delete", 
    clear_user_model_middleware
);

module.exports = router;
