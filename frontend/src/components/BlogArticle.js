import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Tag, Share2, Heart } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const BlogArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.blogArticles}/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.blog) {
          setArticle(data.blog);
          // After getting the article, fetch related articles
          fetchRelatedArticles(data.blog.category, data.blog._id);
        } else {
          throw new Error('Article not found');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRelatedArticles = async (category, currentId) => {
      try {
        // Fetch articles in the same category, excluding the current one
        const response = await fetch(`${API_ENDPOINTS.blogArticles}?category=${category}&limit=3`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.blogs) {
          // Filter out the current article
          const filtered = data.blogs.filter(blog => blog._id !== currentId);
          setRelatedArticles(filtered.slice(0, 3)); // Limit to 3 related articles
        }
      } catch (error) {
        console.error('Error fetching related articles:', error);
        // Don't set an error state here, as it's not critical
      }
    };
    
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            {error || 'Article not found'}
          </h2>
          <p className="text-red-600 mb-6">
            We couldn't find the article you're looking for. It may have been removed or the URL might be incorrect.
          </p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back Button */}
      <Link 
        to="/blog" 
        className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-8"
      >
        <ArrowLeft size={16} />
        Back to Blog
      </Link>

      {/* Article Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {article.featuredImage && (
          <img 
            src={article.featuredImage} 
            alt={article.title} 
            className="w-full h-96 object-cover"
          />
        )}
        <div className="p-8">
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {formatDate(article.publishedAt || article.createdAt)}
            </div>
            {article.author && (
              <div className="flex items-center gap-2">
                <User size={16} />
                {article.author.username}
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <Tag size={16} className="text-gray-400" />
              {article.tags.map((tag, index) => (
                <span key={index} className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-4">
            <button className="flex items-center gap-2 text-gray-500 hover:text-amber-600">
              <Share2 size={18} />
              Share
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-600">
              <Heart size={18} />
              Like
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="prose max-w-none">
          {article.excerpt && (
            <p className="text-lg text-gray-700 leading-relaxed mb-6 font-semibold">
              {article.excerpt}
            </p>
          )}
          
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>

      {/* Related Posts */}
      {relatedArticles.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <Link 
                key={relatedArticle._id}
                to={`/blog/${relatedArticle._id}`}
                className="cursor-pointer group"
              >
                {relatedArticle.featuredImage && (
                  <img 
                    src={relatedArticle.featuredImage} 
                    alt={relatedArticle.title}
                    className="w-full h-32 object-cover rounded-lg mb-3 group-hover:opacity-90 transition-opacity"
                  />
                )}
                <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                  {relatedArticle.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogArticle;