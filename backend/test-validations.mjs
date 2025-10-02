const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Función para probar validaciones
async function testValidation(endpoint, method, data, expectedStatus, description) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      validateStatus: () => true
    });
    
    const status = response.status;
    const isExpected = status === expectedStatus;
    
    console.log(`${method.toUpperCase()} ${endpoint}`);
    console.log(`  Esperado: ${expectedStatus} | Obtenido: ${status} | ${isExpected ? '✅' : '❌'}`);
    console.log(`  Descripción: ${description}`);
    
    if (response.data && response.data.error) {
      console.log(`  Error: ${response.data.error.message}`);
      if (response.data.error.validationErrors) {
        console.log(`  Errores de validación: ${response.data.error.validationErrors.length}`);
      }
    }
    
    console.log('');
    return isExpected;
  } catch (error) {
    console.log(`${method.toUpperCase()} ${endpoint}`);
    console.log(`  Error: ${error.message}`);
    console.log('  ❌ FAIL\n');
    return false;
  }
}

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    // Primero registrar un usuario de prueba
    await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Usuario Prueba',
      email: 'test@example.com',
      password: 'Test123!@#'
    });
    
    // Luego hacer login
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!@#'
    });
    
    return response.data.data.token;
  } catch (error) {
    console.error('Error obteniendo token:', error.message);
    return null;
  }
}

// Función principal de pruebas
async function runValidationTests() {
  console.log('🔍 PRUEBAS DE VALIDACIÓN DEL SERVIDOR\n');
  console.log('=' .repeat(60));
  
  const token = await getAuthToken();
  if (!token) {
    console.log('❌ No se pudo obtener token de autenticación');
    return;
  }
  
  const headers = { 'Authorization': `Bearer ${token}` };
  
  const tests = [
    // Pruebas de registro
    {
      endpoint: '/api/auth/register',
      method: 'post',
      data: { name: 'A', email: 'invalid-email', password: '123' },
      expectedStatus: 400,
      description: 'Registro con datos inválidos'
    },
    {
      endpoint: '/api/auth/register',
      method: 'post',
      data: { name: 'Usuario', email: 'test@example.com', password: 'Test123!@#' },
      expectedStatus: 400,
      description: 'Registro con email duplicado'
    },
    {
      endpoint: '/api/auth/register',
      method: 'post',
      data: { name: 'Usuario', email: 'new@example.com', password: 'weak' },
      expectedStatus: 400,
      description: 'Registro con contraseña débil'
    },
    
    // Pruebas de login
    {
      endpoint: '/api/auth/login',
      method: 'post',
      data: { email: 'nonexistent@example.com', password: 'password' },
      expectedStatus: 400,
      description: 'Login con email inexistente'
    },
    {
      endpoint: '/api/auth/login',
      method: 'post',
      data: { email: 'test@example.com', password: 'wrongpassword' },
      expectedStatus: 401,
      description: 'Login con contraseña incorrecta'
    },
    
    // Pruebas de creación de ingresos
    {
      endpoint: '/api/incomes',
      method: 'post',
      data: { description: '', amount: -100, category: 'invalid' },
      expectedStatus: 400,
      description: 'Crear ingreso con datos inválidos',
      headers
    },
    {
      endpoint: '/api/incomes',
      method: 'post',
      data: { description: 'Test', amount: 1000001, category: 'salario' },
      expectedStatus: 400,
      description: 'Crear ingreso con monto excesivo',
      headers
    },
    {
      endpoint: '/api/incomes',
      method: 'post',
      data: { description: 'Test', amount: 100, category: 'salario', date: '2025-12-31' },
      expectedStatus: 400,
      description: 'Crear ingreso con fecha futura excesiva',
      headers
    },
    {
      endpoint: '/api/incomes',
      method: 'post',
      data: { description: 'Test', amount: 100, category: 'salario', tags: Array(11).fill('tag') },
      expectedStatus: 400,
      description: 'Crear ingreso con demasiadas etiquetas',
      headers
    },
    
    // Pruebas de consultas
    {
      endpoint: '/api/incomes?page=0&limit=200',
      method: 'get',
      data: {},
      expectedStatus: 400,
      description: 'Consultar ingresos con parámetros inválidos',
      headers
    },
    {
      endpoint: '/api/incomes?startDate=2024-01-01&endDate=2023-12-31',
      method: 'get',
      data: {},
      expectedStatus: 400,
      description: 'Consultar ingresos con rango de fechas inválido',
      headers
    },
    
    // Pruebas de acceso a recursos
    {
      endpoint: '/api/incomes/invalid-id',
      method: 'get',
      data: {},
      expectedStatus: 400,
      description: 'Obtener ingreso con ID inválido',
      headers
    },
    {
      endpoint: '/api/incomes/507f1f77bcf86cd799439011',
      method: 'get',
      data: {},
      expectedStatus: 404,
      description: 'Obtener ingreso inexistente',
      headers
    },
    
    // Pruebas de inyección de código
    {
      endpoint: '/api/incomes',
      method: 'post',
      data: { 
        description: '<script>alert("xss")</script>', 
        amount: 100, 
        category: 'salario' 
      },
      expectedStatus: 400,
      description: 'Crear ingreso con código malicioso',
      headers
    },
    
    // Pruebas de límites de datos
    {
      endpoint: '/api/incomes',
      method: 'post',
      data: { 
        description: 'A'.repeat(201), 
        amount: 100, 
        category: 'salario' 
      },
      expectedStatus: 400,
      description: 'Crear ingreso con descripción muy larga',
      headers
    },
    
    // Pruebas de tipo de contenido
    {
      endpoint: '/api/incomes',
      method: 'post',
      data: 'invalid json',
      expectedStatus: 400,
      description: 'Crear ingreso con tipo de contenido inválido',
      headers: { ...headers, 'Content-Type': 'text/plain' }
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await testValidation(
      test.endpoint, 
      test.method, 
      test.data, 
      test.expectedStatus, 
      test.description,
      test.headers
    );
    if (result) passed++;
  }
  
  console.log('=' .repeat(60));
  console.log(`📊 RESULTADOS: ${passed}/${total} pruebas pasaron`);
  
  if (passed === total) {
    console.log('🎉 ¡Todas las validaciones están funcionando correctamente!');
  } else {
    console.log('⚠️  Algunas validaciones necesitan revisión');
  }
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  runValidationTests().catch(console.error);
}

module.exports = { runValidationTests, testValidation };
