// src/modules/lotes/lotes.repo.js
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

/**
 * ✅ Crear lote + insertar cultivos en lote_cultivos
 * sin usar db.connect(), todo en una sola query (CTE).
 *
 * cultivos: [{ cultivo_id, ha_cultivo }, ...]
 */
async function createLoteWithCultivos({ campo_id, nombre, superficie, observaciones, cultivos }) {
  // Si no hay cultivos, inserta solo el lote
  if (!Array.isArray(cultivos) || cultivos.length === 0) {
    return createLote({ campo_id, nombre, superficie, observaciones });
  }

  // Armamos arrays para unnest()
  const cultivoIds = cultivos.map((c) => Number(c.cultivo_id));
  const haCultivos = cultivos.map((c) => Number(c.ha_cultivo));

  const r = await db.query(
    `
    WITH lote AS (
      INSERT INTO lotes (campo_id, nombre, superficie, observaciones, activo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, campo_id, nombre, superficie, observaciones, created_at, activo
    ),
    ins AS (
      INSERT INTO lote_cultivos (lote_id, cultivo_id, ha_cultivo)
      SELECT
        lote.id,
        x.cultivo_id,
        x.ha_cultivo
      FROM lote
      JOIN unnest($5::int[], $6::numeric[]) AS x(cultivo_id, ha_cultivo)
        ON true
      RETURNING 1
    )
    SELECT * FROM lote;
    `,
    [campo_id, nombre, superficie, observaciones ?? null, cultivoIds, haCultivos]
  );

  return r.rows[0];
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
  return r.rows[0] || null;
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
  return r.rows[0] || null;
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
  return r.rows[0] || null;
}

module.exports = {
  createLote,
  createLoteWithCultivos, // ✅ ahora funciona sin db.connect()
  findAll,
  findById,
  update,
  softDelete,
};
