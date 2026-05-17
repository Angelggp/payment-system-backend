'use strict';

const pool = require('../config/db');

// POST /api/usuarios/:id/tarjetas
async function registrarTarjeta(req, res, next) {
  try {
    const { id: usuario_id } = req.params;

    // Verificar que el usuario exista
    const usuario = await pool.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (!usuario.rows.length) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      return next(err);
    }

    const { titular, numero_tarjeta, marca, mes_expiracion, anio_expiracion } = req.body;

    // Solo persistimos los últimos 4 dígitos
    const ultimos_cuatro = String(numero_tarjeta).replace(/\s/g, '').slice(-4);

    const { rows } = await pool.query(
      `INSERT INTO tarjetas (usuario_id, titular, ultimos_cuatro, marca, mes_expiracion, anio_expiracion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, usuario_id, titular, ultimos_cuatro, marca, mes_expiracion, anio_expiracion, created_at`,
      [usuario_id, titular, ultimos_cuatro, marca, mes_expiracion, anio_expiracion],
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    return next(err);
  }
}

// GET /api/usuarios/:id/tarjetas
async function listarTarjetas(req, res, next) {
  try {
    const { id: usuario_id } = req.params;

    const usuario = await pool.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (!usuario.rows.length) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      return next(err);
    }

    const { rows } = await pool.query(
      `SELECT id, usuario_id, titular, ultimos_cuatro, marca, mes_expiracion, anio_expiracion, created_at
       FROM tarjetas
       WHERE usuario_id = $1
       ORDER BY created_at DESC`,
      [usuario_id],
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = { registrarTarjeta, listarTarjetas };
