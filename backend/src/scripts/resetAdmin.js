const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Admin = require('../models/Admin');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin not found, creating new one...');
      const newAdmin = new Admin({
        username: 'admin',
        email: 'admin@church.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      await newAdmin.save();
      console.log('✅ Admin created with password: admin123');
    } else {
      console.log('🔍 Admin found, updating password...');
      admin.password = 'admin123';
      await admin.save();
      console.log('✅ Admin password reset to: admin123');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetAdmin();
