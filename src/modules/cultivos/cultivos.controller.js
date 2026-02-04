const repo = require("./cultivos.repo");

async function listCultivos(req, res) {
  const clienteId = req.user.cliente_id;
  const cultivos = await repo.findAllByCliente(clienteId);
  return res.json({ ok: true, data: cultivos });
}

async function createCultivo(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const { nombre, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    const nuevo = await repo.insertCultivo({
      cliente_id: clienteId,
      nombre: String(nombre).trim(),
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.status(201).json({ ok: true, data: nuevo });
  } 
  catch (err) {
    console.error("createCultivo error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "ux_cultivos_cliente_nombre_activo" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          err.detail.includes("nombre"));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "CULTIVO_DUPLICADO",
          message: "Ya existe un cultivo activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al crear cultivo" });
  }
}

async function updateCultivo(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "id inválido" });
    }

    const existing = await repo.findById(id);
    if (!existing || existing.cliente_id !== clienteId) {
      return res.status(404).json({ ok: false, error: "Cultivo no encontrado" });
    }

    const { nombre, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    const updated = await repo.updateCultivo({
      id,
      nombre: String(nombre).trim(),
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.json({ ok: true, data: updated });
  } 
  catch (err) {
    console.error("updateCultivo error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "ux_cultivos_cliente_nombre_activo" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          err.detail.includes("nombre"));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "CULTIVO_DUPLICADO",
          message: "Ya existe un cultivo activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al actualizar cultivo" });
  }
}

async function removeCultivo(req, res) {
  const clienteId = req.user.cliente_id;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: "id inválido" });
  }

  const existing = await repo.findById(id);
  if (!existing || existing.cliente_id !== clienteId) {
    return res.status(404).json({ ok: false, error: "Cultivo no encontrado" });
  }

  if (existing.activo === false) {
    return res.json({ ok: true, data: { id: existing.id, activo: false } });
  }

  const updated = await repo.deactivateCultivo(id);
  return res.json({ ok: true, data: updated });
}

module.exports = { listCultivos, createCultivo, updateCultivo, removeCultivo };
