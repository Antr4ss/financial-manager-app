import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware para verificar el token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token de acceso requerido',
          details: 'Debes proporcionar un token de autenticación'
        }
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          details: 'El token es válido pero el usuario no existe'
        }
      });
    }

    // Agregar el usuario al objeto request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido',
          details: 'El token proporcionado no es válido'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado',
          details: 'El token ha expirado, por favor inicia sesión nuevamente'
        }
      });
    }

    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error procesando la autenticación'
      }
    });
  }
};

/**
 * Middleware opcional para verificar el token (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    next();
  }
};

export {
  authenticateToken,
  optionalAuth
};
