const express = require("express");
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { requireAuth, requireRole } = require("../../middlewares/auth");
const { listCampos, createCampo, updateCampo, removeCampo } = require("./campos.controller");

router.get("/", requireAuth, asyncHandler(listCampos));
router.post("/", requireAuth, requireRole("ADMIN"), asyncHandler(createCampo));
router.put("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(updateCampo));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(removeCampo));

module.exports = router;
