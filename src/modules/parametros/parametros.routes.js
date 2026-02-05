const express = require("express");
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { requireAuth, requireRole } = require("../../middlewares/auth");
const { listParametros, createParametro, updateParametro, removeParametro } = require("./parametros.controller");

router.get("/", requireAuth, asyncHandler(listParametros));
router.post("/", requireAuth, requireRole("ADMIN"), asyncHandler(createParametro));
router.put("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(updateParametro));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(removeParametro));

module.exports = router;