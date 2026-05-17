'use strict';

const { Router } = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { crearUsuario, obtenerUsuario } = require('../controllers/usuarios.controller');

const router = Router();

const crearUsuarioSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
});

router.post('/', validate(crearUsuarioSchema), crearUsuario);
router.get('/:id', obtenerUsuario);

module.exports = router;
