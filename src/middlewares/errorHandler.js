function notFound(req, res) {
  res.status(404).json({ ok: false, error: "Ruta no encontrada" });
}

function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);
  res.status(500).json({ ok: false, error: "Error interno del servidor" });
}

module.exports = { errorHandler, notFound };
