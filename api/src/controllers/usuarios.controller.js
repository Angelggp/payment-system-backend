'use strict';

const pool = require('../config/db');

// POST /api/usuarios
async function crearUsuario(req, res, next) {
  try {
    const { nombre, email } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email)
       VALUES ($1, $2)
       RETURNING id, nombre, email, created_at`,
      [nombre, email],
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      err.status = 409;
      err.message = 'El email ya está registrado';
    }
    return next(err);
  }
}

// GET /api/usuarios/:id
async function obtenerUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1',
      [id],
    );
    if (!rows.length) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      return next(err);
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return next(err);
  }
}

module.exports = { crearUsuario, obtenerUsuario };
