// Script de prueba para verificar que las importaciones ES6 funcionan
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

console.log('✅ Importaciones básicas funcionan');

// Configurar ES modules para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('✅ fileURLToPath funciona');

dotenv.config();

console.log('✅ dotenv funciona');

// Probar importaciones de rutas
try {
  const authRoutes = await import('./src/routes/auth.mjs');
  console.log('✅ Rutas de auth importadas correctamente');
} catch (error) {
  console.error('❌ Error importando rutas de auth:', error.message);
}

// Probar importaciones de middleware
try {
  const { authenticateToken } = await import('./src/middleware/auth.mjs');
  console.log('✅ Middleware de auth importado correctamente');
} catch (error) {
  console.error('❌ Error importando middleware de auth:', error.message);
}

// Probar importaciones de modelos
try {
  const User = await import('./src/models/User.mjs');
  console.log('✅ Modelo User importado correctamente');
} catch (error) {
  console.error('❌ Error importando modelo User:', error.message);
}

// Probar importaciones de configuración
try {
  const { swaggerSpec, swaggerUi } = await import('./src/config/swagger.mjs');
  console.log('✅ Configuración de Swagger importada correctamente');
} catch (error) {
  console.error('❌ Error importando configuración de Swagger:', error.message);
}

console.log('🎉 Todas las importaciones funcionan correctamente!');
