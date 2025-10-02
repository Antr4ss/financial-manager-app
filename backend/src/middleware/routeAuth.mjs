import jwt from 'jsonwebtoken';

/**
 * Middleware para proteger rutas específicas
 * Verifica autenticación tanto por cookies como por headers
 */
const protectRoute = (req, res, next) => {
  try {
    // Obtener token de cookies o headers
    const token = (req.cookies && req.cookies.token) || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Acceso no autorizado',
          details: 'Se requiere autenticación para acceder a este recurso'
        }
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el token no esté expirado
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado',
          details: 'El token ha expirado, por favor inicia sesión nuevamente'
        }
      });
    }
    
    // Agregar información del usuario al request
    req.user = { id: decoded.userId };
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

    console.error('Error en middleware de protección de ruta:', error);
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
 * Middleware para proteger rutas de administración
 * Requiere autenticación y rol de administrador
 */
const protectAdminRoute = async (req, res, next) => {
  try {
    // Primero verificar autenticación básica
    const token = (req.cookies && req.cookies.token) || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Acceso no autorizado',
          details: 'Se requiere autenticación para acceder a este recurso'
        }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado',
          details: 'El token ha expirado, por favor inicia sesión nuevamente'
        }
      });
    }
    
    // Verificar rol de administrador
    const { default: User } = await import('../models/User.mjs');
    const user = await User.findById(decoded.userId).select('role');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Acceso denegado',
          details: 'Se requieren permisos de administrador para acceder a este recurso'
        }
      });
    }
    
    req.user = { id: decoded.userId, role: user.role };
    next();
  } catch (error) {
    console.error('Error en middleware de administración:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error procesando la autenticación de administrador'
      }
    });
  }
};

/**
 * Middleware para verificar autenticación opcional
 * No falla si no hay token, pero agrega información del usuario si existe
 */
const optionalRouteAuth = (req, res, next) => {
  try {
    const token = (req.cookies && req.cookies.token) || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.exp && decoded.exp >= Date.now() / 1000) {
        req.user = { id: decoded.userId };
        req.isAuthenticated = true;
      } else {
        req.user = null;
        req.isAuthenticated = false;
      }
    } else {
      req.user = null;
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

export {
  protectRoute,
  protectAdminRoute,
  optionalRouteAuth
};
