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

  // Validación simple (más validaciones si querés)
  if (superficie != null && Number(superficie) < 0) {
    return res.status(400).json({ ok: false, error: "superficie no puede ser negativa" });
  }

  const nuevo = await repo.insertCampo({
    cliente_id: clienteId,
    nombre: String(nombre).trim(),
    superficie: superficie != null ? Number(superficie) : null,
    observaciones: observaciones ? String(observaciones).trim() : null,
  });

  res.status(201).json({ ok: true, data: nuevo });
}

module.exports = { listCampos, createCampo };
