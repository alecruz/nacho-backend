const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../db");

async function login(req, res) {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ ok: false, error: "usuario y password son obligatorios" });
  }

  const result = await db.query(
    `SELECT id, cliente_id, usuario, password_hash, rol, activo
     FROM usuarios
     WHERE usuario = $1`,
    [usuario]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
  }

  const user = result.rows[0];
  if (user.activo === false) {
    return res.status(403).json({ ok: false, error: "Usuario deshabilitado" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { id: user.id, cliente_id: user.cliente_id, rol: user.rol, usuario: user.usuario },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return res.json({
    ok: true,
    message: "Login exitoso",
    token,
    user: { id: user.id, cliente_id: user.cliente_id, rol: user.rol, usuario: user.usuario },
  });
}

module.exports = { login };
