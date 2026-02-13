# Video Upload Integration Guide

This guide explains how to integrate and use the video upload functionality in the Church Management System.

## 🎯 Overview

The video upload system provides comprehensive support for uploading, managing, and displaying videos alongside images in blog posts and other content areas.

## 📁 Directory Structure

When the server starts, these directories are automatically created:

```
backend/
├── uploads/
│   ├── videos/           # Video files
│   ├── blog-images/      # Blog images
│   └── misc/             # Other media files
```

## 🔧 Backend Components

### 1. Video Upload Middleware (`src/middleware/videoUpload.js`)

**Features:**
- Supports multiple video formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV
- File size limit: 100MB for videos
- Automatic directory creation
- Mixed media support (images + videos)

**Usage:**
```javascript
const { videoUpload, mixedMediaUpload } = require('../middleware/videoUpload');

// Single video upload
router.post('/upload', videoUpload.single('video'), handler);

// Multiple videos
router.post('/upload', videoUpload.array('videos', 5), handler);

// Mixed media (images + videos)
router.post('/upload', mixedMediaUpload.array('media', 10), handler);
```

### 2. Upload Routes (`src/routes/upload.js`)

**Available Endpoints:**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/video` | Upload single video | Yes |
| POST | `/api/upload/videos` | Upload multiple videos | Yes |
| POST | `/api/upload/media` | Upload mixed media | Yes |
| GET | `/api/upload/videos/:filename` | Serve video file | No |
| GET | `/api/upload/video/:filename` | Get video info | No |
| GET | `/api/upload/videos/list` | List all videos | Yes |
| GET | `/api/upload/stream/:filename` | Stream video with range support | No |
| DELETE | `/api/upload/video/:filename` | Delete video | Yes |

### 3. Enhanced Blog Model (`src/models/Blog.js`)

**New Fields:**
```javascript
{
  featuredVideo: String,        // URL to featured video
  mediaType: String,           // 'image', 'video', or 'both'
  media: [{                    // Array of media files
    type: String,              // 'image' or 'video'
    url: String,               // File URL
    filename: String,          // Original filename
    caption: String,           // Optional caption
    order: Number              // Display order
  }]
}
```

### 4. Enhanced Blog Routes (`src/routes/blog.js`)

**New Endpoint:**
- `POST /api/blog/admin/create-with-media` - Create blog with video support

**Features:**
- Supports featured image and video
- Multiple media files per blog
- Automatic media type detection
- Video streaming support

## 🎨 Frontend Components

### VideoUpload Component (`src/components/VideoUpload.js`)

**Features:**
- Drag & drop file selection
- Image and video preview
- Video playback controls
- Upload progress indication
- File type validation
- File size display

**Usage:**
```jsx
import VideoUpload from './components/VideoUpload';

function AdminPanel() {
  const handleUploadSuccess = (uploadedFiles) => {
    console.log('Uploaded files:', uploadedFiles);
    // Handle successful upload
  };

  return (
    <VideoUpload 
      onUploadSuccess={handleUploadSuccess}
      maxFiles={5}
    />
  );
}
```

### Enhanced Blog Component (`src/components/Blog.js`)

**Features:**
- MediaDisplay component for images/videos
- Video controls in thumbnails
- Responsive video playback
- Fallback image support

## 🚀 How to Use Video Upload

### 1. For Blog Posts with Videos

**Step 1:** Use the enhanced blog creation endpoint
```javascript
const formData = new FormData();
formData.append('title', 'My Video Blog');
formData.append('content', 'Blog content...');
formData.append('excerpt', 'Short description...');
formData.append('category', 'sermon');
formData.append('featuredVideo', videoFile);
formData.append('mediaType', 'video');

