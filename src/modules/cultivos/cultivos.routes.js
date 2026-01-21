const express = require("express");
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { requireAuth, requireRole } = require("../../middlewares/auth");
const { listCultivos, createCultivo, updateCultivo, removeCultivo } = require("./cultivos.controller");

router.get("/", requireAuth, asyncHandler(listCultivos));
router.post("/", requireAuth, requireRole("ADMIN"), asyncHandler(createCultivo));
router.put("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(updateCultivo));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(removeCultivo));

module.exports = router;
