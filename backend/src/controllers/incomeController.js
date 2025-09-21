import { validationResult } from 'express-validator';
import Income from '../models/Income.js';
import { handleValidationErrors } from '../middleware/validation.js';

/**
 * @desc    Obtener todos los ingresos del usuario
 * @route   GET /api/incomes
 * @access  Private
 */
const getIncomes = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const userId = req.user._id;

    // Construir filtros
    const filters = { user: userId, isActive: true };
    
    if (category) {
      filters.category = category;
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
    const incomes = await Income.find(filters)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    // Contar total de documentos
    const total = await Income.countDocuments(filters);

    res.json({
      success: true,
      data: {
        incomes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo los ingresos'
      }
    });
  }
};

/**
 * @desc    Obtener un ingreso por ID
 * @route   GET /api/incomes/:id
 * @access  Private
 */
const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const income = await Income.findOne({ _id: id, user: userId, isActive: true })
      .populate('user', 'name email');

    if (!income) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Ingreso no encontrado',
          details: 'El ingreso solicitado no existe o no tienes permisos para verlo'
        }
      });
    }

    res.json({
      success: true,
      data: { income }
    });

  } catch (error) {
    console.error('Error obteniendo ingreso:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo el ingreso'
      }
    });
  }
};

/**
 * @desc    Crear nuevo ingreso
 * @route   POST /api/incomes
 * @access  Private
 */
const createIncome = async (req, res) => {
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

    const incomeData = {
      ...req.body,
      user: req.user._id
    };

    const income = new Income(incomeData);
    await income.save();

    // Poblar datos del usuario
    await income.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Ingreso creado exitosamente',
      data: { income }
    });

  } catch (error) {
    console.error('Error creando ingreso:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error creando el ingreso'
      }
    });
  }
};

/**
 * @desc    Actualizar ingreso
 * @route   PUT /api/incomes/:id
 * @access  Private
 */
const updateIncome = async (req, res) => {
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

    const income = await Income.findOneAndUpdate(
      { _id: id, user: userId, isActive: true },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!income) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Ingreso no encontrado',
          details: 'El ingreso solicitado no existe o no tienes permisos para modificarlo'
        }
      });
    }

    res.json({
      success: true,
      message: 'Ingreso actualizado exitosamente',
      data: { income }
    });

  } catch (error) {
    console.error('Error actualizando ingreso:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error actualizando el ingreso'
      }
    });
  }
};

/**
 * @desc    Eliminar ingreso (soft delete)
 * @route   DELETE /api/incomes/:id
 * @access  Private
 */
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const income = await Income.findOneAndUpdate(
      { _id: id, user: userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!income) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Ingreso no encontrado',
          details: 'El ingreso solicitado no existe o no tienes permisos para eliminarlo'
        }
      });
    }

    res.json({
      success: true,
      message: 'Ingreso eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando ingreso:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error eliminando el ingreso'
      }
    });
  }
};

/**
 * @desc    Obtener estadísticas de ingresos
 * @route   GET /api/incomes/stats
 * @access  Private
 */
const getIncomeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    // Obtener total de ingresos
    const totalResult = await Income.getTotalByUser(userId, startDate, endDate);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Obtener ingresos por categoría
    const categoryStats = await Income.getByCategory(userId, startDate, endDate);

    // Obtener ingresos del mes actual
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyResult = await Income.getTotalByUser(userId, startOfMonth, endOfMonth);
    const monthlyTotal = monthlyResult.length > 0 ? monthlyResult[0].total : 0;

    // Obtener ingresos del mes anterior
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const lastMonthResult = await Income.getTotalByUser(userId, lastMonth, endLastMonth);
    const lastMonthTotal = lastMonthResult.length > 0 ? lastMonthResult[0].total : 0;

    // Calcular crecimiento porcentual
    const growthPercentage = lastMonthTotal > 0 
      ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        total,
        monthlyTotal,
        lastMonthTotal,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de ingresos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo las estadísticas de ingresos'
      }
    });
  }
};

export {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
};
