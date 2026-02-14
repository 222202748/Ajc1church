const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  pastor: {
    type: String,
    default: "Pastor SILUVAI RAJA",
    trim: true
  },
  category: {
    type: String,
    default: "Sermon",
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  videoUrl: {
    type: String,
    trim: true
  },
  audioUrl: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  size: {
    type: Number
  },
  mimetype: {
    type: String
  },
  duration: {
    type: String
  }
}, {
  timestamps: true
});

const Sermon = mongoose.model('Sermon', sermonSchema);

module.exports = Sermon;
