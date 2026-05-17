'use strict';

const axios = require('axios');
const pool = require('../config/db');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8000';

// POST /api/pagos
async function crearPago(req, res, next) {
  try {
    const { usuario_id, tarjeta_id, monto, moneda = 'USD', descripcion } = req.body;

    // Verificar usuario
    const usuario = await pool.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (!usuario.rows.length) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      return next(err);
    }

    // Verificar que la tarjeta pertenezca al usuario
    const tarjeta = await pool.query(
      'SELECT id FROM tarjetas WHERE id = $1 AND usuario_id = $2',
      [tarjeta_id, usuario_id],
    );
    if (!tarjeta.rows.length) {
      const err = new Error('Tarjeta no encontrada o no pertenece al usuario');
      err.status = 404;
      return next(err);
    }

    // Llamar al servicio Python de procesamiento
    let paymentResult;
    try {
      const { data } = await axios.post(`${PAYMENT_SERVICE_URL}/process-payment`, {
        amount: monto,
        currency: moneda,
        description: descripcion,
      });
      paymentResult = data;
    } catch (serviceErr) {
      const err = new Error('El servicio de procesamiento de pagos no está disponible');
      err.status = 503;
      return next(err);
    }

    const estado = paymentResult.approved ? 'aprobado' : 'rechazado';

    // Persistir el pago
    const { rows } = await pool.query(
      `INSERT INTO pagos (usuario_id, tarjeta_id, monto, moneda, estado, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, usuario_id, tarjeta_id, monto, moneda, estado, descripcion, created_at`,
      [usuario_id, tarjeta_id, monto, moneda, estado, descripcion],
    );

    const statusCode = paymentResult.approved ? 201 : 200;
    return res.status(statusCode).json({
      success: true,
      data: rows[0],
      processor: {
        approved: paymentResult.approved,
        message: paymentResult.message,
        processed_at: paymentResult.processed_at,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/usuarios/:id/pagos
async function historialPagos(req, res, next) {
  try {
    const { id: usuario_id } = req.params;
    const { estado, limit = 20, offset = 0 } = req.query;

    const usuario = await pool.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (!usuario.rows.length) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      return next(err);
    }

    const values = [usuario_id];
    let estadoFilter = '';
    if (estado) {
      values.push(estado);
      estadoFilter = `AND p.estado = $${values.length}`;
    }

    values.push(parseInt(limit, 10) || 20);
    values.push(parseInt(offset, 10) || 0);

    const { rows } = await pool.query(
      `SELECT
         p.id,
         p.monto,
         p.moneda,
         p.estado,
         p.descripcion,
         p.created_at,
         json_build_object(
           'id', t.id,
           'marca', t.marca,
           'ultimos_cuatro', t.ultimos_cuatro,
           'titular', t.titular
         ) AS tarjeta
       FROM pagos p
       JOIN tarjetas t ON t.id = p.tarjeta_id
       WHERE p.usuario_id = $1 ${estadoFilter}
       ORDER BY p.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );

    return res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = { crearPago, historialPagos };
