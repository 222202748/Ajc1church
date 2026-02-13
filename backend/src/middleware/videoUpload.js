const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/videos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${extension}`);
  }
});

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  // Allowed video types
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
  const allowedMimeTypes = /video\/(mp4|avi|quicktime|x-msvideo|x-flv|webm|x-matroska)/;
  
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed! Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV'));
  }
};

// Configure multer for video uploads
const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: videoFileFilter
});

// Configure storage for mixed media (images + videos)
const mixedMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(__dirname, '../../uploads/blog-images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(__dirname, '../../uploads/videos');
    } else {
      uploadPath = path.join(__dirname, '../../uploads/misc');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    let prefix = 'file';
    
    if (file.mimetype.startsWith('image/')) {
      prefix = 'blog';
    } else if (file.mimetype.startsWith('video/')) {
      prefix = 'video';
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${extension}`);
  }
});

// File filter for mixed media
const mixedMediaFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
  const allowedImageMimes = /image\/(jpeg|jpg|png|gif|webp)/;
  const allowedVideoMimes = /video\/(mp4|avi|quicktime|x-msvideo|x-flv|webm|x-matroska)/;
  
  const extension = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(extension) && allowedImageMimes.test(file.mimetype);
  const isVideo = allowedVideoTypes.test(extension) && allowedVideoMimes.test(file.mimetype);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'));
  }
};

// Configure multer for mixed media uploads
const mixedMediaUpload = multer({
  storage: mixedMediaStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: mixedMediaFilter
});

module.exports = {
  videoUpload,
  mixedMediaUpload,
  videoStorage,
  videoFileFilter
};