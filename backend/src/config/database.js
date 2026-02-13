const mongoose = require('mongoose');

// MongoDB connection configuration
const connectDB = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 10000, // Increased timeout from 5s to 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10 // Maintain up to 10 socket connections
      // Removed deprecated options: autoReconnect, reconnectTries, reconnectInterval, useNewUrlParser, useUnifiedTopology
      // MongoDB driver now handles reconnection and parsing automatically in newer versions
      // See: https://mongoosejs.com/docs/connections.html#connection-events
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church_donations',
      mongoOptions
    );

    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}:${conn.connection.port}`);

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Please ensure MongoDB is running on your system');
    console.log('💡 To start MongoDB:');
    console.log('   - Windows: net start MongoDB (or mongod --dbpath C:\\data\\db)');
    console.log('   - macOS/Linux: sudo systemctl start mongod (or mongod --dbpath /data/db)');
    console.log('   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    process.exit(1);
  }
};

// Handle MongoDB connection events
const setupConnectionEvents = () => {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
    // Attempt to reconnect after error
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      connectDB().catch(err => console.error('Failed reconnection attempt:', err));
    }, 5000);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
    // Attempt to reconnect after disconnection
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect to MongoDB after disconnection...');
      connectDB().catch(err => console.error('Failed reconnection attempt:', err));
    }, 5000);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully');
  });

  mongoose.connection.on('close', () => {
    console.log('🔒 MongoDB connection closed');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
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