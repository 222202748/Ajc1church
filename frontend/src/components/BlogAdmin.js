import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Heart, MessageCircle, Edit, Trash2, Plus, Download, Search, Filter, RefreshCw, Eye, FileText, Video, Tag, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { useLanguage } from '../contexts/LanguageContext';

// ─────────────────────────────────────────────
// Shared content rendering helpers
// ─────────────────────────────────────────────
const hasHtmlTags = (value) => {
  if (!value || typeof value !== 'string') return false;
  return /<\/?[a-z][\s\S]*>/i.test(value);
};

const sanitizeHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('script, iframe, object, embed, form').forEach((el) => el.remove());
  div.querySelectorAll('*').forEach((el) => {
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

const renderArticleContent = (value) => {
  if (!value || typeof value !== 'string') return null;

  if (hasHtmlTags(value)) {
    return (
      <div
        className="font-serif text-[17px] leading-[1.8] text-gray-800 space-y-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
      />
    );
  }

  const elements = [];
  let keyIndex = 0;
  value.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) { elements.push(<div key={`gap-${keyIndex++}`} className="h-2" />); return; }
    if (/^\d+\.\s/.test(line)) { elements.push(<p key={`h-${keyIndex++}`} className="mt-4 mb-1 text-lg font-semibold text-gray-900">{line}</p>); return; }
    if (line.endsWith(':')) { elements.push(<p key={`sh-${keyIndex++}`} className="mt-3 mb-1 font-semibold text-gray-800">{line}</p>); return; }
    elements.push(<p key={`p-${keyIndex++}`} className="text-gray-800 leading-relaxed mb-2">{line}</p>);
  });

  return <div className="font-serif text-[17px] leading-[1.8] text-gray-800">{elements}</div>;
};

const getAuthorInitials = (name) => {
  if (!name || typeof name !== 'string') return 'A';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getReadTime = (value) => {
  if (!value || typeof value !== 'string') return '5 min read';
  const words = value.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length || 1;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

const formatDateLong = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return ''; }
};

