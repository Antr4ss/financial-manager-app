import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';

/**
 * @desc    Obtener dashboard del usuario
 * @route   GET /api/users/dashboard
 * @access  Private
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Fechas por defecto (último mes)
    const defaultEndDate = endDate ? new Date(endDate) : new Date();
    const defaultStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Obtener totales de ingresos y gastos
    const [incomeTotal, expenseTotal] = await Promise.all([
      Income.getTotalByUser(userId, defaultStartDate, defaultEndDate),
      Expense.getTotalByUser(userId, defaultStartDate, defaultEndDate)
    ]);

    const totalIncome = incomeTotal.length > 0 ? incomeTotal[0].total : 0;
    const totalExpense = expenseTotal.length > 0 ? expenseTotal[0].total : 0;
    const balance = totalIncome - totalExpense;

    // Obtener estadísticas por categoría
    const [incomeByCategory, expenseByCategory] = await Promise.all([
      Income.getByCategory(userId, defaultStartDate, defaultEndDate),
      Expense.getByCategory(userId, defaultStartDate, defaultEndDate)
    ]);

    // Obtener ingresos y gastos recientes
    const [recentIncomes, recentExpenses] = await Promise.all([
      Income.find({ user: userId, isActive: true })
        .sort({ date: -1 })
        .limit(5)
        .populate('user', 'name email'),
      Expense.find({ user: userId, isActive: true })
        .sort({ date: -1 })
        .limit(5)
        .populate('user', 'name email')
    ]);

    // Obtener estadísticas mensuales de los últimos 6 meses
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const [monthIncome, monthExpense] = await Promise.all([
        Income.getTotalByUser(userId, monthStart, monthEnd),
        Expense.getTotalByUser(userId, monthStart, monthEnd)
      ]);

      monthlyStats.push({
        month: monthStart.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
        income: monthIncome.length > 0 ? monthIncome[0].total : 0,
        expense: monthExpense.length > 0 ? monthExpense[0].total : 0,
        balance: (monthIncome.length > 0 ? monthIncome[0].total : 0) - (monthExpense.length > 0 ? monthExpense[0].total : 0)
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          balance,
          period: {
            startDate: defaultStartDate,
            endDate: defaultEndDate
          }
        },
        incomeByCategory,
        expenseByCategory,
        recentIncomes,
        recentExpenses,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo el dashboard'
      }
    });
  }
};

/**
 * @desc    Obtener reporte financiero
 * @route   GET /api/users/report
 * @access  Private
 */
const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const userId = req.user._id;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Fechas requeridas',
          details: 'Debes proporcionar startDate y endDate'
        }
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Obtener todos los ingresos y gastos del período
    const [incomes, expenses] = await Promise.all([
      Income.find({ 
        user: userId, 
        isActive: true,
        date: { $gte: start, $lte: end }
      }).sort({ date: -1 }),
      Expense.find({ 
        user: userId, 
        isActive: true,
        date: { $gte: start, $lte: end }
      }).sort({ date: -1 })
    ]);

    // Calcular totales
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpense;

    // Estadísticas por categoría
    const incomeByCategory = {};
    const expenseByCategory = {};

    incomes.forEach(income => {
      if (!incomeByCategory[income.category]) {
        incomeByCategory[income.category] = { total: 0, count: 0 };
      }
      incomeByCategory[income.category].total += income.amount;
      incomeByCategory[income.category].count += 1;
    });

    expenses.forEach(expense => {
      if (!expenseByCategory[expense.category]) {
        expenseByCategory[expense.category] = { total: 0, count: 0 };
      }
      expenseByCategory[expense.category].total += expense.amount;
      expenseByCategory[expense.category].count += 1;
    });

    // Gastos esenciales vs no esenciales
    const essentialExpenses = expenses.filter(expense => expense.isEssential);
    const nonEssentialExpenses = expenses.filter(expense => !expense.isEssential);

    const essentialTotal = essentialExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const nonEssentialTotal = nonEssentialExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const report = {
      period: {
        startDate: start,
        endDate: end,
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalIncome,
        totalExpense,
        balance,
        averageDailyIncome: totalIncome / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))),
        averageDailyExpense: totalExpense / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
      },
      incomeByCategory: Object.entries(incomeByCategory).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0
      })).sort((a, b) => b.total - a.total),
      expenseByCategory: Object.entries(expenseByCategory).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0
      })).sort((a, b) => b.total - a.total),
      essentialExpenses: {
        total: essentialTotal,
        count: essentialExpenses.length,
        percentage: totalExpense > 0 ? (essentialTotal / totalExpense) * 100 : 0
      },
      nonEssentialExpenses: {
        total: nonEssentialTotal,
        count: nonEssentialExpenses.length,
        percentage: totalExpense > 0 ? (nonEssentialTotal / totalExpense) * 100 : 0
      },
      transactions: {
        total: incomes.length + expenses.length,
        incomes: incomes.length,
        expenses: expenses.length
      }
    };

    if (format === 'csv') {
      // Generar CSV (implementación básica)
      const csvData = [
        ['Tipo', 'Descripción', 'Monto', 'Categoría', 'Fecha', 'Método de Pago'],
        ...incomes.map(income => [
          'Ingreso',
          income.description,
          income.amount,
          income.category,
          income.date.toISOString().split('T')[0],
          income.paymentMethod
        ]),
        ...expenses.map(expense => [
          'Gasto',
          expense.description,
          expense.amount,
          expense.category,
          expense.date.toISOString().split('T')[0],
          expense.paymentMethod
        ])
      ];

      const csv = csvData.map(row => row.join(',')).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte-financiero.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error generando el reporte financiero'
      }
    });
  }
};

/**
 * @desc    Obtener configuración del usuario
 * @route   GET /api/users/settings
 * @access  Private
 */
const getSettings = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        preferences: user.preferences,
        profile: {
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo la configuración'
      }
    });
  }
};

/**
 * @desc    Actualizar configuración del usuario
 * @route   PUT /api/users/settings
 * @access  Private
 */
const updateSettings = async (req, res) => {
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

    const { preferences } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences: { ...req.user.preferences, ...preferences } },
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
      message: 'Configuración actualizada exitosamente',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error actualizando la configuración'
      }
    });
  }
};

export {
  getDashboard,
  getFinancialReport,
  getSettings,
  updateSettings
};
