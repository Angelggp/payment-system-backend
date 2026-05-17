'use strict';

const Joi = require('joi');

/**
 * Fábrica de middleware de validación.
 * @param {Joi.ObjectSchema} schema - Esquema Joi para req.body
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const err = new Error('Datos de entrada inválidos');
      err.status = 422;
      err.details = error.details.map((d) => d.message);
      return next(err);
    }
    req.body = value;
    return next();
  };
}

module.exports = validate;
