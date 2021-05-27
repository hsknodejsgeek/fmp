var express = require('express');
const { USER_TYPE_ADMIN, USER_TYPE_USER, USER_TYPE_CONSULTANT, USER_TYPE_REGION_MANAGER, USER_TYPE_OWNER } = require('../constants/common.constants');
const { user_auth_middleware } = require('../middlewares/auth.middleware');
const { login_validation_middleware, login_middleware, session_login_validation_middleware, session_login, forgot_password_validation_middleware, forgot_password_middleware, reset_forgot_password_validation_middleware, reset_forgot_password_middleware, oauth2_login_validation_middleware, oauth2_login_middleware } = require('../middlewares/common.middleware');
const { change_password_validation_middleware, change_password_middleware } = require('../middlewares/user.middleware');
var router = express.Router();

/** Login user */
router.post("/login",
    login_validation_middleware,
    login_middleware
);

/** Oauth2 Login */
router.post("/oauth2/login",
    oauth2_login_validation_middleware, 
    oauth2_login_middleware
);

/** Session login */
router.get("/session/login",
    session_login_validation_middleware,
    (req, res, next) => user_auth_middleware(req, res, next, [
        USER_TYPE_ADMIN,
        USER_TYPE_USER
    ]),
    session_login
);

/** Forgot Password */
router.post("/forgot_password",
    forgot_password_validation_middleware,
    forgot_password_middleware
);

/** Reset Password */
router.post("/reset_password_via_token",
    reset_forgot_password_validation_middleware,
    reset_forgot_password_middleware
);

/** Change password */
router.post("/change/password",
    (req, res, next) => user_auth_middleware(req, res, next, [
        USER_TYPE_SUPER_ADMIN,
        USER_TYPE_USER,
        USER_TYPE_CONSULTANT,
        USER_TYPE_REGION_MANAGER,
        USER_TYPE_OWNER
    ]),
    change_password_validation_middleware,
    change_password_middleware
);

module.exports = router;
