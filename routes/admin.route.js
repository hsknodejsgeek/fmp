var express = require('express');
const { clear_user_table_controller } = require('../controller/user.controller');
const { admin_signup_validation_middleware, admin_signup_middleware, admin_users_list_validation_middleware, admin_users_list_middleware, admin_delete_user_validation_middleware, admin_delete_user_middleware } = require('../middlewares/admin.middleware');
var router = express.Router();

/** Signup user */
router.post("/signup",
    admin_signup_validation_middleware,
    admin_signup_middleware
);

/** Users List */
router
    .post("/users",
        admin_users_list_validation_middleware,
        admin_users_list_middleware
    )
    .delete("/user/:id/:status",
        admin_delete_user_validation_middleware,
        admin_delete_user_middleware
    );

module.exports = router;
