import express from 'express';
import { body, query } from 'express-validator';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del gasto
 *         user:
 *           type: string
 *           description: ID del usuario propietario
 *         description:
 *           type: string
 *           description: Descripción del gasto
 *         amount:
 *           type: number
 *           description: Monto del gasto
 *         category:
 *           type: string
 *           enum: [alimentacion, transporte, vivienda, servicios, salud, educacion, entretenimiento, ropa, tecnologia, deudas, ahorro, inversion, impuestos, seguros, mantenimiento, otros]
 *           description: Categoría del gasto
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha del gasto
 *         paymentMethod:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia, cheque, crypto, otros]
 *           description: Método de pago
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         isRecurring:
 *           type: boolean
 *           description: Si es un gasto recurrente
 *         recurringFrequency:
 *           type: string
 *           enum: [semanal, quincenal, mensual, trimestral, anual]
 *           description: Frecuencia de recurrencia
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags del gasto
 *         isEssential:
 *           type: boolean
 *           description: Si es un gasto esencial
 *         isActive:
 *           type: boolean
 *           description: Estado activo del gasto
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Obtener todos los gastos del usuario
 *     tags: [Gastos]
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
 *         description: Lista de gastos obtenida exitosamente
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
 *                     expenses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Expense'
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
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
  query('category').optional().isIn(['alimentacion', 'transporte', 'vivienda', 'servicios', 'salud', 'educacion', 'entretenimiento', 'ropa', 'tecnologia', 'deudas', 'ahorro', 'inversion', 'impuestos', 'seguros', 'mantenimiento', 'otros']).withMessage('Categoría no válida'),
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio debe ser válida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin debe ser válida'),
  query('sortBy').optional().isIn(['date', 'amount', 'description']).withMessage('Campo de ordenamiento no válido'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Orden de clasificación no válido'),
  query('isEssential').optional().isBoolean().withMessage('isEssential debe ser un valor booleano')
], getExpenses);

/**
 * @swagger
 * /api/expenses/stats:
 *   get:
 *     summary: Obtener estadísticas de gastos
 *     tags: [Gastos]
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
 *                       description: Total de gastos
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
 *                             description: Cantidad de gastos por categoría
 *                     essentialStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: boolean
 *                             description: Si es esencial o no
 *                           total:
 *                             type: number
 *                             description: Total por tipo
 *                           count:
 *                             type: integer
 *                             description: Cantidad por tipo
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', [
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio debe ser válida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin debe ser válida')
], getExpenseStats);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Obtener un gasto por ID
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Gasto obtenido exitosamente
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
 *                     expense:
 *                       $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getExpenseById);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Crear nuevo gasto
 *     tags: [Gastos]
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
 *                 example: "Compra de supermercado"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999999.99
 *                 example: 150.50
 *               category:
 *                 type: string
 *                 enum: [alimentacion, transporte, vivienda, servicios, salud, educacion, entretenimiento, ropa, tecnologia, deudas, ahorro, inversion, impuestos, seguros, mantenimiento, otros]
 *                 example: "alimentacion"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T00:00:00.000Z"
 *               paymentMethod:
 *                 type: string
 *                 enum: [efectivo, tarjeta, transferencia, cheque, crypto, otros]
 *                 example: "tarjeta"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Compra semanal"
 *               isRecurring:
 *                 type: boolean
 *                 example: true
 *               recurringFrequency:
 *                 type: string
 *                 enum: [semanal, quincenal, mensual, trimestral, anual]
 *                 example: "semanal"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["supermercado", "comida"]
 *               isEssential:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
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
 *                     expense:
 *                       $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', [
  body('description')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('La descripción debe tener entre 3 y 200 caracteres'),
  body('amount')
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('El monto debe ser un número entre 0.01 y 999,999,999.99'),
  body('category')
    .isIn(['alimentacion', 'transporte', 'vivienda', 'servicios', 'salud', 'educacion', 'entretenimiento', 'ropa', 'tecnologia', 'deudas', 'ahorro', 'inversion', 'impuestos', 'seguros', 'mantenimiento', 'otros'])
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
    .withMessage('Cada tag no puede exceder 20 caracteres'),
  body('isEssential')
    .optional()
    .isBoolean()
    .withMessage('isEssential debe ser un booleano')
], createExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Actualizar gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del gasto
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
 *                 example: "Compra de supermercado actualizada"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999999.99
 *                 example: 175.75
 *               category:
 *                 type: string
 *                 enum: [alimentacion, transporte, vivienda, servicios, salud, educacion, entretenimiento, ropa, tecnologia, deudas, ahorro, inversion, impuestos, seguros, mantenimiento, otros]
 *                 example: "alimentacion"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T00:00:00.000Z"
 *               paymentMethod:
 *                 type: string
 *                 enum: [efectivo, tarjeta, transferencia, cheque, crypto, otros]
 *                 example: "tarjeta"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Compra semanal actualizada"
 *               isRecurring:
 *                 type: boolean
 *                 example: true
 *               recurringFrequency:
 *                 type: string
 *                 enum: [semanal, quincenal, mensual, trimestral, anual]
 *                 example: "semanal"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["supermercado", "comida", "actualizado"]
 *               isEssential:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Gasto actualizado exitosamente
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
 *                     expense:
 *                       $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Gasto no encontrado
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
    .isIn(['alimentacion', 'transporte', 'vivienda', 'servicios', 'salud', 'educacion', 'entretenimiento', 'ropa', 'tecnologia', 'deudas', 'ahorro', 'inversion', 'impuestos', 'seguros', 'mantenimiento', 'otros'])
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
    .withMessage('Cada tag no puede exceder 20 caracteres'),
  body('isEssential')
    .optional()
    .isBoolean()
    .withMessage('isEssential debe ser un booleano')
], updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Eliminar gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Gasto eliminado exitosamente
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
 *         description: Gasto no encontrado
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', deleteExpense);

export default router;
