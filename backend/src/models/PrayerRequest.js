const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  requestType: { 
    type: String, 
    required: true,
    enum: ['personal', 'family', 'health', 'financial', 'spiritual', 'other']
  },
  prayerRequest: { type: String, required: true },
  isConfidential: { type: Boolean, default: false },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'praying', 'answered', 'archived']
  }
}, { timestamps: true });

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
