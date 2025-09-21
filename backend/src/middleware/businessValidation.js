import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

/**
 * Validar que el usuario tenga permisos para acceder a un recurso
 */
const validateUserAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const resourceId = req.params.id;

      let resource;
      switch (resourceType) {
        case 'income':
          resource = await Income.findOne({ _id: resourceId, user: userId, isActive: true });
          break;
        case 'expense':
          resource = await Expense.findOne({ _id: resourceId, user: userId, isActive: true });
          break;
        case 'user':
          resource = await User.findOne({ _id: resourceId, isActive: true });
          // El usuario solo puede acceder a su propio perfil
          if (resource && resource._id.toString() !== userId.toString()) {
            resource = null;
          }
          break;
        default:
          return res.status(400).json({
            success: false,
            error: {
              message: 'Tipo de recurso no válido',
              details: 'El tipo de recurso especificado no es válido'
            }
          });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Recurso no encontrado',
            details: 'El recurso solicitado no existe o no tienes permisos para accederlo'
          }
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Error validando acceso de usuario:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: 'Error validando permisos de acceso'
        }
      });
    }
  };
};

/**
 * Validar límites de transacciones por usuario
 */
const validateTransactionLimits = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount, date } = req.body;

    // Verificar límite diario de transacciones
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = await Income.countDocuments({
      user: userId,
      date: { $gte: today, $lt: tomorrow },
      isActive: true
    });

    const maxDailyTransactions = 50; // Límite configurable
    if (todayTransactions >= maxDailyTransactions) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Límite diario de transacciones excedido',
          details: `Solo se permiten ${maxDailyTransactions} transacciones por día`
        }
      });
    }

    // Verificar límite de monto por transacción
    const maxTransactionAmount = 1000000; // $1,000,000
    if (amount > maxTransactionAmount) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Monto excesivo',
          details: `El monto máximo por transacción es ${maxTransactionAmount.toLocaleString()}`
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error validando límites de transacción:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error validando límites de transacción'
      }
    });
  }
};

/**
 * Validar coherencia de datos financieros
 */
const validateFinancialConsistency = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount, date, category } = req.body;
    const isIncome = req.path.includes('/incomes');
    const isExpense = req.path.includes('/expenses');

    // Validar que el monto sea positivo
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Monto inválido',
          details: 'El monto debe ser mayor a cero'
        }
      });
    }

    // Validar fechas futuras para transacciones
    const transactionDate = new Date(date);
    const now = new Date();
    const maxFutureDays = 30; // Máximo 30 días en el futuro
    const futureLimit = new Date(now.getTime() + (maxFutureDays * 24 * 60 * 60 * 1000));

    if (transactionDate > futureLimit) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Fecha inválida',
          details: `No se pueden crear transacciones más de ${maxFutureDays} días en el futuro`
        }
      });
    }

    // Validar categorías específicas por tipo de transacción
    if (isIncome) {
      const validIncomeCategories = ['salario', 'ventas', 'inversiones', 'freelance', 'bonos', 'comisiones', 'alquiler', 'intereses', 'dividendos', 'reembolsos', 'regalos', 'otros'];
      if (!validIncomeCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Categoría inválida',
            details: 'La categoría especificada no es válida para ingresos'
          }
        });
      }
    }

    if (isExpense) {
      const validExpenseCategories = ['alimentacion', 'transporte', 'vivienda', 'servicios', 'salud', 'educacion', 'entretenimiento', 'ropa', 'tecnologia', 'deudas', 'ahorro', 'inversion', 'impuestos', 'seguros', 'mantenimiento', 'otros'];
      if (!validExpenseCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Categoría inválida',
            details: 'La categoría especificada no es válida para gastos'
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error validando coherencia financiera:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error validando coherencia de datos financieros'
      }
    });
  }
};

/**
 * Validar límites de usuario por plan
 */
const validateUserPlanLimits = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('plan preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          details: 'No se pudo encontrar el usuario'
        }
      });
    }

    // Límites por plan (configurables)
    const planLimits = {
      free: {
        maxTransactions: 100,
        maxCategories: 10,
        maxTags: 5
      },
      premium: {
        maxTransactions: 1000,
        maxCategories: 50,
        maxTags: 20
      },
      enterprise: {
        maxTransactions: -1, // Ilimitado
        maxCategories: -1,
        maxTags: -1
      }
    };

    const userPlan = user.plan || 'free';
    const limits = planLimits[userPlan];

    // Verificar límite de transacciones
    if (limits.maxTransactions > 0) {
      const transactionCount = await Income.countDocuments({ user: userId, isActive: true }) +
                              await Expense.countDocuments({ user: userId, isActive: true });

      if (transactionCount >= limits.maxTransactions) {
        return res.status(429).json({
          success: false,
          error: {
            message: 'Límite de plan excedido',
            details: `Has alcanzado el límite de ${limits.maxTransactions} transacciones de tu plan ${userPlan}. Considera actualizar tu plan.`
          }
        });
      }
    }

    // Verificar límite de etiquetas
    if (limits.maxTags > 0 && req.body.tags) {
      if (req.body.tags.length > limits.maxTags) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Límite de etiquetas excedido',
            details: `Tu plan ${userPlan} permite máximo ${limits.maxTags} etiquetas por transacción`
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error validando límites de plan:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error validando límites de plan de usuario'
      }
    });
  }
};

/**
 * Validar integridad de datos antes de actualizar
 */
const validateDataIntegrity = async (req, res, next) => {
  try {
    const { amount, date, category } = req.body;
    const userId = req.user._id;

    // Verificar que no se esté duplicando una transacción
    if (amount && date && category) {
      const existingTransaction = await Income.findOne({
        user: userId,
        amount: parseFloat(amount),
        date: new Date(date),
        category: category,
        isActive: true
      }) || await Expense.findOne({
        user: userId,
        amount: parseFloat(amount),
        date: new Date(date),
        category: category,
        isActive: true
      });

      if (existingTransaction) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Transacción duplicada',
            details: 'Ya existe una transacción con los mismos datos en la fecha especificada'
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error validando integridad de datos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error validando integridad de datos'
      }
    });
  }
};

/**
 * Validar que el usuario esté activo
 */
const validateActiveUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('isActive lastLogin');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          details: 'El usuario especificado no existe'
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Cuenta desactivada',
          details: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
        }
      });
    }

    // Verificar último login (opcional - para forzar re-login después de cierto tiempo)
    const maxInactiveDays = 90; // 90 días
    const lastLogin = new Date(user.lastLogin);
    const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLogin > maxInactiveDays) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Sesión expirada por inactividad',
          details: `Tu sesión ha expirado por inactividad de más de ${maxInactiveDays} días. Por favor inicia sesión nuevamente.`
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error validando usuario activo:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error validando estado del usuario'
      }
    });
  }
};

export {
  validateUserAccess,
  validateTransactionLimits,
  validateFinancialConsistency,
  validateUserPlanLimits,
  validateDataIntegrity,
  validateActiveUser
};
