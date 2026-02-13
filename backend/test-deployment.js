// test-deployment.js - Script to test backend components for deployment
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Test results storage
const results = {
  database: { status: 'pending', message: '' },
  models: { status: 'pending', message: '' },
  uploads: { status: 'pending', message: '' },
  environment: { status: 'pending', message: '' }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=== CHURCH WEBSITE BACKEND DEPLOYMENT TEST ===${colors.reset}`);
console.log(`${colors.cyan}Started: ${new Date().toLocaleString()}${colors.reset}`);
console.log('');

// 1. Test environment variables
function testEnvironmentVariables() {
  console.log(`${colors.blue}Testing environment variables...${colors.reset}`);
  
  const requiredVars = [
    'MONGODB_URI', 
    'PORT', 
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
    'CHURCH_EMAIL'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    results.environment.status = 'failed';
    results.environment.message = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.log(`${colors.red}✗ ${results.environment.message}${colors.reset}`);
  } else {
    results.environment.status = 'passed';
    results.environment.message = 'All required environment variables are set';
    console.log(`${colors.green}✓ ${results.environment.message}${colors.reset}`);
  }
  
  // Check NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${colors.yellow}⚠ NODE_ENV is not set to 'production' (current: ${process.env.NODE_ENV || 'not set'})${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ NODE_ENV is correctly set to 'production'${colors.reset}`);
  }
  
  console.log('');
}

// 2. Test database connection
async function testDatabaseConnection() {
  console.log(`${colors.blue}Testing database connection...${colors.reset}`);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    
    results.database.status = 'passed';
    results.database.message = `Successfully connected to MongoDB at ${mongoose.connection.host}:${mongoose.connection.port}`;
    console.log(`${colors.green}✓ ${results.database.message}${colors.reset}`);
    
    return true;
  } catch (error) {
    results.database.status = 'failed';
    results.database.message = `Failed to connect to MongoDB: ${error.message}`;
    console.log(`${colors.red}✗ ${results.database.message}${colors.reset}`);
    
    return false;
  }
}

// 3. Test models
async function testModels() {
  console.log(`${colors.blue}Testing database models...${colors.reset}`);
  
  const modelFiles = [
    { name: 'User', path: './src/models/User.js' },
    { name: 'Admin', path: './src/models/Admin.js' },
    { name: 'Blog', path: './src/models/Blog.js' },
    { name: 'Event', path: './src/models/Event.js' },
    { name: 'EventRegistration', path: './src/models/eventRegistration.js' }
  ];
  
  const modelResults = [];
  
  for (const model of modelFiles) {
    try {
      require(model.path);
      modelResults.push({ name: model.name, status: 'passed' });
      console.log(`${colors.green}✓ ${model.name} model loaded successfully${colors.reset}`);
    } catch (error) {
      modelResults.push({ name: model.name, status: 'failed', error: error.message });
      console.log(`${colors.red}✗ ${model.name} model failed to load: ${error.message}${colors.reset}`);
    }
  }
  
  const failedModels = modelResults.filter(m => m.status === 'failed');
  
  if (failedModels.length > 0) {
    results.models.status = 'failed';
    results.models.message = `${failedModels.length} models failed to load`;
    results.models.details = failedModels;
  } else {
    results.models.status = 'passed';
    results.models.message = 'All models loaded successfully';
  }
  
  console.log('');
}

// 4. Test upload directories
function testUploadDirectories() {
  console.log(`${colors.blue}Testing upload directories...${colors.reset}`);
  
  const uploadDirs = [
    { path: path.join(__dirname, 'uploads'), name: 'Main uploads' },
    { path: path.join(__dirname, 'uploads/blog-images'), name: 'Blog images' },
    { path: path.join(__dirname, 'uploads/videos'), name: 'Videos' }
  ];
  
  const dirResults = [];
  
  for (const dir of uploadDirs) {
    try {
      if (!fs.existsSync(dir.path)) {
        fs.mkdirSync(dir.path, { recursive: true });
        dirResults.push({ name: dir.name, status: 'created', path: dir.path });
        console.log(`${colors.yellow}⚠ ${dir.name} directory created at: ${dir.path}${colors.reset}`);
      } else {
        // Test write permissions
        const testFile = path.join(dir.path, '.test-write-permission');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
        dirResults.push({ name: dir.name, status: 'exists', path: dir.path });
        console.log(`${colors.green}✓ ${dir.name} directory exists and is writable: ${dir.path}${colors.reset}`);
      }
    } catch (error) {
      dirResults.push({ name: dir.name, status: 'error', error: error.message, path: dir.path });
      console.log(`${colors.red}✗ ${dir.name} directory error: ${error.message}${colors.reset}`);
    }
  }
  
  const failedDirs = dirResults.filter(d => d.status === 'error');
  
  if (failedDirs.length > 0) {
    results.uploads.status = 'failed';
    results.uploads.message = `${failedDirs.length} upload directories have issues`;
    results.uploads.details = failedDirs;
  } else {
    results.uploads.status = 'passed';
    results.uploads.message = 'All upload directories are ready';
  }
  
  console.log('');
}

// Run all tests
async function runTests() {
  try {
    // Test environment variables
    testEnvironmentVariables();
    
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    
    // Only test models if database connection succeeded
    if (dbConnected) {
      await testModels();
    }
    
    // Test upload directories
    testUploadDirectories();
    
    // Print summary
    console.log(`${colors.cyan}=== TEST SUMMARY ===${colors.reset}`);
    Object.entries(results).forEach(([test, result]) => {
      const color = result.status === 'passed' ? colors.green : 
                   result.status === 'failed' ? colors.red : colors.yellow;
      console.log(`${color}${test}: ${result.status.toUpperCase()} - ${result.message}${colors.reset}`);
    });
    
    // Disconnect from database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log(`${colors.blue}Disconnected from MongoDB${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Test execution error: ${error.message}${colors.reset}`);
  }
}

// Run the tests
runTests();