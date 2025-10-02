# Financial Manager App

Una aplicación web completa para la gestión de finanzas personales y de negocio, construida con Node.js, Express, MongoDB y EJS. Esta aplicación permite a los usuarios registrar, categorizar y analizar sus transacciones financieras de manera intuitiva y segura.

## 🚀 Características Principales

- **💰 Gestión de Ingresos y Gastos**: Registra y categoriza tus transacciones financieras con múltiples categorías
- **📊 Dashboard Interactivo**: Visualiza tu situación financiera con resúmenes y estadísticas en tiempo real
- **📈 Reportes Detallados**: Genera reportes por categorías, fechas y períodos personalizables
- **🔐 Autenticación JWT**: Sistema de login/registro seguro con JSON Web Tokens
- **📱 Interfaz Responsiva**: Diseño moderno que se adapta a todos los dispositivos
- **🔗 API RESTful**: Backend robusto con documentación Swagger completa
- **🏷️ Categorización Inteligente**: Sistema de categorías predefinidas para ingresos y gastos
- **🔄 Transacciones Recurrentes**: Soporte para ingresos y gastos recurrentes
- **⚙️ Configuración Personalizada**: Preferencias de moneda, idioma y notificaciones

## 🛠️ Stack Tecnológico

### **Backend**
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **Swagger** - Documentación de API

### **Frontend**
- **EJS** - Motor de plantillas server-side
- **Bootstrap 5** - Framework CSS
- **JavaScript ES6+** - Lógica del cliente
- **HTML5/CSS3** - Estructura y estilos

### **Infraestructura**
- **Vercel** - Plataforma de hosting
- **MongoDB Atlas** - Base de datos en la nube

## 🚀 Inicio Rápido

### **Prerrequisitos**
- Node.js (versión 18 o superior)
- MongoDB (local o Atlas)
- Git

### **Instalación Local**

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/harold-guerrero/financial-manager-app.git
   cd financial-manager-app
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   ```bash
   cp env.example .env
   # Edita .env con tus configuraciones
   ```

4. **Inicia la aplicación:**
   ```bash
   npm run dev  # Modo desarrollo con hot reload
   npm start    # Modo producción
   ```

5. **Accede a la aplicación:**
   - **Aplicación Web**: `http://localhost:3000`
   - **API Documentation**: `http://localhost:3000/api-docs`
   - **Health Check**: `http://localhost:3000/api/health`

### **Scripts Disponibles**
```bash
npm start      # Inicia la aplicación en modo producción
npm run dev    # Inicia con nodemon para desarrollo
npm test       # Ejecuta los tests
npm run build  # Build del proyecto (no requerido)
```

## ☁️ Despliegue en Vercel

### Opción 1: Despliegue Automático

