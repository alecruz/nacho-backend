const db = require("../../db");

async function findAllByCliente(clienteId) {
  const r = await db.query(
    `SELECT id, cliente_id, nombre, superficie, observaciones, created_at
     FROM campos
     WHERE cliente_id = $1
     ORDER BY id DESC`,
    [clienteId]
  );
  return r.rows;
}

async function insertCampo({ cliente_id, nombre, superficie, observaciones }) {
  const r = await db.query(
    `INSERT INTO campos (cliente_id, nombre, superficie, observaciones)
     VALUES ($1, $2, $3, $4)
     RETURNING id, cliente_id, nombre, superficie, observaciones, created_at`,
    [cliente_id, nombre, superficie ?? null, observaciones ?? null]
  );
  return r.rows[0];
}

module.exports = { findAllByCliente, insertCampo };
