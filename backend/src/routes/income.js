import express from 'express';
import { body, query } from 'express-validator';
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
} from '../controllers/incomeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  handleValidationErrors, 
  transactionValidations, 
  incomeValidations, 
  queryValidations, 
  paramValidations 
} from '../middleware/validation.js';
import { 
  sanitizeInput, 
  sanitizeDescription, 
  sanitizeNotes, 
  sanitizeTags, 
  sanitizeDate, 
  sanitizeNumericFields, 
  sanitizeBooleanFields, 
  sanitizeQueryParams, 
  preventInjection, 
  limitDataSize, 
  validateContentType 
} from '../middleware/sanitization.js';
import { 
  validateUserAccess, 
  validateTransactionLimits, 
  validateFinancialConsistency, 
  validateUserPlanLimits, 
  validateDataIntegrity, 
  validateActiveUser 
} from '../middleware/businessValidation.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Income:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del ingreso
 *         user:
 *           type: string
 *           description: ID del usuario propietario
 *         description:
 *           type: string
 *           description: Descripción del ingreso
 *         amount:
 *           type: number
 *           description: Monto del ingreso
 *         category:
 *           type: string
 *           enum: [salario, ventas, inversiones, freelance, bonos, comisiones, alquiler, intereses, dividendos, reembolsos, regalos, otros]
 *           description: Categoría del ingreso
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha del ingreso
 *         paymentMethod:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia, cheque, crypto, otros]
 *           description: Método de pago
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         isRecurring:
 *           type: boolean
 *           description: Si es un ingreso recurrente
 *         recurringFrequency:
 *           type: string
 *           enum: [semanal, quincenal, mensual, trimestral, anual]
 *           description: Frecuencia de recurrencia
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags del ingreso
 *         isActive:
 *           type: boolean
 *           description: Estado activo del ingreso
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/incomes:
 *   get:
 *     summary: Obtener todos los ingresos del usuario
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, description]
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de ingresos obtenida exitosamente
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
 *                     incomes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Income'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', [
  sanitizeQueryParams,
  queryValidations.page,
  queryValidations.limit,
  queryValidations.startDate,
  queryValidations.endDate,
  queryValidations.sortBy,
  queryValidations.sortOrder,
  body('category').optional().isIn(['salario', 'ventas', 'inversiones', 'freelance', 'bonos', 'comisiones', 'alquiler', 'intereses', 'dividendos', 'reembolsos', 'regalos', 'otros']).withMessage('Categoría no válida'),
  validateActiveUser,
  handleValidationErrors
], getIncomes);

