// src/modules/insumos/insumos.repo.js
const db = require("../../db");

async function findAllByCliente(clienteId) {
  const r = await db.query(
    `SELECT id, cliente_id, nombre, categoria, unidad, observaciones, activo, created_at
     FROM insumos
     WHERE cliente_id = $1 AND activo = true
     ORDER BY id DESC`,
    [clienteId]
  );
  return r.rows;
}

async function findById(id) {
  const r = await db.query(
    `SELECT id, cliente_id, nombre, categoria, unidad, observaciones, activo, created_at
     FROM insumos
     WHERE id = $1`,
    [id]
  );
  return r.rows[0] || null;
}

async function insertInsumo({ cliente_id, nombre, categoria, unidad, observaciones }) {
  const r = await db.query(
    `INSERT INTO insumos (cliente_id, nombre, categoria, unidad, observaciones)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, cliente_id, nombre, categoria, unidad, observaciones, activo, created_at`,
    [cliente_id, nombre, categoria ?? null, unidad ?? null, observaciones ?? null]
  );
  return r.rows[0];
}

async function updateInsumo({ id, nombre, categoria, unidad, observaciones }) {
  const r = await db.query(
    `UPDATE insumos
     SET nombre = $2,
         categoria = $3,
         unidad = $4,
         observaciones = $5
     WHERE id = $1
     RETURNING id, cliente_id, nombre, categoria, unidad, observaciones, activo, created_at`,
    [id, nombre, categoria ?? null, unidad ?? null, observaciones ?? null]
  );
  return r.rows[0] || null;
}

async function deactivateInsumo(id) {
  const r = await db.query(
    `UPDATE insumos
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
  insertInsumo,
  updateInsumo,
  deactivateInsumo,
};
