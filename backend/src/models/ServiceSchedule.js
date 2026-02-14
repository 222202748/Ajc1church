const mongoose = require('mongoose');

const serviceScheduleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['weekly', 'special', 'upcoming'],
    required: true
  },
  day: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: function() { return this.type === 'weekly'; }
  },
  date: {
    type: Date,
    required: function() { return this.type !== 'weekly'; }
  },
  time: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceSchedule', serviceScheduleSchema);
