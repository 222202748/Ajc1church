// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'CHURCH_EMAIL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('👉 Please set these variables in your .env file or production environment (e.g., Render Dashboard).');
  // In production, we should probably exit, but let's just log for now to avoid crashing unexpectedly
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Server starting in production with missing environment variables. Some features will fail.');
  }
}

// Import database configuration
const { setupConnectionEvents, retryConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/api/upload/videos', express.static(path.join(__dirname, '../uploads/videos'), {
  setHeaders: (res, _path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    res.set('Accept-Ranges', 'bytes');
  }
}));
app.use('/api/upload/images', express.static(path.join(__dirname, '../uploads/blog-images')));
app.use('/api/upload/misc', express.static(path.join(__dirname, '../uploads/misc')));

// Initialize database connection with retry mechanism
(async () => {
  try {
    // Use environment variables for retry configuration
    const retryAttempts = process.env.MONGODB_RETRY_ATTEMPTS || 5;
    const retryDelay = process.env.MONGODB_RETRY_DELAY || 2000;
    
    await retryConnection(retryAttempts, retryDelay);
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB after multiple attempts:', error);
    console.log('⚠️ Server will continue to run, but database operations may fail');
  }
})();

// Setup MongoDB connection event handlers
setupConnectionEvents();

// Donation Schema
const donationSchema = new mongoose.Schema({
  donorInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    anonymous: { type: Boolean, default: false }
  },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'verified'],
    default: 'pending'
  },
  transactionId: { type: String, unique: true },
  paymentId: String, // Gateway payment ID
  orderId: String, // Gateway order ID
  razorpaySignature: String,
  paytmTxnToken: String,
  receiptNumber: { type: String, unique: true },
  donationDate: { type: Date, default: Date.now },
  verifiedAt: Date,
  receiptSent: { type: Boolean, default: false },
  notes: String
}, {
  timestamps: true
});

// Generate receipt number
donationSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.receiptNumber = `CHU${year}${String(count + 1).padStart(6, '0')}`;
  }
  if (!this.transactionId) {
    this.transactionId = crypto.randomBytes(16).toString('hex');
  }
  next();
});

const Donation = mongoose.model('Donation', donationSchema);

/*
// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
*/

// Helper Functions (Currently unused)
/*
const generateReceiptPDF = async (donation) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `receipt_${donation.receiptNumber}.pdf`;
    const filepath = path.join(__dirname, 'receipts', filename);
    
    // Ensure receipts directory exists
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }
    
    doc.pipe(fs.createWriteStream(filepath));
    
    // Header
    doc.fontSize(20).text('Church Ministry', 50, 50);
    doc.fontSize(16).text('Donation Receipt', 50, 80);
    doc.fontSize(12).text(`Receipt No: ${donation.receiptNumber}`, 50, 110);
    doc.text(`Date: ${new Date(donation.donationDate).toLocaleDateString()}`, 50, 130);
    // Donor Information
    doc.fontSize(14).text('Donor Information:', 50, 170);
    doc.fontSize(12)
       .text(`Name: ${donation.donorInfo.anonymous ? 'Anonymous' : donation.donorInfo.name}`, 50, 190)
       .text(`Email: ${donation.donorInfo.email}`, 50, 210)
       .text(`Phone: ${donation.donorInfo.phone}`, 50, 230);
    // Donation Details
    doc.fontSize(14).text('Donation Details:', 50, 270);
    doc.fontSize(12)
       .text(`Amount: ₹${donation.amount.toLocaleString()}`, 50, 290)
       .text(`Purpose: ${donation.purpose}`, 50, 310)
       .text(`Payment Method: ${donation.paymentMethod}`, 50, 330)
       .text(`Transaction ID: ${donation.transactionId}`, 50, 350);
    // Tax Information
    doc.fontSize(10)
       .text('This donation is eligible for tax deduction under Section 80G of the Income Tax Act.', 50, 400)
       .text('Thank you for your generous contribution to our ministry.', 50, 420);
    
    // Footer
    doc.fontSize(10)
       .text('Church Ministry | Address | Phone | Email', 50, 500);
    
    doc.end();
    
    doc.on('end', () => resolve(filepath));
    doc.on('error', reject);
  });
};

const sendReceiptEmail = async (donation, receiptPath) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: donation.donorInfo.email,
    subject: `Donation Receipt - ${donation.receiptNumber}`,
    html: `
      <h2>Thank you for your donation!</h2>
      <p>Dear ${donation.donorInfo.anonymous ? 'Anonymous Donor' : donation.donorInfo.name},</p>
      <p>We have received your generous donation of <strong>₹${donation.amount.toLocaleString()}</strong> for <strong>${donation.purpose}</strong>.</p>
      <p><strong>Receipt Number:</strong> ${donation.receiptNumber}</p>
      <p><strong>Transaction ID:</strong> ${donation.transactionId}</p>
      <p><strong>Date:</strong> ${new Date(donation.donationDate).toLocaleDateString()}</p>
      <p>Please find your tax-deductible receipt attached.</p>
      <p>God bless you!</p>
      <p>Church Ministry Team</p>
    `,
    attachments: [
      {
        filename: `receipt_${donation.receiptNumber}.pdf`,
        path: receiptPath
      }
    ]
  };
  
  await transporter.sendMail(mailOptions);
};
*/

