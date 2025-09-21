import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Configurar ES modules para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Importar rutas
import authRoutes from './routes/auth.js';
import incomeRoutes from './routes/income.js';
import expenseRoutes from './routes/expense.js';
import userRoutes from './routes/user.js';

// Importar middleware
import errorHandler from './middleware/errorHandler.js';

// Importar configuración de Swagger
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './config/swagger.js';

const app = express();

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../frontend/views'));

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Configuración de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Middleware para cookies
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP cada 15 minutos
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../frontend')));

// Importar middleware de autenticación de rutas
import { protectRoute, protectAdminRoute } from './middleware/routeAuth.js';

// Middleware para proteger archivos sensibles
app.use('/js/app.js', protectRoute);
app.use('/css/style.css', protectRoute);
app.use('/views', protectRoute);

// Configuración de Swagger (protegida con autenticación)
app.use('/api-docs', protectRoute, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Estado del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                     environment:
 *                       type: string
 *                     version:
 *                       type: string
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Estadísticas de administración
 *     tags: [Administración]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         incomes:
 *                           type: integer
 *                         expenses:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                     system:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                         memory:
 *                           type: object
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Token inválido o expirado
 *       403:
 *         description: Acceso denegado - se requieren permisos de administrador
 *       500:
 *         description: Error interno del servidor
 */
app.get('/api/admin/stats', protectAdminRoute, async (req, res) => {
  try {
    const { default: User } = await import('./models/User.js');
    const { default: Income } = await import('./models/Income.js');
    const { default: Expense } = await import('./models/Expense.js');
    
    // Obtener estadísticas generales del sistema
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalIncomes = await Income.countDocuments({ isActive: true });
    const totalExpenses = await Expense.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: totalUsers
        },
        transactions: {
          incomes: totalIncomes,
          expenses: totalExpenses,
          total: totalIncomes + totalExpenses
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        details: 'Error obteniendo estadísticas de administración'
      }
    });
  }
});

// Importar middleware de autenticación
import { authenticateToken } from './middleware/auth.js';

// Middleware para verificar autenticación en vistas
const checkAuth = (req, res, next) => {
  const token = (req.cookies && req.cookies.token) || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    console.log('No token found, redirecting to login');
    return res.redirect('/');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el token no esté expirado
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log('Token expired, redirecting to login');
      // Limpiar cookie expirada
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      return res.redirect('/');
    }
    
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    // Limpiar cookie inválida
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    return res.redirect('/');
  }
};

// Ruta de logout
app.get('/logout', (req, res) => {
  // Limpiar cookie del servidor
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  // Renderizar página de logout que limpia localStorage
  res.render('logout', { 
    title: 'Cerrando sesión - Financial Manager',
    currentPage: 'logout',
    user: null,
    isAuthenticated: false
  });
});