fetch('/api/blog/admin/create-with-media', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

**Step 2:** The blog will automatically display videos using the MediaDisplay component

### 2. For Standalone Video Uploads

**Upload Single Video:**
```javascript
const formData = new FormData();
formData.append('video', videoFile);

fetch('/api/upload/video', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

**Upload Multiple Videos:**
```javascript
const formData = new FormData();
videoFiles.forEach(file => {
  formData.append('videos', file);
});

fetch('/api/upload/videos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

### 3. For Mixed Media (Images + Videos)

```javascript
const formData = new FormData();
mediaFiles.forEach(file => {
  formData.append('media', file);
});

fetch('/api/upload/media', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

## 📱 Frontend Integration Examples

### 1. Adding VideoUpload to Admin Dashboard

```jsx
// In AdminDashboard.js
import VideoUpload from '../components/VideoUpload';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div>
      {/* Navigation tabs */}
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab('events')}>Events</button>
        <button onClick={() => setActiveTab('donations')}>Donations</button>
        <button onClick={() => setActiveTab('media')}>Media Upload</button>
      </div>

      {/* Content */}
      {activeTab === 'media' && (
        <VideoUpload 
          onUploadSuccess={(files) => {
            console.log('Files uploaded:', files);
            // Refresh media list or show success message
          }}
          maxFiles={10}
        />
      )}
    </div>
  );
}
```

### 2. Creating a Media Gallery

```jsx
function MediaGallery() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch uploaded videos
    fetch('/api/upload/videos/list', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
    .then(res => res.json())
    .then(data => setVideos(data.videos));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {videos.map(video => (
        <div key={video.filename} className="bg-white rounded-lg shadow">
          <video 
            src={video.url}
            controls
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-4">
            <p className="font-medium">{video.filename}</p>
            <p className="text-sm text-gray-500">
              {(video.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 🔒 Security Considerations

1. **Authentication Required:** All upload endpoints require admin authentication
2. **File Type Validation:** Only allowed video/image formats are accepted
3. **File Size Limits:** 100MB limit for videos, 5MB for images
4. **Secure File Storage:** Files are stored outside the web root
5. **Input Sanitization:** Filenames are sanitized to prevent path traversal

## 🎛️ Configuration Options

### Environment Variables (`.env`)
```env
# File Upload Configuration
MAX_VIDEO_SIZE=104857600  # 100MB in bytes
MAX_IMAGE_SIZE=5242880    # 5MB in bytes
UPLOAD_PATH=uploads/
VIDEO_FORMATS=mp4,avi,mov,wmv,flv,webm,mkv
IMAGE_FORMATS=jpg,jpeg,png,gif,webp
```

### Customizing Upload Limits

```javascript
// In videoUpload.js
const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: process.env.MAX_VIDEO_SIZE || 100 * 1024 * 1024
  },
  fileFilter: videoFileFilter
});
```

## 🐛 Troubleshooting

### Common Issues:

1. **"Upload directory not found"**
   - Solution: Ensure the server has write permissions to the uploads directory
   - The directories are auto-created on server start

2. **"File too large" error**
   - Check the file size limits in the middleware
   - Verify nginx/apache upload limits if using a reverse proxy

3. **Video not playing**
   - Ensure the video format is supported by browsers
   - Check if the video file is corrupted
   - Verify the video URL is accessible

4. **Authentication errors**
   - Ensure the admin token is valid and included in requests
   - Check if the admin session has expired

### Debug Mode:

Enable detailed logging by setting:
```env
DEBUG=true
LOG_LEVEL=debug
```

## 📈 Performance Optimization

1. **Video Streaming:** Use the `/stream/:filename` endpoint for large videos
2. **Compression:** Consider implementing video compression for uploaded files
3. **CDN Integration:** Store videos on a CDN for better performance
4. **Lazy Loading:** Implement lazy loading for video thumbnails

## 🔄 Future Enhancements

- [ ] Video thumbnail generation
- [ ] Video compression/transcoding
- [ ] Cloud storage integration (AWS S3, Google Cloud)
- [ ] Video analytics and view tracking
- [ ] Batch upload with progress tracking
- [ ] Video editing capabilities
- [ ] Live streaming support

---

**Note:** This system is designed to be scalable and can be easily extended to support additional media types and cloud storage solutions.