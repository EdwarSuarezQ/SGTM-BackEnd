import dotenv from "dotenv";

dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  console.error('See .env.example for reference.\n');
  process.exit(1);
}

// Configuración general
export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Configuración de autenticación JWT
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "12h";

// Exportar todo por defecto para compatibilidad
export default {
  ...config,
  JWT_SECRET,
  JWT_EXPIRE,
};
