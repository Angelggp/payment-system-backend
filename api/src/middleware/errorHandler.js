'use strict';

/**
 * Middleware global de manejo de errores.
 * Devuelve siempre la misma estructura JSON para facilitar el consumo del cliente.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${message}`, err.stack);
  }

  return res.status(status).json({
    success: false,
    error: message,
    ...(err.details && { details: err.details }),
  });
}

module.exports = errorHandler;
