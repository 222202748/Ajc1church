// createTestBlogPost.js - Run this script to create a test blog post
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Blog = require('../models/Blog');

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

const createTestBlogPost = async () => {
  try {
    await connectDB();

    // Find admin user
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('No admin user found. Please run createDefaultAdmin.js first.');
      process.exit(1);
    }

    // Check if test blog post already exists
    const existingBlog = await Blog.findOne({ title: 'Test Blog Post' });
    if (existingBlog) {
      console.log('Test blog post already exists:', existingBlog.title);
      process.exit(0);
    }

    // Create test blog post
    const blogData = {
      title: 'Test Blog Post',
      content: '<p>This is a test blog post to verify that the Admin model reference is working correctly.</p><p>The blog post should display properly on the frontend.</p>',
      excerpt: 'This is a test blog post to verify that the Admin model reference is working correctly.',
      category: 'sermon',
      tags: ['test', 'verification'],
      status: 'published',
      author: admin._id
    };

    const blog = new Blog(blogData);
    await blog.save();

    console.log('Test blog post created successfully!');
    console.log('Title:', blog.title);
    console.log('Author:', admin.username);
    console.log('Status:', blog.status);
    console.log('Published At:', blog.publishedAt);

    process.exit(0);
  } catch (error) {
    console.error('Error creating test blog post:', error);
    process.exit(1);
  }
};

createTestBlogPost();