const db = require("../../db");

async function findAllByCliente(clienteId) {
  const r = await db.query(
    `SELECT id, cliente_id, nombre, superficie, observaciones, created_at
     FROM campos
     WHERE cliente_id = $1
       AND activo = true
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

async function findById(id) {
  const r = await db.query(
    `SELECT id, cliente_id, nombre, superficie, observaciones, activo, created_at
     FROM campos
     WHERE id = $1`,
    [id]
  );
  return r.rows[0] || null;
}

async function updateCampo({ id, nombre, superficie, observaciones }) {
  const r = await db.query(
    `UPDATE campos
     SET nombre = $2, superficie = $3, observaciones = $4
     WHERE id = $1
     RETURNING id, cliente_id, nombre, superficie, observaciones, created_at`,
    [id, nombre, superficie, observaciones ?? null]
  );
  return r.rows[0] || null;
}

async function deleteCampo(id) {
  const r = await db.query(
    `DELETE FROM campos
     WHERE id = $1
     RETURNING id`,
    [id]
  );
  return r.rows[0] || null;
}

async function deactivateCampo(id) {
  const r = await db.query(
    `UPDATE campos
     SET activo = false
     WHERE id = $1
     RETURNING id, activo`,
    [id]
  );
  return r.rows[0] || null;
}

module.exports = {
  findAllByCliente,
  insertCampo,
  findById,
  updateCampo,
  deleteCampo,
  deactivateCampo,
};

