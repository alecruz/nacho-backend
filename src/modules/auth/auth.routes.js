const express = require("express");
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { login } = require("./auth.controller");

router.post("/login", asyncHandler(login));

module.exports = router;
