const mongoose = require('mongoose');

/**
 * Configuración de la conexión a MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Configuración de eventos de conexión
 */
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose desconectado de MongoDB');
});

// Cerrar conexión cuando la aplicación se cierre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📡 Conexión a MongoDB cerrada por terminación de la aplicación');
  process.exit(0);
});

module.exports = connectDB;
