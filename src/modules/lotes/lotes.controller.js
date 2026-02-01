// /lotes/lotes.controller.js
const lotesRepo = require("./lotes.repo");

function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

async function createLote(req, res) {
  try {
    const { campo_id, nombre, superficie, observaciones, cultivos } = req.body;

    if (!campo_id) {
      return res.status(400).json({ error: "campo_id es obligatorio" });
    }
    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    if (superficie === undefined || superficie === null || !isPositiveNumber(superficie)) {
      return res.status(400).json({ error: "superficie debe ser un número mayor a 0" });
    }

    const supNum = Number(superficie);

    // ---- Validación / normalización de cultivos (si vienen) ----
    let cultivosClean = [];

    if (Array.isArray(cultivos) && cultivos.length > 0) {
      cultivosClean = cultivos.map((c) => ({
        cultivo_id: Number(c.cultivo_id),
        ha_cultivo: Number(c.ha_cultivo),
      }));

      for (const c of cultivosClean) {
        if (!Number.isFinite(c.cultivo_id) || c.cultivo_id <= 0) {
          return res.status(400).json({ error: "cultivo_id inválido en cultivos[]" });
        }
        if (!Number.isFinite(c.ha_cultivo) || c.ha_cultivo <= 0) {
          return res.status(400).json({ error: "ha_cultivo debe ser un número mayor a 0 en cultivos[]" });
        }
      }

      // Opcional recomendado: suma de ha_cultivo <= superficie del lote
      const suma = cultivosClean.reduce((acc, x) => acc + x.ha_cultivo, 0);
      if (suma > supNum + 1e-9) {
        return res.status(400).json({
          error: "La suma de superficies cultivadas no puede superar la superficie del lote",
        });
      }
    }

    // ✅ Insertar lote + lote_cultivos si corresponde
    const lote = await lotesRepo.createLoteWithCultivos({
      campo_id: Number(campo_id),
      nombre: String(nombre).trim(),
      superficie: supNum,
      observaciones: observaciones ? String(observaciones).trim() : null,
      cultivos: cultivosClean,
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

    const lote = await lotesRepo.findById(Number(id));
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

    const updated = await lotesRepo.update(Number(id), {
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

    const deleted = await lotesRepo.softDelete(Number(id));
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
