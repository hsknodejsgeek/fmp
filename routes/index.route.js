var express = require("express");
var router = express.Router();
var userRouter = require("./user.route");
var adminRouter = require("./admin.route");
var commonRouter = require("./common.route");

router.use("/", commonRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);

module.exports = router;
