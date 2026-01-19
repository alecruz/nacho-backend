const express = require("express");
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { requireAuth, requireRole } = require("../../middlewares/auth");
const { listCampos, createCampo } = require("./campos.controller");

router.get("/", requireAuth, asyncHandler(listCampos));
router.post("/", requireAuth, requireRole("ADMIN"), asyncHandler(createCampo));

module.exports = router;
