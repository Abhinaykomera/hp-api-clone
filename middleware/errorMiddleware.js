/**
 * middleware/errorMiddleware.js
 *
 * Re-usable error utilities.
 *
 * Usage in a controller:
 *   const err = new AppError('Resource not found', 404);
 *   return next(err);
 *
 * The global error handler in app.js will catch it and
 * send a standardised JSON response.
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
