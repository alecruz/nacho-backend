// /lotes/lotes.routes.js
const express = require("express");
const controller = require("./lotes.controller");

const router = express.Router();

// Listar (opcional por campo_id) - solo activos
router.get("/", controller.getLotes);

// Obtener uno
router.get("/:id", controller.getLoteById);

// Crear
router.post("/", controller.createLote);

// Editar
router.put("/:id", controller.updateLote);

// Borrado lógico
router.delete("/:id", controller.deleteLote);

module.exports = router;
