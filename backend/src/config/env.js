const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to process.env

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cognistock',
  JWT_SECRET: process.env.JWT_SECRET || 'cognistock_jwt_super_secret_production_key_change_in_env_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../storage/uploads'),
  REPORT_DIR: process.env.REPORT_DIR || path.resolve(__dirname, '../../storage/reports'),
  MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB || '20', 10),
  DEMO_SEED_ENABLED: process.env.DEMO_SEED_ENABLED !== 'false',
  COGNISTOCK_DEMO_PASSWORD: process.env.COGNISTOCK_DEMO_PASSWORD || 'CogniStockDemo2026!'
};

module.exports = env;
