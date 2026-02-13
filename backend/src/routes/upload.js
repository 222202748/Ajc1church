const express = require('express');
const path = require('path');
const fs = require('fs');
const { videoUpload, mixedMediaUpload } = require('../middleware/videoUpload');
const { authenticateAdmin } = require('./admin');
const router = express.Router();

// Serve uploaded videos
router.use('/videos', express.static(path.join(__dirname, '../../uploads/videos')));

// Serve uploaded images (if not already served by blog routes)
router.use('/images', express.static(path.join(__dirname, '../../uploads/blog-images')));

// Upload single video
router.post('/video', authenticateAdmin, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/api/upload/videos/${req.file.filename}`,
      uploadedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: videoInfo
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Upload multiple videos
router.post('/videos', authenticateAdmin, videoUpload.array('videos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files uploaded' });
    }

    const videos = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/api/upload/videos/${file.filename}`,
      uploadedAt: new Date()
    }));

    res.json({
      success: true,
      message: `${videos.length} videos uploaded successfully`,
      videos
    });
  } catch (error) {
    console.error('Error uploading videos:', error);
    res.status(500).json({ error: 'Failed to upload videos' });
  }
});

// Upload mixed media (images and videos)
router.post('/media', authenticateAdmin, mixedMediaUpload.array('media', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No media files uploaded' });
    }

    const media = req.files.map(file => {
      const isVideo = file.mimetype.startsWith('video/');
      const baseUrl = isVideo ? '/api/upload/videos' : '/api/upload/images';
      
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: isVideo ? 'video' : 'image',
        url: `${baseUrl}/${file.filename}`,
        uploadedAt: new Date()
      };
    });

    res.json({
      success: true,
      message: `${media.length} media files uploaded successfully`,
      media
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Get video info
router.get('/video/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(__dirname, '../../uploads/videos', filename);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const stats = fs.statSync(videoPath);
    const videoInfo = {
      filename,
      size: stats.size,
      url: `/api/upload/videos/${filename}`,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };

    res.json({
      success: true,
      video: videoInfo
    });
  } catch (error) {
    console.error('Error getting video info:', error);
    res.status(500).json({ error: 'Failed to get video info' });
  }
});

// Delete video
router.delete('/video/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(__dirname, '../../uploads/videos', filename);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    fs.unlinkSync(videoPath);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// List all uploaded videos (public)
router.get('/videos/list', async (req, res) => {
  try {
    const videosDir = path.join(__dirname, '../../uploads/videos');
    
    if (!fs.existsSync(videosDir)) {
      return res.json({
        success: true,
        videos: []
      });
    }

    const files = fs.readdirSync(videosDir);
    const videos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(videosDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          url: `/api/upload/videos/${file}`,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

// Stream video with range support (for better video playback)
router.get('/stream/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(__dirname, '../../uploads/videos', filename);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
});

module.exports = router;