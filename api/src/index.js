'use strict';

require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const usuariosRoutes = require('./routes/usuarios.routes');
const tarjetasRoutes = require('./routes/tarjetas.routes');
const pagosRoutes = require('./routes/pagos.routes');
const { historialPagos } = require('./controllers/pagos.controller');

const app = express();
const PORT = parseInt(process.env.API_PORT || '3000', 10);

// ── Middleware global ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Swagger UI ───────────────────────────────────────────────────────
const swaggerDoc = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customSiteTitle: 'Payments API Docs',
}));

// ── Health check ─────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── Rutas API ────────────────────────────────────────────────────────
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/usuarios/:id/tarjetas', tarjetasRoutes);
app.get('/api/usuarios/:id/pagos', historialPagos);
app.use('/api/pagos', pagosRoutes);

// ── 404 ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
  console.log(`[API] Documentación Swagger: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
