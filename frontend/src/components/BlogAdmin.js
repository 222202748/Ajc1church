import React, { useState, useEffect } from 'react';
import { Calendar, User, Share2, Heart, MessageCircle, Edit, Trash2, Plus, Download, Search, Filter, RefreshCw, Eye, FileText, Video, Tag } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeader } from '../config/api';

const BlogAdmin = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // list, create, edit, view
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'sermon',
    tags: '',
    status: 'draft',
    featuredImage: null,
    featuredVideo: null,
    mediaType: 'image'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  // Fetch articles from backend
  useEffect(() => {
    fetchArticles();
  }, []);
  
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_ENDPOINTS.blogArticles}/admin/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setArticles(data.blogs || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on search and filters
  const filteredArticles = articles.filter(article => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    
    // Apply category filter
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Create preview for image
      if (name === 'featuredImage') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    if (!formData.excerpt.trim()) errors.excerpt = 'Excerpt is required';
    if (formData.excerpt.length > 200) errors.excerpt = 'Excerpt must be less than 200 characters';
    if (!formData.category) errors.category = 'Category is required';
    
    // For new articles, require featured image or video
    if (!selectedArticle && formData.mediaType === 'image' && !formData.featuredImage) {
      errors.featuredImage = 'Featured image is required';
    }
    if (!selectedArticle && formData.mediaType === 'video' && !formData.featuredVideo) {
      errors.featuredVideo = 'Featured video is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setFormSuccess('');
      setError(null);
      
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('mediaType', formData.mediaType);
      
      if (formData.tags) {
        formDataToSend.append('tags', formData.tags);
      }
      
      // Add files
      if (formData.featuredImage instanceof File) {
        formDataToSend.append('featuredImage', formData.featuredImage);
      }
      
      if (formData.featuredVideo instanceof File) {
        formDataToSend.append('featuredVideo', formData.featuredVideo);
      }
      
      // Determine if creating or updating
      const url = selectedArticle 
        ? `${API_ENDPOINTS.blogArticles}/admin/update/${selectedArticle._id}`
        : `${API_ENDPOINTS.blogArticles}/admin/create-with-media`;
      
      const method = selectedArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeader()
          // Note: Don't set Content-Type with FormData
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update state based on action
      if (selectedArticle) {
        setArticles(prev => prev.map(article => 
          article._id === selectedArticle._id ? data.blog : article
        ));
        setFormSuccess('Article updated successfully!');
      } else {
        setArticles(prev => [data.blog, ...prev]);
        setFormSuccess('Article created successfully!');
        
        // Reset form for new article
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          category: 'sermon',
          tags: '',
          status: 'draft',
          featuredImage: null,
          featuredVideo: null,
          mediaType: 'image'
        });
        setImagePreview(null);
      }
      
      // Return to list view after short delay
      setTimeout(() => {
        setCurrentView('list');
        setSelectedArticle(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle article deletion
  const handleDeleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_ENDPOINTS.blogArticles}/admin/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove the deleted article from the state
        setArticles(prev => prev.filter(article => article._id !== id));
        alert('Article deleted successfully!');
      } catch (error) {
        console.error('Error deleting article:', error);
        alert(`Failed to delete article: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle edit article
  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags ? article.tags.join(', ') : '',
      status: article.status,
      featuredImage: null, // Can't pre-fill file inputs
      featuredVideo: null,
      mediaType: article.mediaType || 'image'
    });
    
    // Set image preview if available
    if (article.featuredImage) {
      setImagePreview(article.featuredImage.startsWith('http') 
        ? article.featuredImage 
        : `http://localhost:5000${article.featuredImage}`);
    } else {
      setImagePreview(null);
    }
    
    setCurrentView('edit');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const categories = {
      sermon: 'Sermon',
      event: 'Event',
      announcement: 'Announcement',
      testimony: 'Testimony',
      prayer: 'Prayer',
      community: 'Community',
      other: 'Other'
    };
    return categories[category] || category;
  };

  // Article List View
  const ArticleListView = () => (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Articles</h1>
            <p className="text-gray-600">Manage your church blog articles</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => {
                setSelectedArticle(null);
                setFormData({
                  title: '',
                  content: '',
                  excerpt: '',
                  category: 'sermon',
                  tags: '',
                  status: 'draft',
                  featuredImage: null,
                  featuredVideo: null,
                  mediaType: 'image'
                });
                setImagePreview(null);
                setCurrentView('create');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Article</span>
            </button>
            <button
              onClick={fetchArticles}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or excerpt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="sermon">Sermon</option>
              <option value="event">Event</option>
              <option value="announcement">Announcement</option>
              <option value="testimony">Testimony</option>
              <option value="prayer">Prayer</option>
              <option value="community">Community</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Articles ({filteredArticles.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <button 
              onClick={fetchArticles}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No articles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                          {article.featuredImage ? (
                            <img 
                              src={article.featuredImage.startsWith('http') 
                                ? article.featuredImage 
                                : `http://localhost:5000${article.featuredImage}`} 
                              alt={article.title} 
                              className="h-10 w-10 object-cover"
                            />
                          ) : article.mediaType === 'video' ? (
                            <div className="h-10 w-10 flex items-center justify-center bg-blue-100">
                              <Video className="w-5 h-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-gray-100">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {article.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getCategoryLabel(article.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(article.status)}`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedArticle(article);
                            setCurrentView('view');
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                          title="View Article"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                          title="Delete Article"
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

  // Article Form (Create/Edit)
  const ArticleForm = () => (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedArticle ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-gray-600">
              {selectedArticle ? 'Update your existing article' : 'Add a new article to your blog'}
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentView('list');
              setSelectedArticle(null);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Article Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {formSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter article title"
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="sermon">Sermon</option>
                <option value="event">Event</option>
                <option value="announcement">Announcement</option>
                <option value="testimony">Testimony</option>
                <option value="prayer">Prayer</option>
                <option value="community">Community</option>
                <option value="other">Other</option>
              </select>
              {formErrors.category && <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="excerpt">
              Excerpt * (max 200 characters)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows="2"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.excerpt ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Brief summary of the article"
            ></textarea>
            <div className="flex justify-between mt-1">
              {formErrors.excerpt ? (
                <p className="text-sm text-red-500">{formErrors.excerpt}</p>
              ) : (
                <p className="text-sm text-gray-500">{formData.excerpt.length}/200 characters</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="10"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.content ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Full article content"
            ></textarea>
            {formErrors.content && <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="faith, prayer, community"
            />
            <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="mediaType"
                  value="image"
                  checked={formData.mediaType === 'image'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Image</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="mediaType"
                  value="video"
                  checked={formData.mediaType === 'video'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Video</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="mediaType"
                  value="both"
                  checked={formData.mediaType === 'both'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Both</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {(formData.mediaType === 'image' || formData.mediaType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="featuredImage">
                  Featured Image {!selectedArticle && formData.mediaType === 'image' ? '*' : ''}
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="featuredImage"
                      name="featuredImage"
                      onChange={handleFileChange}
                      accept="image/*"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.featuredImage ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.featuredImage && <p className="mt-1 text-sm text-red-500">{formErrors.featuredImage}</p>}
                  </div>
                  {imagePreview && (
                    <div className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">Recommended size: 1200x630 pixels, max 5MB</p>
              </div>
            )}

            {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="featuredVideo">
                  Featured Video {!selectedArticle && formData.mediaType === 'video' ? '*' : ''}
                </label>
                <input
                  type="file"
                  id="featuredVideo"
                  name="featuredVideo"
                  onChange={handleFileChange}
                  accept="video/*"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.featuredVideo ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.featuredVideo && <p className="mt-1 text-sm text-red-500">{formErrors.featuredVideo}</p>}
                <p className="mt-1 text-sm text-gray-500">Max file size: 50MB</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {formData.status === 'published' ? 'Article will be visible to the public' : 
               formData.status === 'draft' ? 'Save as draft to publish later' : 
               'Archived articles are not visible to the public'}
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setCurrentView('list');
                setSelectedArticle(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span>Save Article</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Article View
  const ArticleView = () => {
    if (!selectedArticle) return null;
    
    return (
      <div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Article Preview
              </h1>
              <p className="text-gray-600">
                Preview how your article will appear to readers
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleEditArticle(selectedArticle)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit
              </button>
              <button
                onClick={() => {
                  setCurrentView('list');
                  setSelectedArticle(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        {/* Article Preview */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Article Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="mb-4">
              <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                {getCategoryLabel(selectedArticle.category)}
              </span>
              <span className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedArticle.status)}`}>
                {selectedArticle.status.charAt(0).toUpperCase() + selectedArticle.status.slice(1)}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {selectedArticle.title}
            </h1>
            <div className="flex items-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{selectedArticle.author?.username || 'Admin'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(selectedArticle.publishedAt || selectedArticle.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{selectedArticle.views || 0} views</span>
              </div>
            </div>
          </div>

          {/* Featured Media */}
          {selectedArticle.featuredImage && (
            <div className="w-full h-96 bg-gray-100 overflow-hidden">
              <img 
                src={selectedArticle.featuredImage.startsWith('http') 
                  ? selectedArticle.featuredImage 
                  : `http://localhost:5000${selectedArticle.featuredImage}`} 
                alt={selectedArticle.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                {selectedArticle.excerpt}
              </p>
              
              <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br>') }} />
            </div>

            {/* Tags */}
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {selectedArticle.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share and Download */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center space-x-2 text-green-600 hover:text-green-800">
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                    <Heart className="w-5 h-5" />
                    <span>{selectedArticle.likes || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                    <MessageCircle className="w-5 h-5" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === 'list' && <ArticleListView />}
        {(currentView === 'create' || currentView === 'edit') && <ArticleForm />}
        {currentView === 'view' && <ArticleView />}
      </div>
    </div>
  );
};

export default BlogAdmin;
