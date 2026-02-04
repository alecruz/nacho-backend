// src/modules/insumos/insumos.routes.js
const express = require("express");
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { requireAuth, requireRole } = require("../../middlewares/auth");
const { listInsumos, createInsumo, updateInsumo, removeInsumo } = require("./insumos.controller");

router.get("/", requireAuth, asyncHandler(listInsumos));
router.post("/", requireAuth, requireRole("ADMIN"), asyncHandler(createInsumo));
router.put("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(updateInsumo));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(removeInsumo));

module.exports = router;