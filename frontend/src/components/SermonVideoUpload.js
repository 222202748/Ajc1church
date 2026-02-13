import React, { useState, useEffect } from 'react';
import { Upload, Video, Image, X, Play, Pause, Trash2, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import { isTokenValid, refreshToken, logout } from '../utils/authUtils';
import axiosInstance from '../utils/axiosConfig';

const SermonVideoUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [sermonVideos, setSermonVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch existing sermon videos on component mount
  useEffect(() => {
    fetchSermonVideos();
  }, []);

  const fetchSermonVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(`${BASE_URL}/api/upload/videos/list`);

      const data = response.data;
      console.log('Fetched videos data:', data);
      setSermonVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching sermon videos:', error);
      setError('Failed to load sermon videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith('video/');
      return isVideo;
    });

    if (validFiles.length === 0) {
      alert('Please select valid video files');
      return;
    }

    // Create preview URLs for selected files
    const newPreviewUrls = {};
    validFiles.forEach(file => {
      newPreviewUrls[file.name] = URL.createObjectURL(file);
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => ({ ...prev, ...newPreviewUrls }));
  };

  const removeFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    if (previewUrls[fileName]) {
      URL.revokeObjectURL(previewUrls[fileName]);
      setPreviewUrls(prev => {
        const updated = { ...prev };
        delete updated[fileName];
        return updated;
      });
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    selectedFiles.forEach(file => {
      formData.append('videos', file);
    });

    try {
      console.log('Uploading videos...');
      
      // Try direct fetch instead of using axiosInstance
      const token = localStorage.getItem('token');
      const headers = new Headers();
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
      
      console.log('Sending to backend URL:', `${BASE_URL}/api/upload/videos`);
      
      const response = await fetch(`${BASE_URL}/api/upload/videos`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, Details: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Upload success data:', result);
      
      // Clear selected files after successful upload
      setSelectedFiles([]);
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls({});
      
      alert('Sermon videos uploaded successfully!');
      
      // Refresh the sermon videos list
      fetchSermonVideos();
    } catch (error) {
      console.error('Upload error details:', error);
      alert(`Upload failed: ${error.message}. Check console for details.`);
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (filename) => {
    if (window.confirm(`Are you sure you want to delete the sermon video "${filename}"?`)) {
      try {
        await axiosInstance.delete(`${BASE_URL}/api/upload/video/${encodeURIComponent(filename)}`);

        alert('Sermon video deleted successfully!');
        fetchSermonVideos();
      } catch (error) {
        console.error('Error deleting sermon video:', error);
        alert('Failed to delete sermon video. Please try again.');
      }
    }
  };

  const MediaPreview = ({ file, previewUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = React.useRef(null);

    const togglePlay = () => {
      if (!videoRef.current) return;
      
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    return (
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
        <video 
          ref={videoRef}
          src={previewUrl}
          className="w-full h-48 object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={togglePlay}
            className="bg-white bg-opacity-75 rounded-full p-3 hover:bg-opacity-100 transition-all"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
        </div>
        <div className="absolute top-2 right-2">
          <button 
            onClick={() => removeFile(file.name)}
            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2 text-sm truncate">{file.name}</div>
      </div>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sermon Video Management</h1>
          <p className="text-gray-600">Upload and manage sermon videos for the church website</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={fetchSermonVideos}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Upload New Sermon Videos</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Video Files</label>
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Video className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload sermon videos</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="video/*" 
                    multiple 
                    onChange={handleFileSelect} 
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">MP4, WebM, AVI up to 100MB</p>
            </div>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-3">Selected Videos ({selectedFiles.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedFiles.map((file) => (
                <MediaPreview key={file.name} file={file} previewUrl={previewUrls[file.name]} />
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Selected Videos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing Videos Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Existing Sermon Videos</h2>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sermon videos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <button 
              onClick={fetchSermonVideos}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : sermonVideos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No sermon videos found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sermonVideos.map((video) => (
                  <tr key={video.filename} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                        <video 
                           src={`${BASE_URL}${video.url}`} 
                           className="w-full h-full object-cover"
                          />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{video.filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatFileSize(video.size)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(video.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a 
                           href={`${BASE_URL}${video.url}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="View Video"
                        >
                          <Play className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteVideo(video.filename)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SermonVideoUpload;