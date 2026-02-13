const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Admin = require('../models/Admin');

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const username = 'admin';
    const password = 'admin123'; // Default password from server.js comment

    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    console.log('🔍 Admin found, comparing password...');
    const isMatch = await admin.comparePassword(password);
    
    if (isMatch) {
      console.log('✅ Password match successful!');
    } else {
      console.log('❌ Password mismatch');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testLogin();
