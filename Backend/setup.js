#!/usr/bin/env node

/**
 * Setup script for SynergySphere Backend
 * Run: node setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SynergySphere Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env template...');
  const envTemplate = `# Database Configuration
HOST=localhost
DB_PORT=3306
USER=your_db_username
PASSWORD=your_db_password
DATABASE=synergyphere

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env template created! Please update with your configuration.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create upload directories
console.log('📁 Creating upload directories...');
const uploadDirs = [
  'uploads',
  'uploads/avatars',
  'uploads/projects',
  'uploads/tasks'
];

uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   Created: ${dir}`);
  }
});

console.log('✅ Upload directories created!\n');

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log('📝 Created logs directory\n');
}

console.log('🎉 Setup completed successfully!\n');
console.log('Next steps:');
console.log('1. Update your .env file with correct database credentials');
console.log('2. Make sure your MySQL database is running');
console.log('3. Run: npm run dev (for development) or npm start (for production)');
console.log('\nAPI will be available at: http://localhost:5000');
console.log('Health check: http://localhost:5000/health');
console.log('API docs: http://localhost:5000/docs\n');
