'use strict';

const { Router } = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { registrarTarjeta, listarTarjetas } = require('../controllers/tarjetas.controller');

const router = Router({ mergeParams: true });

const registrarTarjetaSchema = Joi.object({
  titular: Joi.string().trim().min(2).max(100).required(),
  // Aceptamos el número completo para extraer los últimos 4 dígitos, nunca se persiste
  numero_tarjeta: Joi.string()
    .pattern(/^\d{13,19}$/)
    .required()
    .messages({ 'string.pattern.base': 'numero_tarjeta debe tener entre 13 y 19 dígitos' }),
  marca: Joi.string().valid('visa', 'mastercard', 'amex', 'discover').required(),
  mes_expiracion: Joi.number().integer().min(1).max(12).required(),
  anio_expiracion: Joi.number().integer().min(2024).required(),
});

router.post('/', validate(registrarTarjetaSchema), registrarTarjeta);
router.get('/', listarTarjetas);

module.exports = router;
