const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 200
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  featuredImage: {
    type: String, // URL to the uploaded image
    default: null
  },
  featuredVideo: {
    type: String, // URL to the uploaded video
    default: null
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'both'],
    default: 'image'
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    caption: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  category: {
    type: String,
    required: true,
    enum: ['sermon', 'event', 'announcement', 'testimony', 'prayer', 'community', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index for search functionality
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Virtual for URL slug
blogSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
});

// Pre-save middleware to set publishedAt when status changes to published
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);