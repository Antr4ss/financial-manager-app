/**
 * Middleware para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Error de validación',
        details: 'Los datos proporcionados no son válidos',
        validationErrors: errors
      }
    });
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        message: 'Dato duplicado',
        details: `El ${field} ya existe en el sistema`
      }
    });
  }

  // Error de ObjectId inválido
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'ID inválido',
        details: 'El ID proporcionado no es válido'
      }
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token inválido',
        details: 'El token proporcionado no es válido'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expirado',
        details: 'El token ha expirado, por favor inicia sesión nuevamente'
      }
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Error interno del servidor',
      details: process.env.NODE_ENV === 'production' 
        ? 'Ha ocurrido un error interno' 
        : err.stack
    }
  });
};

export default errorHandler;