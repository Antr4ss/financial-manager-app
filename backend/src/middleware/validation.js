import { validationResult, body, query, param } from 'express-validator';

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Datos de entrada inválidos',
        details: 'Por favor corrige los siguientes errores',
        validationErrors: formattedErrors
      }
    });
  }
  
  next();
};

/**
 * Validaciones comunes para campos de usuario
 */
const userValidations = {
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  email: body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder 100 caracteres'),

  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),

  currentPassword: body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  newPassword: body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('La nueva contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial')
};

/**
 * Validaciones comunes para transacciones financieras
 */
const transactionValidations = {
  description: body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('La descripción debe tener entre 1 y 200 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,()]+$/)
    .withMessage('La descripción contiene caracteres no válidos'),

  amount: body('amount')
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('El monto debe ser un número entre 0.01 y 999,999,999.99')
    .custom((value) => {
      // Verificar que no tenga más de 2 decimales
      if (value.toString().split('.')[1] && value.toString().split('.')[1].length > 2) {
        throw new Error('El monto no puede tener más de 2 decimales');
      }
      return true;
    }),

  date: body('date')
    .isISO8601()
    .withMessage('La fecha debe ser válida (formato ISO 8601)')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (date < oneYearAgo) {
        throw new Error('La fecha no puede ser anterior a un año');
      }
      if (date > oneYearFromNow) {
        throw new Error('La fecha no puede ser posterior a un año');
      }
      return true;
    }),

  paymentMethod: body('paymentMethod')
    .isIn(['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'cheque', 'crypto', 'otros'])
    .withMessage('Método de pago no válido'),

  notes: body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),

  tags: body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('No se pueden agregar más de 10 etiquetas'),

  tagItem: body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Cada etiqueta debe tener entre 1 y 20 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/)
    .withMessage('Las etiquetas solo pueden contener letras, números, espacios, guiones y guiones bajos')
};

/**
 * Validaciones específicas para ingresos
 */
const incomeValidations = {
  category: body('category')
    .isIn(['salario', 'ventas', 'inversiones', 'freelance', 'bonos', 'comisiones', 'alquiler', 'intereses', 'dividendos', 'reembolsos', 'regalos', 'otros'])
    .withMessage('Categoría de ingreso no válida'),

  isRecurring: body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring debe ser un valor booleano'),

  recurringFrequency: body('recurringFrequency')
    .optional()
    .isIn(['diario', 'semanal', 'mensual', 'trimestral', 'anual'])
    .withMessage('Frecuencia de recurrencia no válida')
    .custom((value, { req }) => {
      if (req.body.isRecurring && !value) {
        throw new Error('La frecuencia de recurrencia es requerida cuando isRecurring es true');
      }
      return true;
    })
};

/**
 * Validaciones específicas para gastos
 */
const expenseValidations = {
  category: body('category')
    .isIn(['alimentacion', 'transporte', 'vivienda', 'servicios', 'salud', 'educacion', 'entretenimiento', 'ropa', 'tecnologia', 'deudas', 'ahorro', 'inversion', 'impuestos', 'seguros', 'mantenimiento', 'otros'])
    .withMessage('Categoría de gasto no válida'),

  isEssential: body('isEssential')
    .isBoolean()
    .withMessage('isEssential debe ser un valor booleano'),

  isRecurring: body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring debe ser un valor booleano'),

  recurringFrequency: body('recurringFrequency')
    .optional()
    .isIn(['diario', 'semanal', 'mensual', 'trimestral', 'anual'])
    .withMessage('Frecuencia de recurrencia no válida')
    .custom((value, { req }) => {
      if (req.body.isRecurring && !value) {
        throw new Error('La frecuencia de recurrencia es requerida cuando isRecurring es true');
      }
      return true;
    })
};

/**
 * Validaciones para consultas y filtros
 */
const queryValidations = {
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  startDate: query('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida (formato ISO 8601)'),

  endDate: query('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida (formato ISO 8601)')
    .custom((value, { req }) => {
      if (value && req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
      return true;
    }),

  sortBy: query('sortBy')
    .optional()
    .isIn(['date', 'amount', 'description', 'category'])
    .withMessage('Campo de ordenamiento no válido'),

  sortOrder: query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden de clasificación debe ser asc o desc')
};

/**
 * Validaciones para parámetros de URL
 */
const paramValidations = {
  id: param('id')
    .isMongoId()
    .withMessage('ID no válido')
};

/**
 * Validaciones para configuraciones de usuario
 */
const settingsValidations = {
  currency: body('preferences.currency')
    .optional()
    .isIn(['USD', 'EUR', 'MXN', 'COP', 'ARS', 'BRL'])
    .withMessage('Moneda no válida'),

  language: body('preferences.language')
    .optional()
    .isIn(['es', 'en', 'pt'])
    .withMessage('Idioma no válido'),

  emailNotifications: body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Las notificaciones por email deben ser un valor booleano'),

  pushNotifications: body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Las notificaciones push deben ser un valor booleano')
};

/**
 * Validaciones personalizadas
 */
const customValidations = {
  // Validar que el email no esté en uso
  uniqueEmail: (field = 'email') => body(field)
    .custom(async (value) => {
      const { default: User } = await import('../models/User.js');
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Este email ya está registrado');
      }
      return true;
    }),

  // Validar que el email exista en la base de datos
  existingEmail: (field = 'email') => body(field)
    .custom(async (value) => {
      const { default: User } = await import('../models/User.js');
      const user = await User.findOne({ email: value });
      if (!user) {
        throw new Error('Este email no está registrado');
      }
      return true;
    }),

  // Validar que las contraseñas coincidan
  passwordMatch: (field = 'confirmPassword', passwordField = 'password') => body(field)
    .custom((value, { req }) => {
      if (value !== req.body[passwordField]) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),

  // Validar que la contraseña actual sea correcta
  currentPasswordMatch: (field = 'currentPassword') => body(field)
    .custom(async (value, { req }) => {
      const { default: User } = await import('../models/User.js');
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      const bcrypt = await import('bcryptjs');
      const isMatch = await bcrypt.default.compare(value, user.password);
      if (!isMatch) {
        throw new Error('La contraseña actual es incorrecta');
      }
      return true;
    })
};

export {
  handleValidationErrors,
  userValidations,
  transactionValidations,
  incomeValidations,
  expenseValidations,
  queryValidations,
  paramValidations,
  settingsValidations,
  customValidations
};
