const db = require("../../db");

async function findAllByCliente(clienteId) {
  const r = await db.query(
    `SELECT id, cliente_id, nombre, observaciones, activo, created_at
     FROM cultivos
     WHERE cliente_id = $1 AND activo = true
     ORDER BY id DESC`,
    [clienteId]
  );
  return r.rows;
}

async function findById(id) {
  const r = await db.query(
    `SELECT id, cliente_id, nombre, observaciones, activo, created_at
     FROM cultivos
     WHERE id = $1`,
    [id]
  );
  return r.rows[0] || null;
}

async function insertCultivo({ cliente_id, nombre, observaciones }) {
  const r = await db.query(
    `INSERT INTO cultivos (cliente_id, nombre, observaciones)
     VALUES ($1, $2, $3)
     RETURNING id, cliente_id, nombre, observaciones, activo, created_at`,
    [cliente_id, nombre, observaciones ?? null]
  );
  return r.rows[0];
}

async function updateCultivo({ id, nombre, observaciones }) {
  const r = await db.query(
    `UPDATE cultivos
     SET nombre = $2, observaciones = $3
     WHERE id = $1
     RETURNING id, cliente_id, nombre, observaciones, activo, created_at`,
    [id, nombre, observaciones ?? null]
  );
  return r.rows[0] || null;
}

async function deactivateCultivo(id) {
  const r = await db.query(
    `UPDATE cultivos
     SET activo = false
     WHERE id = $1
     RETURNING id, activo`,
    [id]
  );
  return r.rows[0] || null;
}

module.exports = {
  findAllByCliente,
  findById,
  insertCultivo,
  updateCultivo,
  deactivateCultivo,
};
