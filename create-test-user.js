import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Schema de Usuario (copiado de tu modelo)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'COP', 'MXN', 'ARS', 'BRL']
    },
    language: {
      type: String,
      default: 'es',
      enum: ['es', 'en', 'pt']
    },
    notifications: {
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('⚠️  El usuario test@example.com ya existe');
      console.log('Usuario:', existingUser);
      return;
    }
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('Test123!@#', 12);
    
    const testUser = new User({
      name: 'Usuario de Prueba',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: true,
      preferences: {
        currency: 'COP',
        language: 'es',
        notifications: {
          email: false,
          push: false
        }
      }
    });
    
    await testUser.save();
    
    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log('Email: test@example.com');
    console.log('Password: Test123!@#');
    console.log('Usuario:', testUser);
    
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createTestUser();
