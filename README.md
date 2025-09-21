# Financial Manager App

Aplicación web para gestión de finanzas personales y de negocio, desarrollada con Node.js, Express, MongoDB y Bootstrap.

## Características

- ✅ Registro e inicio de sesión de usuarios
- ✅ Gestión de ingresos y gastos
- ✅ Dashboard con balance financiero
- ✅ Reportes mensuales
- ✅ Interfaz responsiva con Bootstrap
- ✅ API REST documentada con Swagger
- ✅ Autenticación JWT segura

## Tecnologías

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: HTML, CSS, Bootstrap, JavaScript (ES6+)
- **Autenticación**: JWT (JSON Web Tokens)
- **Documentación**: Swagger
- **Base de datos**: MongoDB Atlas

## Instalación

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno (copia `env.example` a `.env`)
4. Ejecuta la aplicación: `npm run dev`

## Estructura del Proyecto

```
financial-manager-app/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── config/
│       └── utils/
├── frontend/
│   ├── css/
│   ├── js/
│   └── views/
└── docs/
```

## API Endpoints

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/incomes` - Obtener ingresos
- `POST /api/incomes` - Crear ingreso
- `GET /api/expenses` - Obtener gastos
- `POST /api/expenses` - Crear gasto

## Documentación API

La documentación completa de la API está disponible en `/api-docs` cuando la aplicación está ejecutándose.
