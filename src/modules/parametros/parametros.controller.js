const repo = require("./parametros.repo");

async function listParametros(req, res) {
  const clienteId = req.user.cliente_id;
  const parametros = await repo.findAllByCliente(clienteId);
  return res.json({ ok: true, data: parametros });
}

async function createParametro(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const { nombre, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    const nuevo = await repo.insertParametro({
      cliente_id: clienteId,
      nombre: String(nombre).trim(),
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.status(201).json({ ok: true, data: nuevo });
  }
  catch (err) {
    console.error("createParametro error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "ux_parametros_cliente_nombre_acivo" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          // como el índice es por LOWER(nombre), el driver suele mostrar "lower"
          (err.detail.toLowerCase().includes("lower") || err.detail.includes("nombre")));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "PARAMETRO_DUPLICADO",
          message: "Ya existe un parámetro activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al crear parámetro" });
  }
}

async function updateParametro(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "id inválido" });
    }

    const existing = await repo.findById(id);
    if (!existing || existing.cliente_id !== clienteId) {
      return res.status(404).json({ ok: false, error: "Parámetro no encontrado" });
    }

    const { nombre, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    const updated = await repo.updateParametro({
      id,
      nombre: String(nombre).trim(),
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.json({ ok: true, data: updated });
  }
  catch (err) {
    console.error("updateParametro error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "uniq_parametros_cliente_nombre_ci" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          (err.detail.toLowerCase().includes("lower") || err.detail.includes("nombre")));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "PARAMETRO_DUPLICADO",
          message: "Ya existe un parámetro activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al actualizar parámetro" });
  }
}

async function removeParametro(req, res) {
  const clienteId = req.user.cliente_id;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: "id inválido" });
  }

  const existing = await repo.findById(id);
  if (!existing || existing.cliente_id !== clienteId) {
    return res.status(404).json({ ok: false, error: "Parámetro no encontrado" });
  }

  if (existing.activo === false) {
    return res.json({ ok: true, data: { id: existing.id, activo: false } });
  }

  const updated = await repo.deactivateParametro(id);
  return res.json({ ok: true, data: updated });
}


module.exports = { listParametros, createParametro, updateParametro, removeParametro };
