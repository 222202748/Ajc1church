const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Blog = require('../models/Blog');
const { authenticateAdmin } = require('./admin');
const { mixedMediaUpload } = require('../middleware/videoUpload');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/blog-images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Serve uploaded images
router.use('/images', express.static(path.join(__dirname, '../../uploads/blog-images')));

// Serve uploaded videos
router.use('/videos', express.static(path.join(__dirname, '../../uploads/videos')));

// GET /api/blog/latest - Get the latest published blog (public)
router.get('/latest', async (req, res) => {
  try {
    const blog = await Blog.findOne({ status: 'published' })
      .populate('author', 'username')
      .sort({ publishedAt: -1 });
    
    if (!blog) {
      return res.status(404).json({ error: 'No published blogs found' });
    }
    
    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching latest blog:', error);
    res.status(500).json({ error: 'Failed to fetch latest blog' });
  }
});

// GET /api/blog - Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, tags } = req.query;
    const query = { status: 'published' };
    
    // Add filters
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'username')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Exclude full content for list view
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// GET /api/blog/:id - Get single blog by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username');
    
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Admin routes (protected)
// GET /api/blog/admin/all - Get all blogs for admin
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const query = {};
    
    // Add filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// POST /api/blog/admin/create - Create new blog
router.post('/admin/create', authenticateAdmin, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status, seo } = req.body;
    
    // Validate required fields
    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const blogData = {
      title,
      content,
      excerpt,
      category,
      author: req.admin._id,
      status: status || 'draft'
    };
    
    // Handle tags
    if (tags) {
      blogData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    // Handle SEO data
    if (seo) {
      try {
        blogData.seo = typeof seo === 'string' ? JSON.parse(seo) : seo;
      } catch (e) {
        console.warn('Invalid SEO data:', e);
      }
    }
    
    // Handle uploaded image
    if (req.file) {
      blogData.featuredImage = `/api/blog/images/${req.file.filename}`;
      blogData.mediaType = 'image';
    }
    
    const blog = new Blog(blogData);
    await blog.save();
    
    await blog.populate('author', 'username');
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// POST /api/blog/admin/create-with-media - Create new blog with mixed media support
router.post('/admin/create-with-media', authenticateAdmin, mixedMediaUpload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'featuredVideo', maxCount: 1 },
  { name: 'media', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status, seo, mediaType } = req.body;
    
    // Validate required fields
    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const blogData = {
      title,
      content,
      excerpt,
      category,
      author: req.admin._id,
      status: status || 'draft',
      mediaType: mediaType || 'image'
    };
    
    // Handle tags
    if (tags) {
      blogData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    // Handle SEO data
    if (seo) {
      try {
        blogData.seo = typeof seo === 'string' ? JSON.parse(seo) : seo;
      } catch (e) {
        console.warn('Invalid SEO data:', e);
      }
    }
    
    // Handle uploaded files
    if (req.files) {
      // Featured image
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        const file = req.files.featuredImage[0];
        blogData.featuredImage = `/api/blog/images/${file.filename}`;
      }
      
      // Featured video
      if (req.files.featuredVideo && req.files.featuredVideo[0]) {
        const file = req.files.featuredVideo[0];
        blogData.featuredVideo = `/api/blog/videos/${file.filename}`;
        blogData.mediaType = blogData.featuredImage ? 'both' : 'video';
      }
      
      // Additional media files
      if (req.files.media && req.files.media.length > 0) {
        blogData.media = req.files.media.map((file, index) => {
          const isVideo = file.mimetype.startsWith('video/');
          const baseUrl = isVideo ? '/api/blog/videos' : '/api/blog/images';
          
          return {
            type: isVideo ? 'video' : 'image',
            url: `${baseUrl}/${file.filename}`,
            filename: file.filename,
            order: index
          };
        });
      }
    }
    
    const blog = new Blog(blogData);
    await blog.save();
    
    await blog.populate('author', 'username');
    
    res.status(201).json({
      success: true,
      message: 'Blog with media created successfully',
      blog
    });
  } catch (error) {
    console.error('Error creating blog with media:', error);
    res.status(500).json({ error: 'Failed to create blog with media' });
  }
});

