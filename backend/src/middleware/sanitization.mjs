import { body, query, param } from 'express-validator';

/**
 * Middleware de sanitización para limpiar datos de entrada
 */
const sanitizeInput = (req, res, next) => {
  // Sanitizar strings en el body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitizar strings en query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.body[key].trim();
      }
    });
  }

  next();
};

/**
 * Sanitización específica para campos de texto
 */
const sanitizeTextFields = (fields) => {
  return fields.map(field => 
    body(field)
      .trim()
      .escape()
      .stripLow()
  );
};

/**
 * Sanitización para campos de email
 */
const sanitizeEmail = body('email')
  .trim()
  .normalizeEmail()
  .toLowerCase();

/**
 * Sanitización para campos de descripción
 */
const sanitizeDescription = body('description')
  .trim()
  .escape()
  .stripLow(true);

/**
 * Sanitización para campos de notas
 */
const sanitizeNotes = body('notes')
  .optional()
  .trim()
  .escape()
  .stripLow(true);

/**
 * Sanitización para campos de etiquetas
 */
const sanitizeTags = body('tags')
  .optional()
  .customSanitizer(value => {
    if (Array.isArray(value)) {
      return value.map(tag => 
        typeof tag === 'string' ? tag.trim().toLowerCase() : tag
      ).filter(tag => tag.length > 0);
    }
    return value;
  });

/**
 * Sanitización para campos numéricos
 */
const sanitizeNumericFields = (fields) => {
  return fields.map(field => 
    body(field)
      .customSanitizer(value => {
        if (typeof value === 'string') {
          return parseFloat(value);
        }
        return value;
      })
  );
};

/**
 * Sanitización para fechas
 */
const sanitizeDate = body('date')
  .customSanitizer(value => {
    if (value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString();
    }
    return value;
  });

/**
 * Sanitización para campos booleanos
 */
const sanitizeBooleanFields = (fields) => {
  return fields.map(field => 
    body(field)
      .customSanitizer(value => {
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return Boolean(value);
      })
  );
};

/**
 * Sanitización para parámetros de consulta
 */
const sanitizeQueryParams = [
  query('page').customSanitizer(value => {
    const page = parseInt(value);
    return isNaN(page) || page < 1 ? 1 : page;
  }),
  
  query('limit').customSanitizer(value => {
    const limit = parseInt(value);
    return isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);
  }),
  
  query('sortBy').customSanitizer(value => {
    const allowedFields = ['date', 'amount', 'description', 'category'];
    return allowedFields.includes(value) ? value : 'date';
  }),
  
  query('sortOrder').customSanitizer(value => {
    return value === 'asc' ? 'asc' : 'desc';
  })
];

/**
 * Sanitización para IDs de MongoDB
 */
const sanitizeMongoId = param('id')
  .customSanitizer(value => {
    // Verificar que sea un ObjectId válido
    if (value && /^[0-9a-fA-F]{24}$/.test(value)) {
      return value;
    }
    return value;
  });

/**
 * Middleware para prevenir inyección de código
 */
const preventInjection = (req, res, next) => {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];

  const checkForInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of dangerousPatterns) {
          if (pattern.test(obj[key])) {
            return res.status(400).json({
              success: false,
              error: {
                message: 'Contenido potencialmente peligroso detectado',
                details: 'Se ha detectado código malicioso en los datos enviados'
              }
            });
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (req.body) {
    if (checkForInjection(req.body)) return;
  }
  
  if (req.query) {
    if (checkForInjection(req.query)) return;
  }

  next();
};

/**
 * Middleware para limitar el tamaño de los datos
 */
const limitDataSize = (maxSize = 1024 * 1024) => { // 1MB por defecto
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          message: 'Datos demasiado grandes',
          details: `El tamaño de los datos excede el límite de ${maxSize / 1024}KB`
        }
      });
    }
    
    next();
  };
};

/**
 * Middleware para validar tipos de contenido
 */
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    const contentType = req.get('content-type');
    
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        return res.status(415).json({
          success: false,
          error: {
            message: 'Tipo de contenido no soportado',
            details: `Se requiere uno de los siguientes tipos: ${allowedTypes.join(', ')}`
          }
        });
      }
    }
    
    next();
  };
};

export {
  sanitizeInput,
  sanitizeTextFields,
  sanitizeEmail,
  sanitizeDescription,
  sanitizeNotes,
  sanitizeTags,
  sanitizeNumericFields,
  sanitizeDate,
  sanitizeBooleanFields,
  sanitizeQueryParams,
  sanitizeMongoId,
  preventInjection,
  limitDataSize,
  validateContentType
};
