# Financial Manager App

Una aplicación web completa para la gestión de finanzas personales y de negocio, construida con Node.js, Express, MongoDB y EJS.

## 🚀 Características

- **Gestión de Ingresos y Gastos**: Registra y categoriza tus transacciones financieras
- **Dashboard Interactivo**: Visualiza tu situación financiera con gráficos y estadísticas
- **Reportes Detallados**: Genera reportes por categorías, fechas y períodos
- **Autenticación Segura**: Sistema de login/registro con JWT
- **Interfaz Responsiva**: Diseño moderno que se adapta a todos los dispositivos
- **API RESTful**: Backend robusto con documentación Swagger

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: EJS, Bootstrap 5, JavaScript Vanilla
- **Autenticación**: JWT (JSON Web Tokens)
- **Documentación**: Swagger UI
- **Seguridad**: Helmet, CORS, Rate Limiting

## 📦 Instalación Local

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/financial-manager-app.git
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
   npm run dev  # Modo desarrollo
   npm start    # Modo producción
   ```

5. **Accede a la aplicación:**
   - Aplicación: `http://localhost:3000`
   - API Docs: `http://localhost:3000/api-docs`

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

## 🔧 Variables de Entorno

```bash
# Entorno
NODE_ENV=development

# Puerto
PORT=3000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/financial_manager

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📱 Uso

1. **Regístrate** en la aplicación
2. **Inicia sesión** con tus credenciales
3. **Agrega ingresos y gastos** desde el dashboard
4. **Visualiza reportes** en la sección de reportes
5. **Configura preferencias** en la sección de configuración

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 📚 API Documentation

La documentación de la API está disponible en `/api-docs` cuando la aplicación está ejecutándose.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Vercel](https://vercel.com/)