// PUT /api/blog/admin/:id - Update blog
router.put('/admin/:id', authenticateAdmin, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status, seo } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (status) blog.status = status;
    
    // Handle tags
    if (tags) {
      blog.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    // Handle SEO data
    if (seo) {
      try {
        blog.seo = typeof seo === 'string' ? JSON.parse(seo) : seo;
      } catch (e) {
        console.warn('Invalid SEO data:', e); 
      }
    }
    
    
    // Handle uploaded image
    if (req.file) {
      // Delete old image if exists
      if (blog.featuredImage) {
        const oldImagePath = path.join(__dirname, '../../uploads/blog-images', path.basename(blog.featuredImage));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.featuredImage = `/api/blog/images/${req.file.filename}`;
    }
    
    await blog.save();
    await blog.populate('author', 'username');
    
    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// PUT /api/blog/admin/update/:id - Update blog with media support
router.put('/admin/update/:id', authenticateAdmin, mixedMediaUpload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'featuredVideo', maxCount: 1 },
  { name: 'media', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status, seo, mediaType } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (status) blog.status = status;
    if (mediaType) blog.mediaType = mediaType;
    
    // Handle tags
    if (tags) {
      blog.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    // Handle SEO data
    if (seo) {
      try {
        blog.seo = typeof seo === 'string' ? JSON.parse(seo) : seo;
      } catch (e) {
        console.warn('Invalid SEO data:', e); 
      }
    }
    
    // Handle uploaded files
    if (req.files) {
      // Featured image
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        // Delete old image if exists
        if (blog.featuredImage) {
          const oldImagePath = path.join(__dirname, '../../uploads/blog-images', path.basename(blog.featuredImage));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        const file = req.files.featuredImage[0];
        blog.featuredImage = `/api/blog/images/${file.filename}`;
      }
      
      // Featured video
      if (req.files.featuredVideo && req.files.featuredVideo[0]) {
        // Delete old video if exists
        if (blog.featuredVideo) {
          const oldVideoPath = path.join(__dirname, '../../uploads/videos', path.basename(blog.featuredVideo));
          if (fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
          }
        }
        const file = req.files.featuredVideo[0];
        blog.featuredVideo = `/api/blog/videos/${file.filename}`;
        blog.mediaType = blog.featuredImage ? 'both' : 'video';
      }
      
      // Additional media files
      if (req.files.media && req.files.media.length > 0) {
        // Delete old media files if they exist
        if (blog.media && blog.media.length > 0) {
          blog.media.forEach(mediaItem => {
            const baseDir = mediaItem.type === 'video' ? '../../uploads/videos' : '../../uploads/blog-images';
            const oldPath = path.join(__dirname, baseDir, path.basename(mediaItem.url));
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          });
        }
        
        blog.media = req.files.media.map((file, index) => {
          const isVideo = file.mimetype.startsWith('video/');
          const baseUrl = isVideo ? '/api/blog/videos' : '/api/blog/images';
          
          return {
            type: isVideo ? 'video' : 'image',
            url: `${baseUrl}/${file.filename}`,
            filename: file.filename,
            order: index
          };
        });
      }
    }
    
    await blog.save();
    await blog.populate('author', 'username');
    
    res.json({
      success: true,
      message: 'Blog with media updated successfully',
      blog
    });
  } catch (error) {
    console.error('Error updating blog with media:', error);
    res.status(500).json({ error: 'Failed to update blog with media' });
  }
});

// DELETE /api/blog/admin/:id - Delete blog
router.delete('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Delete associated image
    if (blog.featuredImage) {
      const imagePath = path.join(__dirname, '../../uploads/blog-images', path.basename(blog.featuredImage));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// POST /api/blog/:id/like - Like a blog
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    blog.likes += 1;
    await blog.save();
    
    res.json({
      success: true,
      likes: blog.likes
    });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ error: 'Failed to like blog' });
  }
});

// GET /api/blog/categories - Get all categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    { value: 'sermon', label: 'Sermon' },
    { value: 'event', label: 'Event' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'testimony', label: 'Testimony' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'community', label: 'Community' },
    { value: 'other', label: 'Other' }
  ];
  
  res.json({
    success: true,
    categories
  });
});

module.exports = router;