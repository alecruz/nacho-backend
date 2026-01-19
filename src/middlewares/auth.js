const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ ok: false, error: "Token no proporcionado" });

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, error: "Formato de token inválido" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Token inválido o expirado" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const rol = req.user?.rol;
    if (!rol) return res.status(403).json({ ok: false, error: "Rol no disponible" });
    if (!roles.includes(rol)) return res.status(403).json({ ok: false, error: "Sin permisos" });
    next();
  };
}

module.exports = { requireAuth, requireRole };
