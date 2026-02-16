import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import axiosInstance from '../utils/axiosConfig';

const AllArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_ENDPOINTS.blogArticles, {
          requiresAuth: false
        });

        const data = response.data;
        if (data.success && data.blogs) {
          setArticles(data.blogs);
        } else {
          throw new Error('No articles found');
        }
      } catch (err) {
        console.error('Error fetching all articles:', err);
        setError('Failed to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            All Articles
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read all the articles that have been published from the admin panel.
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
            <p>No articles available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
              >
                {article.featuredImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        article.featuredImage.startsWith('http')
                          ? article.featuredImage
                          : `${BASE_URL}${article.featuredImage}`
                      }
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-1" />
                    <span>{article.author?.username || 'Admin'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <Link
                    to={`/blog/${article._id}`}
                    className="inline-flex items-center px-4 py-2 bg-[#8B4513] text-white text-sm font-medium rounded-full shadow-sm hover:bg-[#6f3610] hover:shadow-md transition-all"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AllArticles;