// Import Routes
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');
const eventRegistrationRoutes = require('./routes/eventRegistrationRoutes');
const uploadRoutes = require('./routes/upload');
const eventRoutes = require('./routes/events');
const contactRoutes = require('./routes/contact');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const uploadDirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/videos'),
    path.join(__dirname, '../uploads/blog-images'),
    path.join(__dirname, '../uploads/misc')
  ];
  
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created upload directory: ${dir}`);
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

// Routes
app.use('/api/admin', adminRoutes.router);
app.get('/api/admin/check', (req, res) => res.json({ status: 'Admin routes active' }));
app.use('/api/blog', blogRoutes);
app.use('/api/eventregistration', eventRegistrationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);

// Create donation (initial step)
app.post('/api/donations', async (req, res) => {
  try {
    const { donorInfo, amount, purpose, paymentMethod } = req.body;
    
    // Validate required fields
    if (!donorInfo?.name || !donorInfo?.email || !amount || !purpose || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const donation = new Donation({
      donorInfo,
      amount: parseFloat(amount),
      purpose,
      paymentMethod,
      paymentStatus: 'pending'
    });
    
    await donation.save();
    
    res.status(201).json({
      success: true,
      donation: {
        id: donation._id,
        receiptNumber: donation.receiptNumber,
        transactionId: donation.transactionId,
        amount: donation.amount,
        purpose: donation.purpose,
        paymentMethod: donation.paymentMethod
      }
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Admin donation management routes
app.get('/api/admin/donations', adminRoutes.authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, purpose, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.paymentStatus = status;
    }
    
    // Filter by purpose
    if (purpose && purpose !== 'all') {
      query.purpose = purpose;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.donationDate = {};
      if (startDate) query.donationDate.$gte = new Date(startDate);
      if (endDate) query.donationDate.$lte = new Date(endDate);
    }
    
    const donations = await Donation.find(query)
      .sort({ donationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Donation.countDocuments(query);
    
    res.json({
      success: true,
      donations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Update donation status
app.patch('/api/admin/donations/:id/status', adminRoutes.authenticateAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus: status,
        notes: notes || undefined,
        verifiedAt: status === 'verified' ? new Date() : undefined
      },
      { new: true }
    );
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    res.json({
      success: true,
      message: 'Donation status updated successfully',
      donation
    });
  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({ error: 'Failed to update donation status' });
  }
});

// Get donation statistics
app.get('/api/admin/donations/stats', adminRoutes.authenticateAdmin, async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          verifiedCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'verified'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const purposeStats = await Donation.aggregate([
      {
        $group: {
          _id: '$purpose',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || {
        totalDonations: 0,
        totalAmount: 0,
        pendingCount: 0,
        completedCount: 0,
        verifiedCount: 0,
        failedCount: 0
      },
      purposeStats
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

// Server listen
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// Admin user created: admin@church.com / admin123
