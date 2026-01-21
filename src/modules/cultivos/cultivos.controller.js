const repo = require("./cultivos.repo");

async function listCultivos(req, res) {
  const clienteId = req.user.cliente_id;
  const cultivos = await repo.findAllByCliente(clienteId);
  return res.json({ ok: true, data: cultivos });
}

async function createCultivo(req, res) {
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

async function updateCultivo(req, res) {
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
