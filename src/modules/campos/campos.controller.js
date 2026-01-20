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

module.exports = { listCampos, createCampo };
