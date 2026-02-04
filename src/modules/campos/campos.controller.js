const repo = require("./campos.repo");

async function listCampos(req, res) {
  const clienteId = req.user.cliente_id;
  const campos = await repo.findAllByCliente(clienteId);
  res.json({ ok: true, data: campos });
}

async function getCampoById(req, res) {
  const clienteId = req.user.cliente_id;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: "id inválido" });
  }

  const existing = await repo.findById(id);
  if (!existing) return res.status(404).json({ ok: false, error: "Campo no encontrado" });

  // Seguridad multi-cliente
  if (existing.cliente_id !== clienteId) {
    return res.status(404).json({ ok: false, error: "Campo no encontrado" });
  }

  // Si querés, podés impedir ver inactivos
  if (existing.activo === false) {
    return res.status(404).json({ ok: false, error: "Campo no encontrado" });
  }

  return res.json({ ok: true, data: existing });
}

async function createCampo(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const { nombre, superficie, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    // superficie obligatoria
    if (superficie === undefined || superficie === null) {
      return res.status(400).json({ ok: false, error: "superficie es obligatoria" });
    }

    const superficieNum = Number(superficie);

    if (Number.isNaN(superficieNum)) {
      return res.status(400).json({ ok: false, error: "superficie debe ser un número" });
    }

    if (superficieNum <= 0) {
      return res.status(400).json({ ok: false, error: "superficie debe ser mayor a 0" });
    }

    const nuevo = await repo.insertCampo({
      cliente_id: clienteId,
      nombre: String(nombre).trim(),
      superficie: superficieNum,
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.status(201).json({ ok: true, data: nuevo });
  } catch (err) {
    console.error("createCampo error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "ux_campos_cliente_nombre_activo" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          err.detail.includes("nombre"));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "CAMPO_DUPLICADO",
          message: "Ya existe un campo activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al crear campo" });
  }
}

async function updateCampo(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "id inválido" });
    }

    const existing = await repo.findById(id);
    if (!existing) return res.status(404).json({ ok: false, error: "Campo no encontrado" });

    // Seguridad multi-cliente
    if (existing.cliente_id !== clienteId) {
      return res.status(404).json({ ok: false, error: "Campo no encontrado" });
    }

    const { nombre, superficie, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    if (superficie === undefined || superficie === null) {
      return res.status(400).json({ ok: false, error: "superficie es obligatoria" });
    }

    const superficieNum = Number(superficie);
    if (Number.isNaN(superficieNum) || superficieNum <= 0) {
      return res.status(400).json({ ok: false, error: "superficie debe ser mayor a 0" });
    }

    const updated = await repo.updateCampo({
      id,
      nombre: String(nombre).trim(),
      superficie: superficieNum,
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error("updateCampo error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "ux_campos_cliente_nombre_activo" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          err.detail.includes("nombre"));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "CAMPO_DUPLICADO",
          message: "Ya existe un campo activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al actualizar campo" });
  }
}

async function removeCampo(req, res) {
  const clienteId = req.user.cliente_id;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: "id inválido" });
  }

  const existing = await repo.findById(id);
  if (!existing) return res.status(404).json({ ok: false, error: "Campo no encontrado" });

  // Seguridad multi-cliente
  if (existing.cliente_id !== clienteId) {
    return res.status(404).json({ ok: false, error: "Campo no encontrado" });
  }

  // Si ya está inactivo, lo tratamos como ok idempotente
  if (existing.activo === false) {
    return res.json({ ok: true, data: { id: existing.id, activo: false } });
  }

  const updated = await repo.deactivateCampo(id);
  return res.json({ ok: true, data: updated });
}

module.exports = { listCampos, getCampoById, createCampo, updateCampo, removeCampo };
