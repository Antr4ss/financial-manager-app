import { validationResult } from 'express-validator';
import Expense from '../models/Expense.js';

/**
 * @desc    Obtener todos los gastos del usuario
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, sortBy = 'date', sortOrder = 'desc', isEssential } = req.query;
    const userId = req.user._id;

    // Construir filtros
    const filters = { user: userId, isActive: true };
    
    if (category) {
      filters.category = category;
    }
    
    if (isEssential !== undefined && isEssential !== '') {
      filters.isEssential = isEssential === 'true';
    }
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Construir ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Ejecutar consulta con paginación
    const expenses = await Expense.find(filters)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    // Contar total de documentos
    const total = await Expense.countDocuments(filters);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo los gastos'
      }
    });
  }
};

/**
 * @desc    Obtener un gasto por ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findOne({ _id: id, user: userId, isActive: true })
      .populate('user', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Gasto no encontrado',
          details: 'El gasto solicitado no existe o no tienes permisos para verlo'
        }
      });
    }

    res.json({
      success: true,
      data: { expense }
    });

  } catch (error) {
    console.error('Error obteniendo gasto:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo el gasto'
      }
    });
  }
};

/**
 * @desc    Crear nuevo gasto
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = async (req, res) => {
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

    const expenseData = {
      ...req.body,
      user: req.user._id
    };

    const expense = new Expense(expenseData);
    await expense.save();

    // Poblar datos del usuario
    await expense.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: { expense }
    });

  } catch (error) {
    console.error('Error creando gasto:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error creando el gasto'
      }
    });
  }
};

/**
 * @desc    Actualizar gasto
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = async (req, res) => {
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

    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: userId, isActive: true },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Gasto no encontrado',
          details: 'El gasto solicitado no existe o no tienes permisos para modificarlo'
        }
      });
    }

    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: { expense }
    });

  } catch (error) {
    console.error('Error actualizando gasto:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error actualizando el gasto'
      }
    });
  }
};

/**
 * @desc    Eliminar gasto (soft delete)
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Gasto no encontrado',
          details: 'El gasto solicitado no existe o no tienes permisos para eliminarlo'
        }
      });
    }

    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error eliminando el gasto'
      }
    });
  }
};

/**
 * @desc    Obtener estadísticas de gastos
 * @route   GET /api/expenses/stats
 * @access  Private
 */
const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    // Obtener total de gastos
    const totalResult = await Expense.getTotalByUser(userId, startDate, endDate);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Obtener gastos por categoría
    const categoryStats = await Expense.getByCategory(userId, startDate, endDate);

    // Obtener gastos del mes actual
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyResult = await Expense.getTotalByUser(userId, startOfMonth, endOfMonth);
    const monthlyTotal = monthlyResult.length > 0 ? monthlyResult[0].total : 0;

    // Obtener gastos del mes anterior
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const lastMonthResult = await Expense.getTotalByUser(userId, lastMonth, endLastMonth);
    const lastMonthTotal = lastMonthResult.length > 0 ? lastMonthResult[0].total : 0;

    // Calcular crecimiento porcentual
    const growthPercentage = lastMonthTotal > 0 
      ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    // Obtener gastos esenciales vs no esenciales
    const essentialStats = await Expense.getEssentialVsNonEssential(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        total,
        monthlyTotal,
        lastMonthTotal,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
        categoryStats,
        essentialStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de gastos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo las estadísticas de gastos'
      }
    });
  }
};

export {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
};
