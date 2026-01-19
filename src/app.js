// src/app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { errorHandler, notFound } = require("./middlewares/errorHandler");

const authRoutes = require("./modules/auth/auth.routes");
const camposRoutes = require("./modules/campos/campos.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, message: "Backend funcionando 🚀" }));

app.use("/auth", authRoutes);     // login, etc.
app.use("/campos", camposRoutes); // módulo campos

app.use(notFound);
app.use(errorHandler);

module.exports = app;
