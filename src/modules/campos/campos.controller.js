const repo = require("./campos.repo");

async function listCampos(req, res) {
  const clienteId = req.user.cliente_id;
  const campos = await repo.findAllByCliente(clienteId);
  res.json({ ok: true, data: campos });
}

async function createCampo(req, res) {
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
}

async function updateCampo(req, res) {
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


module.exports = { listCampos, createCampo, updateCampo, removeCampo };
