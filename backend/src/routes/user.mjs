import express from 'express';
import { body, query } from 'express-validator';
import {
  getDashboard,
  getFinancialReport,
  getSettings,
  updateSettings
} from '../controllers/userController.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * /api/users/dashboard:
 *   get:
 *     summary: Obtener dashboard del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del filtro
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del filtro
 *     responses:
 *       200:
 *         description: Dashboard obtenido exitosamente
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                         totalExpense:
 *                           type: number
 *                         balance:
 *                           type: number
 *                         period:
 *                           type: object
 *                           properties:
 *                             startDate:
 *                               type: string
 *                               format: date-time
 *                             endDate:
 *                               type: string
 *                               format: date-time
 *                     incomeByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           total:
 *                             type: number
 *                           count:
 *                             type: integer
 *                     expenseByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           total:
 *                             type: number
 *                           count:
 *                             type: integer
 *                     recentIncomes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Income'
 *                     recentExpenses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Expense'
 *                     monthlyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           income:
 *                             type: number
 *                           expense:
 *                             type: number
 *                           balance:
 *                             type: number
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/dashboard', [
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio debe ser válida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin debe ser válida')
], getDashboard);

/**
 * @swagger
 * /api/users/report:
 *   get:
 *     summary: Obtener reporte financiero
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del reporte
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del reporte
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Formato del reporte
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
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
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         days:
 *                           type: integer
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                         totalExpense:
 *                           type: number
 *                         balance:
 *                           type: number
 *                         averageDailyIncome:
 *                           type: number
 *                         averageDailyExpense:
 *                           type: number
 *                     incomeByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           total:
 *                             type: number
 *                           count:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *                     expenseByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           total:
 *                             type: number
 *                           count:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *                     essentialExpenses:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         count:
 *                           type: integer
 *                         percentage:
 *                           type: number
 *                     nonEssentialExpenses:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         count:
 *                           type: integer
 *                         percentage:
 *                           type: number
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         incomes:
 *                           type: integer
 *                         expenses:
 *                           type: integer
 *       400:
 *         description: Fechas requeridas
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/report', [
  query('startDate').isISO8601().withMessage('Fecha de inicio debe ser válida'),
  query('endDate').isISO8601().withMessage('Fecha de fin debe ser válida'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Formato debe ser json o csv')
], getFinancialReport);

/**
 * @swagger
 * /api/users/settings:
 *   get:
 *     summary: Obtener configuración del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
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
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         currency:
 *                           type: string
 *                           enum: [USD, EUR, MXN, COP, ARS, BRL]
 *                         language:
 *                           type: string
 *                           enum: [es, en, pt]
 *                         notifications:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: boolean
 *                             push:
 *                               type: boolean
 *                     profile:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                         lastLogin:
 *                           type: string
 *                           format: date-time
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/settings', getSettings);

/**
 * @swagger
 * /api/users/settings:
 *   put:
 *     summary: Actualizar configuración del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   currency:
 *                     type: string
 *                     enum: [USD, EUR, MXN, COP, ARS, BRL]
 *                     example: "USD"
 *                   language:
 *                     type: string
 *                     enum: [es, en, pt]
 *                     example: "es"
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: boolean
 *                         example: true
 *                       push:
 *                         type: boolean
 *                         example: false
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         currency:
 *                           type: string
 *                         language:
 *                           type: string
 *                         notifications:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: boolean
 *                             push:
 *                               type: boolean
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/settings', [
  body('preferences.currency')
    .optional()
    .isIn(['COP'])
    .withMessage('Moneda no válida. Solo se permite COP (Peso Colombiano)'),
  body('preferences.language')
    .optional()
    .isIn(['es'])
    .withMessage('Idioma no válido. Solo se permite Español (es)'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Notificación de email debe ser un booleano'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Notificación push debe ser un booleano')
], updateSettings);

export default router;
