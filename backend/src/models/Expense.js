import mongoose from 'mongoose';

/**
 * Esquema de Gastos
 * Define la estructura de datos para los gastos del usuario
 */
const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    minlength: [3, 'La descripción debe tener al menos 3 caracteres'],
    maxlength: [200, 'La descripción no puede exceder 200 caracteres']
  },
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0.01, 'El monto debe ser mayor a 0'],
    max: [999999999.99, 'El monto no puede exceder 999,999,999.99']
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: [
        'alimentacion',
        'transporte',
        'vivienda',
        'servicios',
        'salud',
        'educacion',
        'entretenimiento',
        'ropa',
        'tecnologia',
        'deudas',
        'ahorro',
        'inversion',
        'impuestos',
        'seguros',
        'mantenimiento',
        'otros'
      ],
      message: 'Categoría no válida'
    }
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['efectivo', 'tarjeta', 'transferencia', 'cheque', 'crypto', 'otros'],
      message: 'Método de pago no válido'
    },
    default: 'efectivo'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['semanal', 'quincenal', 'mensual', 'trimestral', 'anual'],
    required: function() {
      return this.isRecurring === true;
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Cada tag no puede exceder 20 caracteres']
  }],
  isEssential: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, amount: -1 });
expenseSchema.index({ user: 1, isEssential: 1 });
expenseSchema.index({ date: -1 });

// Virtual para formatear el monto
expenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Virtual para formatear la fecha
expenseSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Middleware pre-save para validaciones adicionales
expenseSchema.pre('save', function(next) {
  // Asegurar que la fecha no sea futura (opcional)
  if (this.date > new Date()) {
    console.warn('Advertencia: Se está registrando un gasto con fecha futura');
  }
  next();
});

// Método estático para obtener gastos por usuario y rango de fechas
expenseSchema.statics.getByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  }).sort({ date: -1 });
};

// Método estático para obtener total de gastos por usuario
expenseSchema.statics.getTotalByUser = function(userId, startDate, endDate) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
    isActive: true
  };
  
  if (startDate && endDate) {
    matchStage.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

// Método estático para obtener gastos por categoría
expenseSchema.statics.getByCategory = function(userId, startDate, endDate) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
    isActive: true
  };
  
  if (startDate && endDate) {
    matchStage.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

// Método estático para obtener gastos esenciales vs no esenciales
expenseSchema.statics.getEssentialVsNonEssential = function(userId, startDate, endDate) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
    isActive: true
  };
  
  if (startDate && endDate) {
    matchStage.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchStage },
    { 
      $group: { 
        _id: '$isEssential', 
        total: { $sum: '$amount' }, 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { _id: 1 } }
  ]);
};

export default mongoose.model('Expense', expenseSchema);
