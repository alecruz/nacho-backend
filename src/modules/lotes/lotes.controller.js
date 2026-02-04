// /lotes/lotes.controller.js
const lotesRepo = require("./lotes.repo");

function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function normalizeCultivosOrNull(cultivos) {
  if (cultivos === undefined) return null; // no tocar cultivos
  if (!Array.isArray(cultivos)) return []; // si viene raro, lo tratamos como "vacío"

  const clean = cultivos.map((c) => ({
    cultivo_id: Number(c.cultivo_id),
    ha_cultivo: Number(c.ha_cultivo),
  }));

  for (const c of clean) {
    if (!Number.isFinite(c.cultivo_id) || c.cultivo_id <= 0) {
      return { error: "cultivo_id inválido en cultivos[]" };
    }
    if (!Number.isFinite(c.ha_cultivo) || c.ha_cultivo <= 0) {
      return { error: "ha_cultivo debe ser un número mayor a 0 en cultivos[]" };
    }
  }

  return { clean };
}

async function createLote(req, res) {
  try {
    const { campo_id, nombre, superficie, observaciones, cultivos } = req.body;

    if (!campo_id) return res.status(400).json({ error: "campo_id es obligatorio" });
    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    if (superficie === undefined || superficie === null || !isPositiveNumber(superficie)) {
      return res.status(400).json({ error: "superficie debe ser un número mayor a 0" });
    }

    const supNum = Number(superficie);

    let cultivosClean = [];
    if (cultivos !== undefined) {
      const norm = normalizeCultivosOrNull(cultivos);
      if (norm?.error) return res.status(400).json({ error: norm.error });
      cultivosClean = norm?.clean ?? [];
      const suma = cultivosClean.reduce((acc, x) => acc + x.ha_cultivo, 0);
      if (suma > supNum + 1e-9) {
        return res.status(400).json({
          error: "La suma de superficies cultivadas no puede superar la superficie del lote",
        });
      }
    }

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

    if (err.code === "23505" && err.constraint === "ux_lotes_campo_nombre_activo") {
      return res.status(409).json({
        ok: false,
        code: "LOTE_DUPLICADO",
        message: "Ya existe un lote activo con ese nombre en este campo."
      });
    }

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
    const { nombre, superficie, observaciones, cultivos } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    if (superficie === undefined || superficie === null || !isPositiveNumber(superficie)) {
      return res.status(400).json({ error: "superficie debe ser un número mayor a 0" });
    }

    const supNum = Number(superficie);

    // cultivos:
    // - undefined => no tocar cultivos
    // - [] => borrar todos
    // - [{...}] => reemplazar por esta lista
    let cultivosCleanOrNull = null;
    if (cultivos !== undefined) {
      const norm = normalizeCultivosOrNull(cultivos);
      if (norm?.error) return res.status(400).json({ error: norm.error });

      const clean = norm?.clean ?? [];
      const suma = clean.reduce((acc, x) => acc + x.ha_cultivo, 0);
      if (suma > supNum + 1e-9) {
        return res.status(400).json({
          error: "La suma de superficies cultivadas no puede superar la superficie del lote",
        });
      }

      cultivosCleanOrNull = clean;
    }

    const updated = await lotesRepo.updateWithCultivos(Number(id), {
      nombre: String(nombre).trim(),
      superficie: supNum,
      observaciones: observaciones ? String(observaciones).trim() : null,
      cultivos: cultivosCleanOrNull, // null => no tocar; [] o lista => reemplazar
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