/**
 * @swagger
 * /api/incomes/stats:
 *   get:
 *     summary: Obtener estadísticas de ingresos
 *     tags: [Ingresos]
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
 *         description: Estadísticas obtenidas exitosamente
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
 *                     total:
 *                       type: number
 *                       description: Total de ingresos
 *                     monthlyTotal:
 *                       type: number
 *                       description: Total del mes actual
 *                     lastMonthTotal:
 *                       type: number
 *                       description: Total del mes anterior
 *                     growthPercentage:
 *                       type: number
 *                       description: Porcentaje de crecimiento
 *                     categoryStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Categoría
 *                           total:
 *                             type: number
 *                             description: Total por categoría
 *                           count:
 *                             type: integer
 *                             description: Cantidad de ingresos por categoría
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', [
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio debe ser válida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin debe ser válida')
], getIncomeStats);

/**
 * @swagger
 * /api/incomes/{id}:
 *   get:
 *     summary: Obtener un ingreso por ID
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ingreso
 *     responses:
 *       200:
 *         description: Ingreso obtenido exitosamente
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
 *                     income:
 *                       $ref: '#/components/schemas/Income'
 *       404:
 *         description: Ingreso no encontrado
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', [
  paramValidations.id,
  validateUserAccess('income'),
  handleValidationErrors
], getIncomeById);

/**
 * @swagger
 * /api/incomes:
 *   post:
 *     summary: Crear nuevo ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - amount
 *               - category
 *             properties:
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Salario mensual"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999999.99
 *                 example: 2500.00
 *               category:
 *                 type: string
 *                 enum: [salario, ventas, inversiones, freelance, bonos, comisiones, alquiler, intereses, dividendos, reembolsos, regalos, otros]
 *                 example: "salario"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T00:00:00.000Z"
 *               paymentMethod:
 *                 type: string
 *                 enum: [efectivo, tarjeta, transferencia, cheque, crypto, otros]
 *                 example: "transferencia"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Pago por nómina"
 *               isRecurring:
 *                 type: boolean
 *                 example: true
 *               recurringFrequency:
 *                 type: string
 *                 enum: [semanal, quincenal, mensual, trimestral, anual]
 *                 example: "mensual"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["trabajo", "nómina"]
 *     responses:
 *       201:
 *         description: Ingreso creado exitosamente
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
 *                     income:
 *                       $ref: '#/components/schemas/Income'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', [
  validateContentType(['application/json']),
  limitDataSize(2048), // 2KB para crear ingreso
  preventInjection,
  sanitizeInput,
  sanitizeDescription,
  sanitizeNotes,
  sanitizeTags,
  sanitizeDate,
  ...sanitizeNumericFields(['amount']),
  ...sanitizeBooleanFields(['isRecurring']),
  transactionValidations.description,
  transactionValidations.amount,
  transactionValidations.date,
  transactionValidations.paymentMethod,
  transactionValidations.notes,
  transactionValidations.tags,
  transactionValidations.tagItem,
  incomeValidations.category,
  incomeValidations.isRecurring,
  incomeValidations.recurringFrequency,
  validateActiveUser,
  validateTransactionLimits,
  validateFinancialConsistency,
  validateUserPlanLimits,
  validateDataIntegrity,
  handleValidationErrors
], createIncome);

/**
 * @swagger
 * /api/incomes/{id}:
 *   put:
 *     summary: Actualizar ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ingreso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Salario mensual actualizado"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999999.99
 *                 example: 3000.00
 *               category:
 *                 type: string
 *                 enum: [salario, ventas, inversiones, freelance, bonos, comisiones, alquiler, intereses, dividendos, reembolsos, regalos, otros]
 *                 example: "salario"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T00:00:00.000Z"
 *               paymentMethod:
 *                 type: string
 *                 enum: [efectivo, tarjeta, transferencia, cheque, crypto, otros]
 *                 example: "transferencia"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Pago por nómina actualizado"
 *               isRecurring:
 *                 type: boolean
 *                 example: true
 *               recurringFrequency:
 *                 type: string
 *                 enum: [semanal, quincenal, mensual, trimestral, anual]
 *                 example: "mensual"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["trabajo", "nómina", "actualizado"]
 *     responses:
 *       200:
 *         description: Ingreso actualizado exitosamente
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
 *                     income:
 *                       $ref: '#/components/schemas/Income'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Ingreso no encontrado
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('La descripción debe tener entre 3 y 200 caracteres'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('El monto debe ser un número entre 0.01 y 999,999,999.99'),
  body('category')
    .optional()
    .isIn(['salario', 'ventas', 'inversiones', 'freelance', 'bonos', 'comisiones', 'alquiler', 'intereses', 'dividendos', 'reembolsos', 'regalos', 'otros'])
    .withMessage('Categoría no válida'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  body('paymentMethod')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia', 'cheque', 'crypto', 'otros'])
    .withMessage('Método de pago no válido'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring debe ser un booleano'),
  body('recurringFrequency')
    .optional()
    .isIn(['semanal', 'quincenal', 'mensual', 'trimestral', 'anual'])
    .withMessage('Frecuencia de recurrencia no válida'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  body('tags.*')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Cada tag no puede exceder 20 caracteres')
], updateIncome);

/**
 * @swagger
 * /api/incomes/{id}:
 *   delete:
 *     summary: Eliminar ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ingreso
 *     responses:
 *       200:
 *         description: Ingreso eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Ingreso no encontrado
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', deleteIncome);

export default router;
