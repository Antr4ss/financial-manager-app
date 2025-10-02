const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Función para probar una ruta
async function testRoute(method, path, expectedStatus, description) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${path}`,
      validateStatus: () => true // No lanzar error para códigos de estado no 2xx
    });
    
    const status = response.status;
    const isProtected = status === 401 || status === 403;
    
    console.log(`${method.toUpperCase()} ${path}`);
    console.log(`  Esperado: ${expectedStatus} | Obtenido: ${status} | Protegido: ${isProtected ? '✅' : '❌'}`);
    console.log(`  Descripción: ${description}`);
    
    if (status === expectedStatus) {
      console.log('  ✅ PASS\n');
      return true;
    } else {
      console.log('  ❌ FAIL\n');
      return false;
    }
  } catch (error) {
    console.log(`${method.toUpperCase()} ${path}`);
    console.log(`  Error: ${error.message}`);
    console.log('  ❌ FAIL\n');
    return false;
  }
}

// Función principal de pruebas
async function runAuthTests() {
  console.log('🔐 PRUEBAS DE AUTENTICACIÓN DEL BACKEND\n');
  console.log('=' .repeat(50));
  
  const tests = [
    // Rutas públicas (no requieren autenticación)
    { method: 'get', path: '/api/health', expectedStatus: 200, description: 'Health check - público' },
    { method: 'post', path: '/api/auth/register', expectedStatus: 400, description: 'Registro - público (400 por datos faltantes)' },
    { method: 'post', path: '/api/auth/login', expectedStatus: 400, description: 'Login - público (400 por datos faltantes)' },
    
    // Rutas protegidas (requieren autenticación)
    { method: 'get', path: '/api/incomes', expectedStatus: 401, description: 'Ingresos - protegido' },
    { method: 'get', path: '/api/expenses', expectedStatus: 401, description: 'Gastos - protegido' },
    { method: 'get', path: '/api/users/dashboard', expectedStatus: 401, description: 'Dashboard - protegido' },
    { method: 'get', path: '/api/users/settings', expectedStatus: 401, description: 'Configuración - protegido' },
    { method: 'get', path: '/api/users/report', expectedStatus: 401, description: 'Reporte - protegido' },
    { method: 'get', path: '/api/auth/me', expectedStatus: 401, description: 'Perfil - protegido' },
    { method: 'put', path: '/api/auth/profile', expectedStatus: 401, description: 'Actualizar perfil - protegido' },
    { method: 'post', path: '/api/auth/logout', expectedStatus: 401, description: 'Logout - protegido' },
    
    // Rutas de administración (requieren rol de admin)
    { method: 'get', path: '/api/admin/stats', expectedStatus: 401, description: 'Estadísticas admin - protegido' },
    
    // Documentación protegida
    { method: 'get', path: '/api-docs', expectedStatus: 401, description: 'Documentación Swagger - protegido' },
    
    // Archivos estáticos protegidos
    { method: 'get', path: '/js/app.js', expectedStatus: 401, description: 'JavaScript principal - protegido' },
    { method: 'get', path: '/css/style.css', expectedStatus: 401, description: 'CSS principal - protegido' },
    { method: 'get', path: '/views', expectedStatus: 401, description: 'Vistas - protegido' },
    
    // Vistas EJS (requieren autenticación)
    { method: 'get', path: '/dashboard', expectedStatus: 302, description: 'Dashboard - redirige a login' },
    { method: 'get', path: '/incomes', expectedStatus: 302, description: 'Ingresos - redirige a login' },
    { method: 'get', path: '/expenses', expectedStatus: 302, description: 'Gastos - redirige a login' },
    { method: 'get', path: '/reports', expectedStatus: 302, description: 'Reportes - redirige a login' },
    { method: 'get', path: '/settings', expectedStatus: 302, description: 'Configuración - redirige a login' },
    
    // Vistas públicas
    { method: 'get', path: '/', expectedStatus: 200, description: 'Página principal - público' },
    { method: 'get', path: '/login', expectedStatus: 200, description: 'Login - público' },
    { method: 'get', path: '/register', expectedStatus: 200, description: 'Registro - público' },
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await testRoute(test.method, test.path, test.expectedStatus, test.description);
    if (result) passed++;
  }
  
  console.log('=' .repeat(50));
  console.log(`📊 RESULTADOS: ${passed}/${total} pruebas pasaron`);
  
  if (passed === total) {
    console.log('🎉 ¡Todas las rutas están correctamente protegidas!');
  } else {
    console.log('⚠️  Algunas rutas necesitan revisión de seguridad');
  }
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  runAuthTests().catch(console.error);
}

module.exports = { runAuthTests, testRoute };
