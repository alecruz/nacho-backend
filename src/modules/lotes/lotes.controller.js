// /lotes/lotes.controller.js
const lotesRepo = require("./lotes.repo");

function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

async function createLote(req, res) {
  try {
    const { campo_id, nombre, superficie, observaciones } = req.body;

    if (!campo_id) {
      return res.status(400).json({ error: "campo_id es obligatorio" });
    }
    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    if (superficie === undefined || superficie === null || !isPositiveNumber(superficie)) {
      return res.status(400).json({ error: "superficie debe ser un número mayor a 0" });
    }

    const lote = await lotesRepo.createLote({
      campo_id: Number(campo_id),
      nombre: String(nombre).trim(),
      superficie: Number(superficie),
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.status(201).json(lote);
  } catch (err) {
    console.error("createLote error:", err);
    return res.status(500).json({ error: "Error interno al crear lote" });
  }
}

async function getLotes(req, res) {
  try {
    const { campo_id } = req.query;

    const lotes = await lotesRepo.findAll({
      campo_id: campo_id ? Number(campo_id) : undefined,
    });

    return res.json(lotes);
  } catch (err) {
    console.error("getLotes error:", err);
    return res.status(500).json({ error: "Error interno al listar lotes" });
  }
}

async function getLoteById(req, res) {
  try {
    const { id } = req.params;

    const lote = await lotesRepo.getLoteById(Number(id));
    if (!lote) return res.status(404).json({ error: "Lote no encontrado" });

    return res.json(lote);
  } catch (err) {
    console.error("getLoteById error:", err);
    return res.status(500).json({ error: "Error interno al obtener lote" });
  }
}

async function updateLote(req, res) {
  try {
    const { id } = req.params;
    const { nombre, superficie, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    if (superficie === undefined || superficie === null || !isPositiveNumber(superficie)) {
      return res.status(400).json({ error: "superficie debe ser un número mayor a 0" });
    }

    const updated = await lotesRepo.updateLote(Number(id), {
      nombre: String(nombre).trim(),
      superficie: Number(superficie),
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    if (!updated) return res.status(404).json({ error: "Lote no encontrado" });
    return res.json(updated);
  } catch (err) {
    console.error("updateLote error:", err);
    return res.status(500).json({ error: "Error interno al actualizar lote" });
  }
}

async function deleteLote(req, res) {
  try {
    const { id } = req.params;

    const deleted = await lotesRepo.softDeleteLote(Number(id));
    if (!deleted) return res.status(404).json({ error: "Lote no encontrado" });

    return res.json({ ok: true, lote: deleted });
  } catch (err) {
    console.error("deleteLote error:", err);
    return res.status(500).json({ error: "Error interno al eliminar lote" });
  }
}

module.exports = {
  createLote,
  getLotes,
  getLoteById,
  updateLote,
  deleteLote,
};
