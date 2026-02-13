const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // Check if user is set by auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has admin role in token
    if (req.user.role === 'admin') {
      return next();
    }

    // If role not in token, fetch from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (err) {
    console.error('Admin auth error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = adminAuth;