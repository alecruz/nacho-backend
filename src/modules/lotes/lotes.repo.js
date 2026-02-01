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
 * cultivos: [{ cultivo_id, ha_cultivo }, ...]
 */
async function createLoteWithCultivos({ campo_id, nombre, superficie, observaciones, cultivos }) {
  if (!Array.isArray(cultivos) || cultivos.length === 0) {
    return createLote({ campo_id, nombre, superficie, observaciones });
  }

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

/**
 * ✅ Listar lotes (opcional por campo) incluyendo cultivos asociados
 * Devuelve: [{..., cultivos: [{id, nombre, ha_cultivo}, ...]}]
 */
async function findAll({ campo_id } = {}) {
  const params = [];
  let where = `WHERE l.activo = true`;

  if (campo_id) {
    params.push(campo_id);
    where += ` AND l.campo_id = $${params.length}`;
  }

  const r = await db.query(
    `
    SELECT
      l.id,
      l.campo_id,
      l.nombre,
      l.superficie,
      l.observaciones,
      l.created_at,
      l.activo,
      COALESCE(
        json_agg(
          json_build_object(
            'id', c.id,
            'nombre', c.nombre,
            'ha_cultivo', lc.ha_cultivo
          )
        ) FILTER (WHERE lc.id IS NOT NULL),
        '[]'::json
      ) AS cultivos
    FROM lotes l
    LEFT JOIN lote_cultivos lc ON lc.lote_id = l.id
    LEFT JOIN cultivos c ON c.id = lc.cultivo_id
    ${where}
    GROUP BY l.id
    ORDER BY l.id ASC
    `,
    params
  );

  return r.rows;
}

/**
 * ✅ Buscar lote por id incluyendo cultivos
 */
async function findById(id) {
  const r = await db.query(
    `
    SELECT
      l.id,
      l.campo_id,
      l.nombre,
      l.superficie,
      l.observaciones,
      l.created_at,
      l.activo,
      COALESCE(
        json_agg(
          json_build_object(
            'id', c.id,
            'nombre', c.nombre,
            'ha_cultivo', lc.ha_cultivo
          )
        ) FILTER (WHERE lc.id IS NOT NULL),
        '[]'::json
      ) AS cultivos
    FROM lotes l
    LEFT JOIN lote_cultivos lc ON lc.lote_id = l.id
    LEFT JOIN cultivos c ON c.id = lc.cultivo_id
    WHERE l.id = $1
    GROUP BY l.id
    `,
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
  createLoteWithCultivos,
  findAll,
  findById,
  update,
  softDelete,
};
