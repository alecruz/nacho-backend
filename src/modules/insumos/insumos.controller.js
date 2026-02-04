// src/modules/insumos/insumos.controller.js
const repo = require("./insumos.repo");

async function listInsumos(req, res) {
  const clienteId = req.user.cliente_id;
  const insumos = await repo.findAllByCliente(clienteId);
  return res.json({ ok: true, data: insumos });
}

async function createInsumo(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const { nombre, categoria, unidad, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    const nuevo = await repo.insertInsumo({
      cliente_id: clienteId,
      nombre: String(nombre).trim(),
      categoria: categoria ? String(categoria).trim() : null,
      unidad: unidad ? String(unidad).trim() : null,
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.status(201).json({ ok: true, data: nuevo });
  } catch (err) {
    console.error("createInsumo error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "ux_insumos_cliente_nombre_activo" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          err.detail.toLowerCase().includes("nombre"));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "INSUMO_DUPLICADO",
          message: "Ya existe un insumo activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al crear insumo" });
  }
}

async function updateInsumo(req, res) {
  try {
    const clienteId = req.user.cliente_id;
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "id inválido" });
    }

    const existing = await repo.findById(id);
    if (!existing || existing.cliente_id !== clienteId) {
      return res.status(404).json({ ok: false, error: "Insumo no encontrado" });
    }

    const { nombre, categoria, unidad, observaciones } = req.body;

    if (!nombre || String(nombre).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "nombre es obligatorio" });
    }

    const updated = await repo.updateInsumo({
      id,
      nombre: String(nombre).trim(),
      categoria: categoria ? String(categoria).trim() : null,
      unidad: unidad ? String(unidad).trim() : null,
      observaciones: observaciones ? String(observaciones).trim() : null,
    });

    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error("updateInsumo error:", err);

    if (err?.code === "23505") {
      const isDup =
        err?.constraint === "ux_insumos_cliente_nombre_activo" ||
        (typeof err?.detail === "string" &&
          err.detail.includes("Key (cliente_id") &&
          err.detail.toLowerCase().includes("nombre"));

      if (isDup) {
        return res.status(409).json({
          ok: false,
          code: "INSUMO_DUPLICADO",
          message: "Ya existe un insumo activo con ese nombre.",
        });
      }

      return res.status(409).json({
        ok: false,
        code: "DUPLICADO",
        message: "Ya existe un registro con valores duplicados.",
      });
    }

    return res.status(500).json({ ok: false, error: "Error interno al actualizar insumo" });
  }
}

async function removeInsumo(req, res) {
  const clienteId = req.user.cliente_id;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: "id inválido" });
  }

  const existing = await repo.findById(id);
  if (!existing || existing.cliente_id !== clienteId) {
    return res.status(404).json({ ok: false, error: "Insumo no encontrado" });
  }

  if (existing.activo === false) {
    return res.json({ ok: true, data: { id: existing.id, activo: false } });
  }

  const updated = await repo.deactivateInsumo(id);
  return res.json({ ok: true, data: updated });
}

module.exports = { listInsumos, createInsumo, updateInsumo, removeInsumo };
