/**
 * Configuración de validaciones del servidor
 */

export default {
  // Límites de datos
  limits: {
    maxDataSize: {
      register: 1024,        // 1KB para registro
      login: 512,            // 512 bytes para login
      transaction: 2048,     // 2KB para transacciones
      report: 10240,         // 10KB para reportes
      default: 1024          // 1KB por defecto
    },
    
    maxStringLength: {
      name: 50,
      email: 100,
      description: 200,
      notes: 500,
      tag: 20,
      password: 128
    },
    
    maxArrayLength: {
      tags: 10,
      categories: 50
    },
    
    maxNumericValue: {
      amount: 999999999.99,
      page: 1000,
      limit: 100
    },
    
    minNumericValue: {
      amount: 0.01,
      page: 1,
      limit: 1
    }
  },
  
  // Patrones de validación
  patterns: {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    description: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,()]+$/,
    tag: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/,
    mongoId: /^[0-9a-fA-F]{24}$/
  },
  
  // Categorías válidas
  categories: {
    income: [
      'salario', 'ventas', 'inversiones', 'freelance', 'bonos', 
      'comisiones', 'alquiler', 'intereses', 'dividendos', 
      'reembolsos', 'regalos', 'otros'
    ],
    expense: [
      'alimentacion', 'transporte', 'vivienda', 'servicios', 'salud', 
      'educacion', 'entretenimiento', 'ropa', 'tecnologia', 'deudas', 
      'ahorro', 'inversion', 'impuestos', 'seguros', 'mantenimiento', 'otros'
    ]
  },
  
  // Métodos de pago válidos
  paymentMethods: [
    'efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 
    'cheque', 'crypto', 'otros'
  ],
  
  // Frecuencias de recurrencia válidas
  recurringFrequencies: [
    'diario', 'semanal', 'mensual', 'trimestral', 'anual'
  ],
  
  // Monedas soportadas
  currencies: ['USD', 'EUR', 'MXN', 'COP', 'ARS', 'BRL'],
  
  // Idiomas soportados
  languages: ['es', 'en', 'pt'],
  
  // Campos de ordenamiento válidos
  sortFields: ['date', 'amount', 'description', 'category'],
  
  // Órdenes de clasificación válidas
  sortOrders: ['asc', 'desc'],
  
  // Formatos de reporte válidos
  reportFormats: ['json', 'csv'],
  
  // Límites de negocio
  business: {
    maxDailyTransactions: 50,
    maxTransactionAmount: 1000000,
    maxFutureDays: 30,
    maxInactiveDays: 90,
    maxTagsPerTransaction: 10
  },
  
  // Límites por plan
  planLimits: {
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
  },
  
  // Patrones de inyección de código
  injectionPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ],
  
  // Tipos de contenido permitidos
  allowedContentTypes: [
    'application/json',
    'application/x-www-form-urlencoded'
  ],
  
  // Mensajes de error personalizados
  errorMessages: {
    required: 'Este campo es requerido',
    invalid: 'Valor inválido',
    tooShort: 'Muy corto',
    tooLong: 'Muy largo',
    notFound: 'No encontrado',
    unauthorized: 'No autorizado',
    forbidden: 'Acceso denegado',
    conflict: 'Conflicto de datos',
    tooManyRequests: 'Demasiadas solicitudes',
    payloadTooLarge: 'Datos demasiado grandes',
    unsupportedMediaType: 'Tipo de contenido no soportado'
  }
};