1. **Fork este repositorio**
2. **Ve a [Vercel](https://vercel.com)**
3. **Conecta tu cuenta de GitHub**
4. **Importa este repositorio**
5. **Configura las variables de entorno:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Tu URI de MongoDB Atlas
   - `JWT_SECRET`: Tu clave secreta JWT
   - `CORS_ORIGIN`: Tu dominio de Vercel

### Opción 2: Despliegue Manual

```bash
# Instala Vercel CLI
npm i -g vercel

# Inicia sesión en Vercel
vercel login

# Despliega
vercel

# Configura variables de entorno
vercel env add NODE_ENV
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN
```

## 🗄️ Base de Datos

### MongoDB Atlas (Recomendado para producción)

1. **Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Crea un cluster gratuito**
3. **Obtén tu connection string**
4. **Configúralo en las variables de entorno**

### MongoDB Local (Para desarrollo)

```bash
# Instala MongoDB
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb-community

# Inicia MongoDB
sudo systemctl start mongod
```

## 🔧 Configuración

### **Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Entorno
NODE_ENV=development

# Puerto del servidor
PORT=3000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/financial_manager
# Para producción: mongodb+srv://usuario:password@cluster.mongodb.net/financial_manager

# JWT Secret (cambia esto en producción)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# CORS Origin
CORS_ORIGIN=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### **Estructura del Proyecto**
```
financial-manager-app/
├── 📁 backend/
│   └── 📁 src/
│       ├── 📁 controllers/     # Controladores de la API
│       ├── 📁 middleware/      # Middleware personalizado
│       ├── 📁 models/          # Modelos de MongoDB
│       ├── 📁 routes/          # Rutas de la API
│       └── 📄 app.js           # Servidor principal
├── 📁 frontend/
│   ├── 📁 views/               # Plantillas EJS
│   ├── 📁 css/                 # Estilos CSS
│   └── 📁 js/                  # JavaScript del cliente
├── 📁 docs/                    # Documentación del proyecto
└── 📄 package.json             # Dependencias y scripts
```

## 📱 Guía de Uso

### **Para Usuarios**

1. **Registro**: Crea una cuenta con tu nombre, email y contraseña
2. **Inicio de Sesión**: Accede con tus credenciales (autenticación JWT)
3. **Dashboard**: Visualiza tu resumen financiero con totales y gráficos
4. **Gestión de Ingresos**: Registra ingresos con categorías predefinidas
5. **Gestión de Gastos**: Registra gastos clasificando si son esenciales o no
6. **Reportes**: Genera reportes por período y categorías
7. **Configuración**: Personaliza moneda, idioma y notificaciones

### **Categorías Disponibles**

**Ingresos**: Salario, Ventas, Inversiones, Freelance, Bonos, Comisiones, Alquiler, Intereses, Dividendos, Reembolsos, Regalos, Otros

**Gastos**: Alimentación, Transporte, Vivienda, Servicios, Salud, Educación, Entretenimiento, Ropa, Tecnología, Deudas, Ahorro, Inversión, Impuestos, Seguros, Mantenimiento, Otros

## 🔗 API REST

### **Endpoints Principales**

#### **Autenticación** (`/api/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /me` - Obtener perfil del usuario
- `PUT /profile` - Actualizar perfil
- `PUT /change-password` - Cambiar contraseña
- `POST /logout` - Cerrar sesión

#### **Ingresos** (`/api/incomes`)
- `GET /` - Listar ingresos del usuario
- `POST /` - Crear nuevo ingreso
- `GET /:id` - Obtener ingreso específico
- `PUT /:id` - Actualizar ingreso
- `DELETE /:id` - Eliminar ingreso

#### **Gastos** (`/api/expenses`)
- `GET /` - Listar gastos del usuario
- `POST /` - Crear nuevo gasto
- `GET /:id` - Obtener gasto específico
- `PUT /:id` - Actualizar gasto
- `DELETE /:id` - Eliminar gasto

#### **Usuario** (`/api/users`)
- `GET /dashboard` - Obtener datos del dashboard
- `GET /report` - Generar reporte financiero
- `PUT /settings` - Actualizar configuración

### **Autenticación JWT**
Todos los endpoints (excepto `/api/auth`) requieren un token JWT válido en el header:
```
Authorization: Bearer <tu_jwt_token>
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 📚 Documentación

### **API Documentation**
La documentación completa de la API está disponible en `/api-docs` cuando la aplicación está ejecutándose. Incluye:
- Esquemas de datos detallados
- Ejemplos de requests y responses
- Códigos de error y sus significados
- Autenticación JWT

### **Documentación Técnica**
- **Diagramas UML**: Disponibles en la carpeta `/docs`
- **Arquitectura**: Documentada con diagramas de despliegue
- **Casos de Uso**: Especificaciones funcionales completas

## 🚀 Despliegue en Producción

### **Vercel (Recomendado)**
1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### **URLs de Producción**
- **Aplicación**: `https://financial-manager-application.vercel.app`
- **API Docs**: `https://financial-manager-application.vercel.app/api-docs`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia UPTC - Universidad Pedagógica y Tecnológica de Colombia.

## 👨‍💻 Autor

**Harold Guerrero**
- **Universidad**: UPTC - Universidad Pedagógica y Tecnológica de Colombia
- **Proyecto**: Financial Manager App
- **Competencia**: Diseño e implemento aplicaciones con base en las necesidades del negocio

## 🙏 Agradecimientos

- [Express.js](https://expressjs.com/) - Framework web para Node.js
- [MongoDB](https://www.mongodb.com/) - Base de datos NoSQL
- [Bootstrap](https://getbootstrap.com/) - Framework CSS
- [Vercel](https://vercel.com/) - Plataforma de hosting
- [JWT](https://jwt.io/) - Autenticación basada en tokens
- [Swagger](https://swagger.io/) - Documentación de API

---

**Desarrollado como parte de la competencia de desarrollo de aplicaciones web - UPTC**