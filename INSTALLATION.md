# Guía de Instalación - Financial Manager App

## Requisitos Previos

- Node.js (versión 16 o superior)
- MongoDB Atlas (cuenta gratuita)
- Git (opcional)

## Pasos de Instalación

### 1. Clonar o Descargar el Proyecto

```bash
# Si usas Git
git clone <url-del-repositorio>
cd financial-manager-app

# O simplemente descarga y extrae el archivo ZIP
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp env.example .env
```

2. Edita el archivo `.env` con tus datos:
```env
# Configuración de la base de datos
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_manager?retryWrites=true&w=majority

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRE=7d

# Configuración CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster
4. Crea un usuario de base de datos
5. Obtén la cadena de conexión
6. Reemplaza `<username>`, `<password>` y `<cluster>` en la URI

### 5. Ejecutar la Aplicación

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

### 6. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

## Estructura del Proyecto

```
financial-manager-app/
├── backend/
│   └── src/
│       ├── controllers/     # Controladores de la API
│       ├── models/          # Modelos de Mongoose
│       ├── routes/          # Rutas de la API
│       ├── middleware/      # Middleware personalizado
│       ├── config/          # Configuración
│       └── utils/           # Utilidades
├── frontend/
│   ├── css/                 # Estilos CSS
│   ├── js/                  # JavaScript del frontend
│   └── views/               # Vistas HTML
├── docs/                    # Documentación
├── package.json
├── README.md
└── INSTALLATION.md
```

## Funcionalidades Principales

### 🔐 Autenticación
- Registro de usuarios
- Inicio de sesión con JWT
- Cambio de contraseña
- Configuración de perfil

### 💰 Gestión de Ingresos
- Registrar ingresos
- Categorización automática
- Ingresos recurrentes
- Filtros y búsquedas

### 💸 Gestión de Gastos
- Registrar gastos
- Clasificación por categorías
- Gastos esenciales vs no esenciales
- Gastos recurrentes

### 📊 Dashboard y Reportes
- Resumen financiero
- Gráficos de categorías
- Reportes por período
- Exportación a CSV

### ⚙️ Configuración
- Preferencias de moneda
- Configuración de idioma
- Notificaciones

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Ingresos
- `GET /api/incomes` - Listar ingresos
- `POST /api/incomes` - Crear ingreso
- `GET /api/incomes/:id` - Obtener ingreso
- `PUT /api/incomes/:id` - Actualizar ingreso
- `DELETE /api/incomes/:id` - Eliminar ingreso
- `GET /api/incomes/stats` - Estadísticas de ingresos

### Gastos
- `GET /api/expenses` - Listar gastos
- `POST /api/expenses` - Crear gasto
- `GET /api/expenses/:id` - Obtener gasto
- `PUT /api/expenses/:id` - Actualizar gasto
- `DELETE /api/expenses/:id` - Eliminar gasto
- `GET /api/expenses/stats` - Estadísticas de gastos

### Usuario
- `GET /api/users/dashboard` - Dashboard del usuario
- `GET /api/users/report` - Generar reporte
- `GET /api/users/settings` - Obtener configuración
- `PUT /api/users/settings` - Actualizar configuración

## Solución de Problemas

### Error de Conexión a MongoDB
- Verifica que la URI de conexión sea correcta
- Asegúrate de que la IP esté en la whitelist de MongoDB Atlas
- Verifica que el usuario tenga permisos de lectura/escritura

### Error de JWT
- Verifica que JWT_SECRET esté configurado
- Asegúrate de que el token no haya expirado
- Verifica que el header Authorization esté presente

### Error de CORS
- Verifica que CORS_ORIGIN esté configurado correctamente
- Asegúrate de que el frontend esté en la URL permitida

## Desarrollo

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: pruebas
chore: tareas de mantenimiento
```

### Agregar Nueva Funcionalidad
1. Crear el modelo en `backend/src/models/`
2. Crear el controlador en `backend/src/controllers/`
3. Crear las rutas en `backend/src/routes/`
4. Actualizar la documentación Swagger
5. Implementar el frontend correspondiente

## Producción

### Variables de Entorno para Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secret_muy_seguro
CORS_ORIGIN=https://tu-dominio.com
```

### Optimizaciones
- Usar PM2 para gestión de procesos
- Configurar Nginx como proxy reverso
- Implementar logs con Winston
- Configurar monitoreo con herramientas como New Relic

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## Changelog

### v1.0.0
- Implementación inicial
- Sistema de autenticación JWT
- Gestión de ingresos y gastos
- Dashboard con estadísticas
- Reportes financieros
- Interfaz responsiva con Bootstrap
