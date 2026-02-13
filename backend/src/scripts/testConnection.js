// Test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const { connectDB, setupConnectionEvents, retryConnection } = require('../config/database');

console.log('🔍 Testing MongoDB connection...');

// Setup connection events
setupConnectionEvents();

// Test connection with retry
(async () => {
  try {
    const retryAttempts = process.env.MONGODB_RETRY_ATTEMPTS || 5;
    const retryDelay = process.env.MONGODB_RETRY_DELAY || 2000;
    
    console.log(`⏱️ Attempting connection with ${retryAttempts} retries, ${retryDelay}ms delay`);
    await retryConnection(retryAttempts, retryDelay);
    
    console.log('✅ MongoDB connection test successful!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Close connection after successful test
    setTimeout(() => {
      mongoose.connection.close();
      console.log('🔒 Connection closed after successful test');
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    process.exit(1);
  }
})();