// src/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// -----------------------------
// Rutas de prueba
// -----------------------------
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend funcionando 🚀" });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (error) {
    console.error("Error probando la DB:", error);
    res.status(500).json({ ok: false, error: "Error probando la base de datos" });
  }
});

// -----------------------------
// AUTH helpers (JWT)
// -----------------------------
function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ ok: false, error: "Token no proporcionado" });
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, error: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, cliente_id, rol, usuario, iat, exp }
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: "Token inválido o expirado" });
  }
}

function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.user?.rol;
    if (!rol) return res.status(403).json({ ok: false, error: "Rol no disponible" });
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ ok: false, error: "Sin permisos" });
    }
    next();
  };
}

// -----------------------------
// LOGIN (usuario + password)
// -----------------------------
app.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "usuario y password son obligatorios" });
    }

    // Buscar por username (único global)
    const result = await db.query(
      `SELECT id, cliente_id, usuario, password_hash, rol, activo
       FROM usuarios
       WHERE usuario = $1`,
      [usuario]
    );

    if (result.rows.length === 0) {
      // No revelamos si el usuario existe o no (buena práctica)
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    if (user.activo === false) {
      return res.status(403).json({ ok: false, error: "Usuario deshabilitado" });
    }

    // Comparar password con hash
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
    }

    // Firmar token
    const token = jwt.sign(
      {
        id: user.id,
        cliente_id: user.cliente_id,
        rol: user.rol,
        usuario: user.usuario,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      ok: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        cliente_id: user.cliente_id,
        rol: user.rol,
        usuario: user.usuario,
      },
    });
  } catch (error) {
    console.error("Error en /login:", error);
    return res.status(500).json({ ok: false, error: "Error interno en el login" });
  }
});

// -----------------------------
// Ejemplo de ruta protegida (para probar token)
// -----------------------------
app.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Ejemplo de ruta protegida solo ADMIN (para probar roles)
app.get("/admin-only", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ ok: true, message: "Sos ADMIN ✅" });
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
