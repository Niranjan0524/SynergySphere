/**
 * Global error handling middleware
 * This should be the last middleware in the Express app
 */

// Development error handler - provides detailed error information
const developmentErrorHandler = (err, req, res, next) => {
  const error = {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    status: err.status || 'error'
  };

  console.error('Development Error:', {
    error: error,
    requestUrl: req.originalUrl,
    requestMethod: req.method,
    requestHeaders: req.headers,
    requestBody: req.body,
    user: req.user ? { id: req.user.id, email: req.user.email } : null
  });

  res.status(error.statusCode).json({
    error: error.status,
    message: error.message,
    stack: error.stack,
    request: {
      url: req.originalUrl,
      method: req.method
    }
  });
};

// Production error handler - provides limited error information
const productionErrorHandler = (err, req, res, next) => {
  const error = {
    statusCode: err.statusCode || 500,
    status: err.status || 'error',
    message: err.isOperational ? err.message : 'Something went wrong'
  };

  // Log error details for debugging (but don't send to client)
  console.error('Production Error:', {
    error: err.message,
    stack: err.stack,
    statusCode: error.statusCode,
    requestUrl: req.originalUrl,
    requestMethod: req.method,
    user: req.user ? { id: req.user.id, email: req.user.email } : null,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  if (!err.isOperational) {
    error.message = 'Internal server error';
  }

  res.status(error.statusCode).json({
    error: error.status,
    message: error.message
  });
};

// Handle specific types of errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return createAppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'duplicate value';
  const message = `Duplicate field value: ${value}. Please use another value`;
  return createAppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return createAppError(message, 400);
};

const handleJWTError = () =>
  createAppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  createAppError('Your token has expired. Please log in again', 401);

// Create application error
const createAppError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  error.isOperational = true;
  return error;
};

// Main error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    developmentErrorHandler(err, req, res, next);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific database errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    productionErrorHandler(error, req, res, next);
  }
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  const error = createAppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(error);
};

// Async error handler wrapper
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Unhandled promise rejection handler
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Promise:', promise);
  // Close server gracefully
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  // Close server gracefully
  process.exit(1);
});

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  asyncErrorHandler,
  createAppError
};
