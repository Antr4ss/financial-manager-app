import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Configuración de Swagger
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Financial Manager API',
      version: '1.0.0',
      description: 'API REST para gestión de finanzas personales y de negocio',
      contact: {
        name: 'Harold Guerrero',
        email: 'harold.guerrero@uptc.edu.co'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT en el formato: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Mensaje de error principal'
                },
                details: {
                  type: 'string',
                  description: 'Detalles adicionales del error'
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para registro, login y gestión de usuarios'
      },
      {
        name: 'Ingresos',
        description: 'Endpoints para gestión de ingresos'
      },
      {
        name: 'Gastos',
        description: 'Endpoints para gestión de gastos'
      },
      {
        name: 'Usuario',
        description: 'Endpoints para dashboard y reportes del usuario'
      }
    ]
  },
  apis: [
    './backend/src/routes/*.js',
    './backend/src/controllers/*.js',
    './backend/src/models/*.js'
  ]
};

// Generar especificación de Swagger
const swaggerSpec = swaggerJsdoc(options);

// Configurar Swagger UI
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
  `,
  customSiteTitle: 'Financial Manager API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
};

export {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions
};
