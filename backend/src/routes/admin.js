// routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Import Admin model
const Admin = require('../models/Admin');

// Middleware for authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for role-based access
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Admin Authentication Routes
router.post('/login', async (req, res) => {
  console.log('Login attempt received for:', req.body.username);
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });
    
    if (!admin) {
      console.log('Admin not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      console.log('Admin account inactive:', username);
      return res.status(401).json({ error: 'Account is inactive' });
    }
    
    console.log('Admin found, comparing password...');
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for:', username);
    res.json({
      success: true,
      token,
      role: admin.role,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Register admin (protected route - only existing admins can create new admins)
router.post('/register', authenticateAdmin, requireRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, role = 'moderator' } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }
    
    const admin = new Admin({
      username,
      email,
      password,
      role
    });
    
    await admin.save();
    
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current admin profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin,
        createdAt: req.admin.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Logout (optional - mainly for client-side token cleanup)
router.post('/logout', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get all admins (admin only)
router.get('/admins', authenticateAdmin, requireRole(['admin']), async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to get admins' });
  }
});

// Update admin status (admin only)
router.patch('/admins/:id/status', authenticateAdmin, requireRole(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    res.json({
      success: true,
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

// Change password
router.post('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isMatch = await req.admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    req.admin.password = newPassword;
    await req.admin.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = { router, authenticateAdmin, requireRole };