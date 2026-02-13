// checkAdmins.js - Run this script to check if there are any Admin documents in the database
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
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
    process.exit(1);
  }
};

// Admin User Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'moderator'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

const checkAdmins = async () => {
  try {
    await connectDB();

    // Check if any admin exists
    const admins = await Admin.find();
    
    if (admins.length === 0) {
      console.log('No admin users found in the database');
      
      // Create a default admin user
      const adminData = {
        username: 'admin',
        email: 'admin@church.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      };

      // Hash password
      const bcrypt = require('bcryptjs');
      adminData.password = await bcrypt.hash(adminData.password, 12);

      // Create and save admin user
      const admin = new Admin(adminData);
      await admin.save();

      console.log('Default admin user created successfully!');
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Password: admin123');
    } else {
      console.log(`Found ${admins.length} admin users:`);
      admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`);
        console.log('  ID:', admin._id);
        console.log('  Username:', admin.username);
        console.log('  Email:', admin.email);
        console.log('  Role:', admin.role);
        console.log('  Active:', admin.isActive);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin users:', error);
    process.exit(1);
  }
};

checkAdmins();