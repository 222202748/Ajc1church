#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Church Management System Backend...');
console.log('=' .repeat(50));

// Check if MongoDB is installed
function checkMongoDB() {
  try {
    execSync('mongod --version', { stdio: 'pipe' });
    console.log('✅ MongoDB is installed');
    return true;
  } catch (error) {
    console.log('❌ MongoDB is not installed or not in PATH');
    console.log('💡 Please install MongoDB:');
    console.log('   - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/');
    console.log('   - macOS: brew install mongodb/brew/mongodb-community');
    console.log('   - Linux: https://docs.mongodb.com/manual/administration/install-on-linux/');
    console.log('   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    return false;
  }
}

// Check if MongoDB is running
function checkMongoDBRunning() {
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    
    return new Promise((resolve) => {
      client.connect()
        .then(() => {
          console.log('✅ MongoDB is running');
          client.close();
          resolve(true);
        })
        .catch(() => {
          console.log('❌ MongoDB is not running');
          console.log('💡 Start MongoDB:');
          console.log('   - Windows: net start MongoDB (or mongod)');
          console.log('   - macOS/Linux: sudo systemctl start mongod (or mongod)');
          console.log('   - Docker: docker start mongodb');
          resolve(false);
        });
    });
  } catch (error) {
    console.log('⚠️  Cannot check MongoDB status (mongodb package not installed yet)');
    return false;
  }
}

// Install dependencies
function installDependencies() {
  console.log('📦 Installing updated dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Create necessary directories
function createDirectories() {
  const dirs = [
    'uploads',
    'receipts',
    'logs',
    'temp'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

// Check environment file
function checkEnvironment() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found');
    console.log('💡 Please copy .env.example to .env and configure your settings');
  } else {
    console.log('✅ Environment file found');
  }
}

// Main setup function
async function setup() {
  try {
    console.log('1. Checking MongoDB installation...');
    const mongoInstalled = checkMongoDB();
    
    console.log('\n2. Installing dependencies...');
    installDependencies();
    
    console.log('\n3. Creating necessary directories...');
    createDirectories();
    
    console.log('\n4. Checking environment configuration...');
    checkEnvironment();
    
    if (mongoInstalled) {
      console.log('\n5. Checking MongoDB status...');
      await checkMongoDBRunning();
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Ensure MongoDB is running');
    console.log('   2. Configure your .env file');
    console.log('   3. Run: npm run dev');
    console.log('\n🔗 Useful commands:');
    console.log('   - Start server: npm run dev');
    console.log('   - Check logs: tail -f logs/app.log');
    console.log('   - Test connection: node scripts/test-connection.js');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();