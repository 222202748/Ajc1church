import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import axiosInstance from '../utils/axiosConfig';

const BlogArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null); // ✅ Clear previous errors before fetching
        const response = await axiosInstance.get(`${API_ENDPOINTS.blogArticles}/${id}`, {
          requiresAuth: false
        });

        const data = response.data;
        if (data.success && data.blog) {
          setArticle(data.blog);
        } else {
          throw new Error('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err?.response?.data?.message || 'Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // ✅ Guard against invalid dates
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getAuthorInitials = (name) => {
    if (!name || typeof name !== 'string') return 'A'; // ✅ Type guard
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getReadTime = (value) => {
    if (!value || typeof value !== 'string') return '5 min read'; // ✅ Type guard
    const text = value.replace(/<[^>]+>/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length || 1;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
  };

  const hasHtmlTags = (value) => {
    if (!value || typeof value !== 'string') return false; // ✅ Type guard
    return /<\/?[a-z][\s\S]*>/i.test(value);
  };

  // ✅ Sanitize HTML to prevent XSS — strips dangerous tags/attributes
  const sanitizeHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;

    const dangerousTags = div.querySelectorAll('script, iframe, object, embed, form');
    dangerousTags.forEach((el) => el.remove());

    const allElements = div.querySelectorAll('*');
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const attrName = attr.name;
        const attrValue = typeof attr.value === 'string' ? attr.value.trim().toLowerCase() : '';
        if (
          attrName.startsWith('on') ||
          (attrName === 'href' && /^javascript:/i.test(attrValue))
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return div.innerHTML;
  };

  const renderContent = (value) => {
    if (!value || typeof value !== 'string') return null; // ✅ Type guard

    if (hasHtmlTags(value)) {
      return (
        <div
          className="font-serif text-[17px] leading-[1.8] text-gray-800 space-y-4"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} // ✅ Sanitized before render
        />
      );
    }

    const lines = value.split(/\r?\n/);
    const elements = [];
    let keyIndex = 0;

    lines.forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) {
        elements.push(<div key={`gap-${keyIndex}`} className="h-2" />);
        keyIndex += 1;
        return;
      }

      if (/^\d+\.\s/.test(line)) {
        elements.push(
          <p key={`main-${keyIndex}`} className="mt-4 mb-1 text-lg font-semibold text-gray-900">
            {line}
          </p>
        );
        keyIndex += 1;
        return;
      }

      if (line.endsWith(':')) {
        elements.push(
          <p key={`sub-${keyIndex}`} className="mt-3 mb-1 font-semibold text-gray-800">
            {line}
          </p>
        );
        keyIndex += 1;
        return;
      }

      elements.push(
        <p key={`p-${keyIndex}`} className="text-gray-800 leading-relaxed mb-2">
          {line}
        </p>
      );
      keyIndex += 1;
    });

    return (
      <div className="font-serif text-[17px] leading-[1.8] text-gray-800">
        {elements}
      </div>
    );
  };

  // ✅ Safe fallbacks for potentially missing nested fields
  const authorName =
    article?.author?.username ||
    article?.author?.name ||
    'Church Author';

  const readTime = article ? getReadTime(article.content || '') : '';

  // ✅ Safe image URL builder — guards against non-string values
  const getImageUrl = (featuredImage) => {
    if (!featuredImage || typeof featuredImage !== 'string') return null;
    return featuredImage.startsWith('http') ? featuredImage : `${BASE_URL}${featuredImage}`;
  };

  const imageUrl = article ? getImageUrl(article.featuredImage) : null;

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Loading article...</p>
          </div>
        ) : error || !article ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-red-500 text-lg mb-4">
              {error || 'Article not found'}
            </div>
            <Link
              to="/all-articles"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#6f3610] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to All Articles
            </Link>
          </div>
        ) : (
          <>
            <Link
              to="/all-articles"
              className="inline-flex items-center gap-2 text-[#8B4513] hover:text-[#6f3610] mb-4 text-sm font-medium tracking-wide"
            >
              <ArrowLeft size={16} />
              Back to All Articles
            </Link>

            <header className="max-w-3xl mx-auto pt-6 px-4 sm:px-8">
              <div className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-[#b5522a] mb-5">
                <span className="inline-block w-7 h-[2px] bg-[#b5522a]" />
                <span>Devotional</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-gray-900 mb-6">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="font-serif text-lg text-gray-700 leading-relaxed mb-8">
                  {article.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 pb-6 mb-10 border-b border-[#d0c9bc]">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#b5522a] to-[#e8956d] flex items-center justify-center text-white font-semibold text-lg">
                  {getAuthorInitials(authorName)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium tracking-[0.03em]">
                    {authorName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 tracking-[0.02em]">
                    {formatDate(article.publishedAt || article.createdAt)}
                  </div>
                </div>
                <div className="text-xs text-gray-700 border border-[#d0c9bc] px-3 py-1 rounded-full tracking-[0.08em] uppercase">
                  {readTime}
                </div>
              </div>
            </header>

            {/* ✅ Only renders image if URL is valid */}
            {imageUrl && (
              <div className="max-w-3xl mx-auto px-4 sm:px-8 mb-8">
                <div className="w-full h-64 sm:h-80 bg-gray-200 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={article.title || 'Article image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'; // ✅ Hide broken images gracefully
                    }}
                  />
                </div>
              </div>
            )}

            <article className="max-w-3xl mx-auto px-4 sm:px-8 pb-16">
              {renderContent(article.content || '')}
            </article>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogArticle;
