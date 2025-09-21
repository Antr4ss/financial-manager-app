import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

/**
 * Genera un token JWT para el usuario
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          details: errors.array()
        }
      });
    }

    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'El usuario ya existe',
          details: 'Ya existe una cuenta con este email'
        }
      });
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id);

    // Actualizar último login
    await user.updateLastLogin();

    // Establecer cookie para autenticación en vistas
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error procesando el registro'
      }
    });
  }
};

/**
 * @desc    Iniciar sesión
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email (incluyendo password)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Credenciales inválidas',
          details: 'Email o contraseña incorrectos'
        }
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Cuenta desactivada',
          details: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
        }
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Credenciales inválidas',
          details: 'Email o contraseña incorrectos'
        }
      });
    }

    // Generar token
    const token = generateToken(user._id);

    // Actualizar último login
    await user.updateLastLogin();

    // Establecer cookie para autenticación en vistas
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error procesando el inicio de sesión'
      }
    });
  }
};

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo el perfil del usuario'
      }
    });
  }
};

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          details: errors.array()
        }
      });
    }

    const { name, preferences } = req.body;
    const userId = req.user._id;

    // Actualizar usuario
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        name,
        preferences: { ...req.user.preferences, ...preferences }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          details: 'El usuario no existe'
        }
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error actualizando el perfil'
      }
    });
  }
};

/**
 * @desc    Cambiar contraseña
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          details: errors.array()
        }
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Obtener usuario con contraseña
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          details: 'El usuario no existe'
        }
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Contraseña actual incorrecta',
          details: 'La contraseña actual no es correcta'
        }
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error actualizando la contraseña'
      }
    });
  }
};

/**
 * @desc    Cerrar sesión (opcional - principalmente para logging)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Limpiar cookie del servidor
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error cerrando la sesión'
      }
    });
  }
};

export {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};
