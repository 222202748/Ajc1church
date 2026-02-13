const mongoose = require('mongoose');

// MongoDB connection configuration
const connectDB = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 15000, // Increased timeout for Atlas
      socketTimeoutMS: 45000,
      maxPoolSize: 50, // Increased pool size for better performance
      autoIndex: true,
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      mongoOptions
    );

    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit process here, let the caller handle retries
    throw error;
  }
};

// Handle MongoDB connection events
const setupConnectionEvents = () => {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully');
  });

  mongoose.connection.on('close', () => {
    console.log('🔒 MongoDB connection closed');
  });

  // Handle application termination signals
  const gracefulShutdown = async (signal) => {
    try {
      console.log(`\nReceived ${signal}. Closing MongoDB connection...`);
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

// Check if MongoDB is running
const checkMongoDBStatus = async () => {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, attempting to connect...');
      await connectDB();
    }
    
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    console.log('🏓 MongoDB ping successful:', result);
    return true;
  } catch (error) {
    console.error('❌ MongoDB ping failed:', error.message);
    console.log('⚠️ Please ensure MongoDB is running on your system');
    return false;
  }
};

// Retry connection with exponential backoff
const retryConnection = (retries = process.env.MONGODB_RETRY_ATTEMPTS || 5, delay = process.env.MONGODB_RETRY_DELAY || 1000) => {
  // Convert string values to numbers if they come from env vars
  const maxRetries = typeof retries === 'string' ? parseInt(retries, 10) : retries;
  const retryDelay = typeof delay === 'string' ? parseInt(delay, 10) : delay;
  
  return new Promise((resolve, reject) => {
    const attempt = async (retriesLeft) => {
      try {
        const conn = await connectDB();
        resolve(conn);
      } catch (err) {
        if (retriesLeft === 0) {
          console.error('❌ Maximum retries reached. Could not connect to MongoDB.');
          return reject(err);
        }
        
        console.log(`⏱️ Retrying connection in ${retryDelay/1000}s... (${retriesLeft} attempts left)`);
        setTimeout(() => attempt(retriesLeft - 1), retryDelay);
      }
    };
    
    attempt(maxRetries);
  });
};

module.exports = {
  connectDB,
  setupConnectionEvents,
  checkMongoDBStatus,
  retryConnection
};