// Middleware para verificar si el usuario está autenticado (sin redirigir)
const checkAuthOptional = (req, res, next) => {
  const token = (req.cookies && req.cookies.token) || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    req.user = null;
    req.isAuthenticated = false;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el token no esté expirado
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }
    
    req.user = { id: decoded.userId };
    req.isAuthenticated = true;
    next();
  } catch (error) {
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

// Rutas para renderizar vistas EJS
app.get('/', checkAuthOptional, (req, res) => {
  // Si el usuario está autenticado, redirigir al dashboard
  if (req.isAuthenticated) {
    return res.redirect('/dashboard');
  }
  
  // Si no está autenticado, mostrar la página de inicio
  res.render('index', { 
    title: 'Financial Manager - Inicio',
    currentPage: 'home',
    user: null,
    isAuthenticated: false
  });
});

// Ruta de login
app.get('/login', checkAuthOptional, (req, res) => {
  // Si el usuario está autenticado, redirigir al dashboard
  if (req.isAuthenticated) {
    return res.redirect('/dashboard');
  }
  
  res.render('login', { 
    title: 'Iniciar Sesión - Financial Manager',
    currentPage: 'login',
    user: null,
    isAuthenticated: false
  });
});

// Ruta de registro
app.get('/register', checkAuthOptional, (req, res) => {
  // Si el usuario está autenticado, redirigir al dashboard
  if (req.isAuthenticated) {
    return res.redirect('/dashboard');
  }
  
  res.render('register', { 
    title: 'Crear Cuenta - Financial Manager',
    currentPage: 'register',
    user: null,
    isAuthenticated: false
  });
});

app.get('/dashboard', checkAuth, async (req, res) => {
  try {
    // Obtener datos del dashboard
    const { default: Income } = await import('./models/Income.js');
    const { default: Expense } = await import('./models/Expense.js');
    const { default: User } = await import('./models/User.js');
    
    const userId = req.user.id;
    
    // Obtener usuario con preferencias
    const user = await User.findById(userId).select('-password').lean();
    
    // Obtener totales
    const totalIncomeResult = await Income.getTotalByUser(userId);
    const totalExpenseResult = await Expense.getTotalByUser(userId);
    
    const totalIncome = totalIncomeResult[0]?.total || 0;
    const totalExpense = totalExpenseResult[0]?.total || 0;
    const balance = totalIncome - totalExpense;
    
    // Obtener transacciones recientes
    const recentIncomes = await Income.find({ user: userId, isActive: true })
      .sort({ date: -1 })
      .limit(5)
      .lean();
    
    const recentExpenses = await Expense.find({ user: userId, isActive: true })
      .sort({ date: -1 })
      .limit(5)
      .lean();
    
    res.render('dashboard', { 
      title: 'Dashboard - Financial Manager',
      currentPage: 'dashboard',
      user: user,
      isAuthenticated: true,
      userPreferences: user.preferences || {
        currency: 'USD',
        language: 'es',
        notifications: { email: false, push: false }
      },
      dashboardData: {
        summary: {
          totalIncome,
          totalExpense,
          balance,
          totalTransactions: recentIncomes.length + recentExpenses.length
        },
        recentIncomes,
        recentExpenses
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard', { 
      title: 'Dashboard - Financial Manager',
      currentPage: 'dashboard',
      user: req.user,
      isAuthenticated: true,
      userPreferences: {
        currency: 'USD',
        language: 'es',
        notifications: { email: false, push: false }
      },
      dashboardData: {
        summary: { totalIncome: 0, totalExpense: 0, balance: 0, totalTransactions: 0 },
        recentIncomes: [],
        recentExpenses: []
      },
      error: 'Error cargando datos del dashboard'
    });
  }
});

app.get('/incomes', checkAuth, async (req, res) => {
  try {
    const { default: Income } = await import('./models/Income.js');
    const { default: User } = await import('./models/User.js');
    const userId = req.user.id;
    
    // Obtener usuario con preferencias
    const user = await User.findById(userId).select('-password').lean();
    
    // Obtener ingresos del usuario
    const incomes = await Income.find({ user: userId, isActive: true })
      .sort({ date: -1 })
      .lean();
    
    res.render('incomes', { 
      title: 'Ingresos - Financial Manager',
      currentPage: 'incomes',
      user: user,
      isAuthenticated: true,
      userPreferences: user.preferences || {
        currency: 'USD',
        language: 'es',
        notifications: { email: false, push: false }
      },
      incomes: incomes
    });
  } catch (error) {
    console.error('Incomes error:', error);
    res.render('incomes', { 
      title: 'Ingresos - Financial Manager',
      currentPage: 'incomes',
      user: req.user,
      isAuthenticated: true,
      userPreferences: {
        currency: 'USD',
        language: 'es',
        notifications: { email: false, push: false }
      },
      incomes: [],
      error: 'Error cargando los ingresos'
    });
  }
});

app.get('/expenses', checkAuth, async (req, res) => {
  try {
    const { default: Expense } = await import('./models/Expense.js');
    const { default: User } = await import('./models/User.js');
    const userId = req.user.id;
    
    // Obtener usuario con preferencias
    const user = await User.findById(userId).select('-password').lean();
    
    // Obtener gastos del usuario
    const expenses = await Expense.find({ user: userId, isActive: true })
      .sort({ date: -1 })
      .lean();
    
    res.render('expenses', { 
      title: 'Gastos - Financial Manager',
      currentPage: 'expenses',
      user: user,
      isAuthenticated: true,
      userPreferences: user.preferences || {
        currency: 'USD',
        language: 'es',
        notifications: { email: false, push: false }
      },
      expenses: expenses
    });
  } catch (error) {
    console.error('Expenses error:', error);
    res.render('expenses', { 
      title: 'Gastos - Financial Manager',
      currentPage: 'expenses',
      user: req.user,
      isAuthenticated: true,
      userPreferences: {
        currency: 'USD',
        language: 'es',
        notifications: { email: false, push: false }
      },
      expenses: [],
      error: 'Error cargando los gastos'
    });
  }
});

app.get('/reports', checkAuth, async (req, res) => {
  try {
    const { default: Income } = await import('./models/Income.js');
    const { default: Expense } = await import('./models/Expense.js');
    const userId = req.user.id;
    
    // Obtener datos para reportes
    const incomeCategories = await Income.getByCategory(userId);
    const expenseCategories = await Expense.getByCategory(userId);
    
    res.render('reports', { 
      title: 'Reportes - Financial Manager',
      currentPage: 'reports',
      user: req.user,
      isAuthenticated: true,
      reportData: {
        incomeCategories,
        expenseCategories
      }
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.render('reports', { 
      title: 'Reportes - Financial Manager',
      currentPage: 'reports',
      user: req.user,
      isAuthenticated: true,
      reportData: {
        incomeCategories: [],
        expenseCategories: []
      },
      error: 'Error cargando datos de reportes'
    });
  }
});

app.get('/settings', checkAuth, async (req, res) => {
  try {
    const { default: User } = await import('./models/User.js');
    const userId = req.user.id;
    
    // Obtener datos del usuario
    const user = await User.findById(userId).select('-password').lean();
    
    res.render('settings', { 
      title: 'Configuración - Financial Manager',
      currentPage: 'settings',
      user: user,
      isAuthenticated: true,
      userPreferences: user.preferences || {
        currency: 'USD',
        language: 'es',
        notifications: {
          email: false,
          push: false
        }
      }
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.render('settings', { 
      title: 'Configuración - Financial Manager',
      currentPage: 'settings',
      user: req.user,
      isAuthenticated: true,
      userPreferences: {
        currency: 'USD',
        language: 'es',
        notifications: {
          email: false,
          push: false
        }
      },
      error: 'Error cargando configuración'
    });
  }
});

// Middleware de manejo de errores
app.use(errorHandler);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  process.exit(1);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📚 Documentación API disponible en http://localhost:${PORT}/api-docs`);
});

export default app;
