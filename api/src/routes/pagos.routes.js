'use strict';

const { Router } = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { crearPago, historialPagos } = require('../controllers/pagos.controller');

const router = Router();

const crearPagoSchema = Joi.object({
  usuario_id: Joi.string().uuid().required(),
  tarjeta_id: Joi.string().uuid().required(),
  monto: Joi.number().positive().precision(2).required(),
  moneda: Joi.string().length(3).uppercase().default('USD'),
  descripcion: Joi.string().trim().max(255).optional(),
});

router.post('/', validate(crearPagoSchema), crearPago);

module.exports = router;