// ─────────────────────────────────────────────
// ArticleView — full BlogArticle layout
// ─────────────────────────────────────────────
const ArticleView = ({ selectedArticle, onEdit, onBack, t, BASE_URL }) => {
  if (!selectedArticle) return null;

  const authorName = selectedArticle.author?.username || selectedArticle.author?.name || 'Church Author';
  const imageUrl = (() => {
    const fi = selectedArticle.featuredImage;
    if (!fi || typeof fi !== 'string') return null;
    return fi.startsWith('http') ? fi : `${BASE_URL}${fi}`;
  })();
  const videoUrl = (() => {
    const fv = selectedArticle.featuredVideo;
    if (!fv || typeof fv !== 'string') return null;
    return fv.startsWith('http') ? fv : `${BASE_URL}${fv}`;
  })();

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      {/* Sticky admin toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {t.backToList}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-widest hidden sm:block">Preview Mode</span>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={14} />
              {t.edit}
            </button>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="max-w-3xl mx-auto pt-6 px-4 sm:px-8">
          {/* Category label */}
          <div className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-[#b5522a] mb-5">
            <span className="inline-block w-7 h-[2px] bg-[#b5522a]" />
            <span>{selectedArticle.category || 'Devotional'}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-gray-900 mb-6">
            {selectedArticle.title}
          </h1>

          {/* Excerpt */}
          {selectedArticle.excerpt && (
            <p className="font-serif text-lg text-gray-700 leading-relaxed mb-8">
              {selectedArticle.excerpt}
            </p>
          )}

          {/* Author / date / read-time row */}
          <div className="flex items-center gap-4 pb-6 mb-10 border-b border-[#d0c9bc]">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#b5522a] to-[#e8956d] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {getAuthorInitials(authorName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium tracking-[0.03em] truncate">{authorName}</div>
              <div className="text-xs text-gray-500 mt-1 tracking-[0.02em]">
                {formatDateLong(selectedArticle.publishedAt || selectedArticle.createdAt)}
              </div>
            </div>
            <div className="text-xs text-gray-700 border border-[#d0c9bc] px-3 py-1 rounded-full tracking-[0.08em] uppercase whitespace-nowrap flex-shrink-0">
              {getReadTime(selectedArticle.content || '')}
            </div>
          </div>
        </header>

        {/* Featured image */}
        {imageUrl && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 mb-8">
            <div className="w-full h-64 sm:h-80 bg-gray-200 overflow-hidden rounded-lg">
              <img
                src={imageUrl}
                alt={selectedArticle.title || 'Article image'}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
              />
            </div>
          </div>
        )}

        {/* Featured video */}
        {videoUrl && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 mb-8">
            <div className="w-full rounded-lg overflow-hidden bg-black">
              <video controls className="w-full" src={videoUrl} />
            </div>
          </div>
        )}

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-8 pb-10">
          {renderArticleContent(selectedArticle.content || '')}
        </article>

        {/* Tags */}
        {selectedArticle.tags && selectedArticle.tags.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-10 pt-6 border-t border-[#d0c9bc]">
            <div className="flex items-center flex-wrap gap-2">
              <Tag className="w-4 h-4 text-[#b5522a]" />
              {selectedArticle.tags.map((tag, i) => (
                <span key={i} className="bg-[#f0ebe2] text-[#7a4520] text-sm px-3 py-1 rounded-full border border-[#d0c9bc]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-16 pt-6 border-t border-[#d0c9bc]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-[#b5522a] hover:text-[#7a4520] text-sm transition-colors">
                <Share2 className="w-4 h-4" /><span>{t.share}</span>
              </button>
              <button className="flex items-center gap-2 text-[#b5522a] hover:text-[#7a4520] text-sm transition-colors">
                <Download className="w-4 h-4" /><span>{t.download}</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-gray-500 text-sm">
                <Heart className="w-4 h-4" />{selectedArticle.likes || 0}
              </span>
              <span className="flex items-center gap-2 text-gray-500 text-sm">
                <MessageCircle className="w-4 h-4" />{t.comment}
              </span>
              <span className="flex items-center gap-2 text-gray-400 text-sm">
                <Eye className="w-4 h-4" />{selectedArticle.views || 0} {t.views}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ArticleForm — lifted outside BlogAdmin to fix typing bug
// ─────────────────────────────────────────────
const ArticleForm = ({
  selectedArticle, formData, formErrors, formSuccess, error, loading,
  imagePreview, handleInputChange, handleFileChange, handleSubmit, onCancel,
  t, isTamil,
}) => (
  <div>
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedArticle ? t.editArticle : t.createArticle}
          </h1>
          <p className="text-gray-600">{selectedArticle ? t.updateExisting : t.addNew}</p>
        </div>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          {t.backToList}
        </button>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{t.articleDetails}</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}
        {formSuccess && <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">{formSuccess}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">{t.title}</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder={t.titlePlaceholder}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`} />
            {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">{t.category}</label>
            <select id="category" name="category" value={formData.category} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}>
              {Object.entries(t.categories).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
            {formErrors.category && <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="excerpt">{t.excerpt}</label>
          <textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows="2" placeholder={t.excerptPlaceholder}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.excerpt ? 'border-red-500' : 'border-gray-300'}`} />
          <div className="flex justify-between mt-1">
            {formErrors.excerpt
              ? <p className="text-sm text-red-500">{formErrors.excerpt}</p>
              : <p className="text-sm text-gray-500">{formData.excerpt.length}/200 {isTamil ? 'எழுத்துக்கள்' : 'characters'}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">{t.content}</label>
          <textarea id="content" name="content" value={formData.content} onChange={handleInputChange} rows="16" placeholder={t.contentPlaceholder}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[320px] ${formErrors.content ? 'border-red-500' : 'border-gray-300'}`} />
          {formErrors.content && <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tags">{t.tags}</label>
          <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder={t.tagsPlaceholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="mt-1 text-sm text-gray-500">{t.tagsHint}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.mediaType}</label>
          <div className="flex space-x-4">
            {['none', 'image', 'video', 'both'].map((type) => (
              <label key={type} className="inline-flex items-center">
                <input type="radio" name="mediaType" value={type} checked={formData.mediaType === type} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-gray-700">{type === 'none' ? t.noMedia : type === 'image' ? t.image : type === 'video' ? t.video : t.both}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {(formData.mediaType === 'image' || formData.mediaType === 'both') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="featuredImage">
                  {t.featuredImage} {!selectedArticle && formData.mediaType === 'image' ? '*' : ''}
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input type="file" id="featuredImage" name="featuredImage" onChange={handleFileChange} accept="image/*"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.featuredImage ? 'border-red-500' : 'border-gray-300'}`} />
                    {formErrors.featuredImage && <p className="mt-1 text-sm text-red-500">{formErrors.featuredImage}</p>}
                  </div>
                  {imagePreview && (
                    <div className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{t.imageHint}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="featuredImageUrl">{t.featuredImageUrl}</label>
                <input type="text" id="featuredImageUrl" name="featuredImageUrl" value={formData.featuredImageUrl} onChange={handleInputChange}
                  placeholder={isTamil ? 'படத்தின் இணைய இணைப்பை ஒட்டவும் (https://...)' : 'Paste image URL (https://...)'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="mt-1 text-sm text-gray-500">{t.imageUrlHint}</p>
              </div>
            </div>
          )}
          {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="featuredVideo">
                {t.featuredVideo} {!selectedArticle && formData.mediaType === 'video' ? '*' : ''}
              </label>
              <input type="file" id="featuredVideo" name="featuredVideo" onChange={handleFileChange} accept="video/*"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.featuredVideo ? 'border-red-500' : 'border-gray-300'}`} />
              {formErrors.featuredVideo && <p className="mt-1 text-sm text-red-500">{formErrors.featuredVideo}</p>}
              <p className="mt-1 text-sm text-gray-500">{t.videoHint}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">{t.status}</label>
          <select id="status" name="status" value={formData.status} onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="draft">{t.draft}</option>
            <option value="published">{t.published}</option>
            <option value="archived">{t.archived}</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {formData.status === 'published' ? t.statusPublishedHint : formData.status === 'draft' ? t.statusDraftHint : t.statusArchivedHint}
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            {t.cancel}
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading
              ? <span className="flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" />{t.saving}</span>
              : <span>{t.saveArticle}</span>}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ─────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', content: '', excerpt: '', category: 'sermon',
  tags: '', status: 'draft', featuredImage: null, featuredVideo: null,
  mediaType: 'none', featuredImageUrl: '',
};

// ─────────────────────────────────────────────
// BlogAdmin
// ─────────────────────────────────────────────
const BlogAdmin = () => {
  const { language } = useLanguage();
  const isTamil = language === 'tamil';

  const t = {
    blogArticles: isTamil ? 'வலைப்பதிவு கட்டுரைகள்' : 'Blog Articles',
    manageBlog: isTamil ? 'உங்கள் தேவாலய வலைப்பதிவு கட்டுரைகளை நிர்வகிக்கவும்' : 'Manage your church blog articles',
    newArticle: isTamil ? 'புதிய கட்டுரை' : 'New Article',
    refresh: isTamil ? 'புதுப்பிக்கவும்' : 'Refresh',
    searchPlaceholder: isTamil ? 'தலைப்பு அல்லது சுருக்கம் மூலம் தேடவும்...' : 'Search by title or excerpt...',
    allStatus: isTamil ? 'அனைத்து நிலை' : 'All Status',
    published: isTamil ? 'வெளியிடப்பட்டது' : 'Published',
    draft: isTamil ? 'வரைவு' : 'Draft',
    archived: isTamil ? 'காப்பகப்படுத்தப்பட்டது' : 'Archived',
    allCategories: isTamil ? 'அனைத்து பிரிவுகள்' : 'All Categories',
    articlesCount: (count) => isTamil ? `கட்டுரைகள் (${count})` : `Articles (${count})`,
    loading: isTamil ? 'கட்டுரைகள் ஏற்றப்படுகின்றன...' : 'Loading articles...',
    retry: isTamil ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry',
    noArticles: isTamil ? 'கட்டுரைகள் எதுவும் இல்லை' : 'No articles found',
    articleHeader: isTamil ? 'கட்டுரை' : 'Article',
    categoryHeader: isTamil ? 'பிரிவு' : 'Category',
    dateHeader: isTamil ? 'தேதி' : 'Date',
    statusHeader: isTamil ? 'நிலை' : 'Status',
    actionsHeader: isTamil ? 'செயல்கள்' : 'Actions',
    editArticle: isTamil ? 'கட்டுரையைத் திருத்து' : 'Edit Article',
    viewArticle: isTamil ? 'கட்டுரையைப் பார்' : 'View Article',
    deleteArticle: isTamil ? 'கட்டுரையை நீக்கு' : 'Delete Article',
    createArticle: isTamil ? 'புதிய கட்டுரையை உருவாக்கு' : 'Create New Article',
    updateExisting: isTamil ? 'உங்கள் கட்டுரையைப் புதுப்பிக்கவும்' : 'Update your existing article',
    addNew: isTamil ? 'உங்கள் வலைப்பதிவில் புதிய கட்டுரையைச் சேர்க்கவும்' : 'Add a new article to your blog',
    backToList: isTamil ? 'பட்டியலுக்குத் திரும்பு' : 'Back to List',
    articleDetails: isTamil ? 'கட்டுரை விவரங்கள்' : 'Article Details',
    title: isTamil ? 'தலைப்பு *' : 'Title *',
    titlePlaceholder: isTamil ? 'கட்டுரைத் தலைப்பை உள்ளிடவும்' : 'Enter article title',
    category: isTamil ? 'பிரிவு *' : 'Category *',
    excerpt: isTamil ? 'சுருக்கம் * (அதிகபட்சம் 200 எழுத்துக்கள்)' : 'Excerpt * (max 200 characters)',
    excerptPlaceholder: isTamil ? 'கட்டுரையின் சுருக்கமான விவரம்' : 'Brief summary of the article',
    content: isTamil ? 'உள்ளடக்கம் *' : 'Content *',
    contentPlaceholder: isTamil ? 'முழு கட்டுரை உள்ளடக்கம்' : 'Full article content',
    tags: isTamil ? 'குறிச்சொற்கள் (காற்புள்ளியால் பிரிக்கவும்)' : 'Tags (comma separated)',
    tagsPlaceholder: isTamil ? 'நம்பிக்கை, பிரார்த்தனை, சமூகம்' : 'faith, prayer, community',
    tagsHint: isTamil ? 'குறிச்சொற்களை காற்புள்ளிகளால் பிரிக்கவும்' : 'Separate tags with commas',
    mediaType: isTamil ? 'ஊடக வகை' : 'Media Type',
    noMedia: isTamil ? 'ஊடகமில்லை' : 'No media',
    image: isTamil ? 'படம்' : 'Image',
    video: isTamil ? 'வீடியோ' : 'Video',
    both: isTamil ? 'இரண்டும்' : 'Both',
    featuredImage: isTamil ? 'சிறப்புப் படம்' : 'Featured Image',
    featuredImageUrl: isTamil ? 'படத்தின் URL' : 'Image URL',
    featuredVideo: isTamil ? 'சிறப்பு வீடியோ' : 'Featured Video',
    imageHint: isTamil ? 'பரிந்துரைக்கப்பட்ட அளவு: 1200x630 பிக்சல்கள், அதிகபட்சம் 5MB' : 'Recommended size: 1200x630 pixels, max 5MB',
    imageUrlHint: isTamil ? 'இணையத்தில் உள்ள படத்தின் இணைப்பை ஒட்டவும் அல்லது காலியாக விடவும்' : 'Paste an online image URL or leave empty',
    videoHint: isTamil ? 'அதிகபட்ச கோப்பு அளவு: 50MB' : 'Max file size: 50MB',
    status: isTamil ? 'நிலை' : 'Status',
    statusPublishedHint: isTamil ? 'கட்டுரை பொதுமக்களுக்குத் தெரியும்' : 'Article will be visible to the public',
    statusDraftHint: isTamil ? 'பின்னர் வெளியிட வரைவாகச் சேமிக்கவும்' : 'Save as draft to publish later',
    statusArchivedHint: isTamil ? 'காப்பகப்படுத்தப்பட்ட கட்டுரைகள் பொதுமக்களுக்குத் தெரியாது' : 'Archived articles are not visible to the public',
    cancel: isTamil ? 'ரத்துசெய்' : 'Cancel',
    saveArticle: isTamil ? 'கட்டுரையைச் சேமி' : 'Save Article',
    saving: isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...',
    edit: isTamil ? 'திருத்து' : 'Edit',
    share: isTamil ? 'பகிர்' : 'Share',
    download: isTamil ? 'பதிவிறக்கு' : 'Download',
    comment: isTamil ? 'கருத்து' : 'Comment',
    views: isTamil ? 'பார்வைகள்' : 'views',
    deleteConfirm: isTamil ? 'இந்தக் கட்டுரையை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this article?',
    deleteSuccess: isTamil ? 'கட்டுரை வெற்றிகரமாக நீக்கப்பட்டது!' : 'Article deleted successfully!',
    deleteFail: isTamil ? 'கட்டுரையை நீக்க முடியவில்லை:' : 'Failed to delete article:',
    saveSuccessUpdate: isTamil ? 'கட்டுரை வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது!' : 'Article updated successfully!',
    saveSuccessCreate: isTamil ? 'கட்டுரை வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Article created successfully!',
    saveFail: isTamil ? 'கட்டுரையைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to save article. Please try again.',
    fetchFail: isTamil ? 'கட்டுரைகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to load articles. Please try again.',
    validationTitle: isTamil ? 'தலைப்பு தேவை' : 'Title is required',
    validationContent: isTamil ? 'உள்ளடக்கம் தேவை' : 'Content is required',
    validationExcerpt: isTamil ? 'சுருக்கம் தேவை' : 'Excerpt is required',
    validationExcerptLength: isTamil ? 'சுருக்கம் 200 எழுத்துக்களுக்கு குறைவாக இருக்க வேண்டும்' : 'Excerpt must be less than 200 characters',
    validationCategory: isTamil ? 'பிரிவு தேவை' : 'Category is required',
    validationImage: isTamil ? 'சிறப்புப் படம் தேவை' : 'Featured image is required',
    validationVideo: isTamil ? 'சிறப்பு வீடியோ தேவை' : 'Featured video is required',
    categories: {
      sermon: isTamil ? 'பிரசங்கம்' : 'Sermon',
      event: isTamil ? 'நிகழ்வு' : 'Event',
      announcement: isTamil ? 'அறிவிப்பு' : 'Announcement',
      testimony: isTamil ? 'சாட்சியம்' : 'Testimony',
      prayer: isTamil ? 'பிரார்த்தனை' : 'Prayer',
      community: isTamil ? 'சமூகம்' : 'Community',
      other: isTamil ? 'மற்றவை' : 'Other',
    },
  };

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const response = await axiosInstance.get(`${API_ENDPOINTS.blogArticles}/admin/all`);
      setArticles(response.data.blogs || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(t.fetchFail);
    } finally { setLoading(false); }
  }, [t.fetchFail]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const filteredArticles = articles.filter((a) => {
    const matchesSearch = searchTerm === '' ||
      (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (filterStatus === 'all' || a.status === filterStatus) && (filterCategory === 'all' || a.category === filterCategory);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'featuredImageUrl') {
      let next = value.trim();
      if (next && !next.startsWith('/') && !/^https?:\/\//i.test(next)) next = `https://${next}`;
      setFormData((prev) => ({ ...prev, featuredImageUrl: next, mediaType: prev.mediaType === 'none' && next ? 'image' : prev.mediaType }));
      setImagePreview(next || null);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const file = files[0];
    if (name === 'featuredImage') {
      setFormData((prev) => ({ ...prev, featuredImage: file, featuredImageUrl: '', mediaType: prev.mediaType === 'none' ? 'image' : prev.mediaType }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      return;
    }
    if (name === 'featuredVideo') {
      setFormData((prev) => ({ ...prev, featuredVideo: file, mediaType: prev.mediaType === 'none' ? 'video' : prev.mediaType }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = t.validationTitle;
    if (!formData.content.trim()) errors.content = t.validationContent;
    if (!formData.excerpt.trim()) errors.excerpt = t.validationExcerpt;
    if (formData.excerpt.length > 200) errors.excerpt = t.validationExcerptLength;
    if (!formData.category) errors.category = t.validationCategory;
    if (!selectedArticle && formData.mediaType === 'image' && !formData.featuredImage && !formData.featuredImageUrl) errors.featuredImage = t.validationImage;
    if (!selectedArticle && formData.mediaType === 'video' && !formData.featuredVideo) errors.featuredVideo = t.validationVideo;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true); setFormSuccess(''); setError(null);
      const fd = new FormData();
      let mt = formData.mediaType;
      if (mt === 'none') {
        if (formData.featuredImage instanceof File || formData.featuredImageUrl) mt = 'image';
        else if (formData.featuredVideo instanceof File) mt = 'video';
      }
      fd.append('title', formData.title);
      fd.append('content', formData.content);
      fd.append('excerpt', formData.excerpt);
      fd.append('category', formData.category);
      fd.append('status', formData.status);
      fd.append('mediaType', mt);
      if (formData.tags) fd.append('tags', formData.tags);
      if (formData.featuredImageUrl) fd.append('featuredImageUrl', formData.featuredImageUrl);
      if (formData.featuredImage instanceof File) fd.append('featuredImage', formData.featuredImage);
      if (formData.featuredVideo instanceof File) fd.append('featuredVideo', formData.featuredVideo);

      const url = selectedArticle
        ? `${API_ENDPOINTS.blogArticles}/admin/update/${selectedArticle._id}`
        : `${API_ENDPOINTS.blogArticles}/admin/create-with-media`;
      const res = selectedArticle
        ? await axiosInstance.put(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await axiosInstance.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (selectedArticle) {
        setArticles((prev) => prev.map((a) => (a._id === selectedArticle._id ? res.data.blog : a)));
        setFormSuccess(t.saveSuccessUpdate);
      } else {
        setArticles((prev) => [res.data.blog, ...prev]);
        setFormSuccess(t.saveSuccessCreate);
        setFormData(EMPTY_FORM);
        setImagePreview(null);
      }
      setTimeout(() => { setCurrentView('list'); setSelectedArticle(null); }, 2000);
    } catch (err) {
      console.error('Error saving article:', err);
      setError(t.saveFail);
    } finally { setLoading(false); }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`${API_ENDPOINTS.blogArticles}/admin/${id}`);
      setArticles((prev) => prev.filter((a) => a._id !== id));
      alert(t.deleteSuccess);
    } catch (err) {
      alert(`${t.deleteFail} ${err.response?.data?.error || err.message}`);
    } finally { setLoading(false); }
  };

  const handleEditArticle = (article) => {
    const hasImage = !!article.featuredImage;
    const hasVideo = !!article.featuredVideo;
    let mediaType = article.mediaType || 'none';
    if (mediaType === 'none') {
      if (hasImage && hasVideo) mediaType = 'both';
      else if (hasImage) mediaType = 'image';
      else if (hasVideo) mediaType = 'video';
    }
    setSelectedArticle(article);
    setFormData({
      title: article.title || '', content: article.content || '', excerpt: article.excerpt || '',
      category: article.category || 'sermon', tags: article.tags ? article.tags.join(', ') : '',
      status: article.status || 'draft', featuredImage: null, featuredVideo: null,
      mediaType, featuredImageUrl: hasImage ? article.featuredImage : '',
    });
    setImagePreview(hasImage
      ? (typeof article.featuredImage === 'string' && article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage}`)
      : null);
    setFormErrors({}); setFormSuccess('');
    setCurrentView('edit');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'N/A'; }
  };

  const getStatusColor = (s) => ({ published: 'bg-green-100 text-green-800 border-green-200', draft: 'bg-yellow-100 text-yellow-800 border-yellow-200', archived: 'bg-red-100 text-red-800 border-red-200' }[s] || 'bg-gray-100 text-gray-800 border-gray-200');
  const getStatusLabel = (s) => ({ published: t.published, draft: t.draft, archived: t.archived }[s] || s);
  const getCategoryLabel = (c) => t.categories[c] || c;

  const openCreate = () => {
    setSelectedArticle(null); setFormData(EMPTY_FORM); setImagePreview(null);
    setFormErrors({}); setFormSuccess(''); setError(null);
    setCurrentView('create');
  };
  const handleCancel = () => { setCurrentView('list'); setSelectedArticle(null); };

  // Full-page view (no admin chrome wrapper)
  if (currentView === 'view') {
    return (
      <ArticleView
        selectedArticle={selectedArticle}
        onEdit={() => handleEditArticle(selectedArticle)}
        onBack={handleCancel}
        t={t}
        BASE_URL={BASE_URL}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* LIST */}
        {currentView === 'list' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.blogArticles}</h1>
                  <p className="text-gray-600">{t.manageBlog}</p>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button onClick={openCreate} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" /><span>{t.newArticle}</span>
                  </button>
                  <button onClick={fetchArticles} disabled={loading} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>{t.refresh}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">{t.allStatus}</option>
                    <option value="published">{t.published}</option>
                    <option value="draft">{t.draft}</option>
                    <option value="archived">{t.archived}</option>
                  </select>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">{t.allCategories}</option>
                    {Object.entries(t.categories).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{t.articlesCount(filteredArticles.length)}</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" /><p className="text-gray-600">{t.loading}</p></div>
              ) : error ? (
                <div className="p-8 text-center text-red-500"><FileText className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>{error}</p><button onClick={fetchArticles} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t.retry}</button></div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-8 text-center text-gray-500"><FileText className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>{t.noArticles}</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {[t.articleHeader, t.categoryHeader, t.dateHeader, t.statusHeader, t.actionsHeader].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredArticles.map((article) => (
                        <tr key={article._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                                {article.featuredImage ? (
                                  <img src={typeof article.featuredImage === 'string' && article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage}`}
                                    alt={article.title} className="h-10 w-10 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : article.mediaType === 'video' ? (
                                  <div className="h-10 w-10 flex items-center justify-center bg-blue-100"><Video className="w-5 h-5 text-blue-600" /></div>
                                ) : (
                                  <div className="h-10 w-10 flex items-center justify-center bg-gray-100"><FileText className="w-5 h-5 text-gray-600" /></div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{article.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{article.excerpt}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{getCategoryLabel(article.category)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(article.publishedAt || article.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(article.status)}`}>{getStatusLabel(article.status)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleEditArticle(article)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100" title={t.editArticle}><Edit className="w-4 h-4" /></button>
                              <button onClick={() => { setSelectedArticle(article); setCurrentView('view'); }} className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100" title={t.viewArticle}><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteArticle(article._id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100" title={t.deleteArticle}><Trash2 className="w-4 h-4" /></button>
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
        )}

        {/* CREATE / EDIT */}
        {(currentView === 'create' || currentView === 'edit') && (
          <ArticleForm
            selectedArticle={selectedArticle} formData={formData} formErrors={formErrors}
            formSuccess={formSuccess} error={error} loading={loading} imagePreview={imagePreview}
            handleInputChange={handleInputChange} handleFileChange={handleFileChange}
            handleSubmit={handleSubmit} onCancel={handleCancel} t={t} isTamil={isTamil}
          />
        )}
      </div>

      {currentView === 'list' && (
        <button onClick={openCreate} className="fixed bottom-6 right-6 px-4 py-3 rounded-full bg-blue-600 text-white shadow-lg flex items-center space-x-2 z-[2001]">
          <Plus className="w-5 h-5" /><span>{t.newArticle}</span>
        </button>
      )}
    </div>
  );
};

export default BlogAdmin;
