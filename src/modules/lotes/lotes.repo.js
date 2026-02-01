// /lotes/lotes.repo.js
const db = require("../../db");

// Crear lote (solo lotes)
async function createLote({ campo_id, nombre, superficie, observaciones }) {
  const r = await db.query(
    `INSERT INTO lotes (campo_id, nombre, superficie, observaciones, activo)
     VALUES ($1, $2, $3, $4, true)
     RETURNING id, campo_id, nombre, superficie, observaciones, created_at, activo`,
    [campo_id, nombre, superficie, observaciones ?? null]
  );

  return r.rows[0];
}

// ✅ Crear lote + cultivos (transacción)
async function createLoteWithCultivos({ campo_id, nombre, superficie, observaciones, cultivos }) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1) insertar lote
    const loteRes = await client.query(
      `INSERT INTO lotes (campo_id, nombre, superficie, observaciones, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, campo_id, nombre, superficie, observaciones, created_at, activo`,
      [campo_id, nombre, superficie, observaciones ?? null]
    );

    const lote = loteRes.rows[0];

    // 2) insertar lote_cultivos si vienen
    if (Array.isArray(cultivos) && cultivos.length > 0) {
      for (const c of cultivos) {
        await client.query(
          `INSERT INTO lote_cultivos (lote_id, cultivo_id, ha_cultivo)
           VALUES ($1, $2, $3)`,
          [lote.id, c.cultivo_id, c.ha_cultivo]
        );
      }
    }

    await client.query("COMMIT");
    return lote;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// Listar lotes (opcional por campo)
async function findAll({ campo_id } = {}) {
  let query = `
    SELECT id, campo_id, nombre, superficie, observaciones, created_at, activo
    FROM lotes
    WHERE activo = true
  `;
  const params = [];

  if (campo_id) {
    params.push(campo_id);
    query += ` AND campo_id = $${params.length}`;
  }

  query += ` ORDER BY id ASC`;

  const r = await db.query(query, params);
  return r.rows;
}

// Buscar lote por id
async function findById(id) {
  const r = await db.query(
    `SELECT id, campo_id, nombre, superficie, observaciones, created_at, activo
     FROM lotes
     WHERE id = $1`,
    [id]
  );

  return r.rows[0];
}

// Actualizar lote
async function update(id, { nombre, superficie, observaciones }) {
  const r = await db.query(
    `UPDATE lotes
     SET nombre = $2,
         superficie = $3,
         observaciones = $4
     WHERE id = $1
     RETURNING id, campo_id, nombre, superficie, observaciones, created_at, activo`,
    [id, nombre, superficie, observaciones ?? null]
  );

  return r.rows[0];
}

// Borrado lógico
async function softDelete(id) {
  const r = await db.query(
    `UPDATE lotes
     SET activo = false
     WHERE id = $1
     RETURNING id, campo_id, nombre, superficie, observaciones, created_at, activo`,
    [id]
  );

  return r.rows[0];
}

module.exports = {
  createLote,
  createLoteWithCultivos, // ✅ nuevo
  findAll,
  findById,
  update,
  softDelete,
};
