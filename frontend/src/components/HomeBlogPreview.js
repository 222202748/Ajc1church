import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const HomeBlogPreview = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTranslation = (key, fallback) => {
    try {
      const keys = key.split('.');
      let result = translations[language] || translations.english;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return fallback;
        }
      }
      return result || fallback;
    } catch (error) {
      return fallback;
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.blogArticles}?limit=3`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.blogs) {
          setArticles(data.blogs);
        } else {
          throw new Error('No articles found');
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('Failed to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const locale = language === 'tamil' ? 'ta-IN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {getTranslation('blog.latestArticles', 'Latest Articles')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {getTranslation('blog.subscribeText', 'Stay updated with our latest sermons, testimonies, and church announcements')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>{getTranslation('noResults', 'No articles available at the moment.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                {article.featuredImage && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.featuredImage.startsWith('http') 
                        ? article.featuredImage 
                        : `http://localhost:5000${article.featuredImage}`} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-1" />
                    <span>{article.author?.username || 'Admin'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <Link 
                    to={`/blog/${article._id}`} 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {getTranslation('readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link 
            to="/blog" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getTranslation('blog.viewAll', 'View All Articles')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogPreview;