import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  handleValidationErrors, 
  userValidations, 
  customValidations 
} from '../middleware/validation.js';
import { 
  sanitizeInput, 
  sanitizeEmail, 
  preventInjection, 
  limitDataSize, 
  validateContentType 
} from '../middleware/sanitization.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           description: Email del usuario
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Rol del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado activo del usuario
 *         preferences:
 *           type: object
 *           properties:
 *             currency:
 *               type: string
 *               enum: [USD, EUR, MXN, COP, ARS, BRL]
 *             language:
 *               type: string
 *               enum: [es, en, pt]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: JWT token
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@ejemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos de entrada inválidos o usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', [
  validateContentType(['application/json']),
  limitDataSize(1024), // 1KB para registro
  preventInjection,
  sanitizeInput,
  sanitizeEmail,
  userValidations.name,
  userValidations.email,
  userValidations.password,
  customValidations.uniqueEmail('email'),
  handleValidationErrors
], register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@ejemplo.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', [
  validateContentType(['application/json']),
  limitDataSize(512), // 512 bytes para login
  preventInjection,
  sanitizeInput,
  sanitizeEmail,
  userValidations.email,
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  customValidations.existingEmail('email'),
  handleValidationErrors
], login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/me', authenticateToken, getMe);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Juan Carlos Pérez"
 *               preferences:
 *                 type: object
 *                 properties:
 *                   currency:
 *                     type: string
 *                     enum: [USD, EUR, MXN, COP, ARS, BRL]
 *                   language:
 *                     type: string
 *                     enum: [es, en, pt]
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('preferences.currency')
    .optional()
    .isIn(['USD', 'EUR', 'MXN', 'COP', 'ARS', 'BRL'])
    .withMessage('Moneda no válida'),
  body('preferences.language')
    .optional()
    .isIn(['es', 'en', 'pt'])
    .withMessage('Idioma no válido')
], updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "password123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Contraseña actual incorrecta o datos inválidos
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], changePassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/logout', authenticateToken, logout);

export default router;
