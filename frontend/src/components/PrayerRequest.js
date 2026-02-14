import React, { useState } from 'react';
import { Send, Check, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';

const PrayerRequest = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requestType: 'personal',
    prayerRequest: '',
    isConfidential: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  const translations = {
    en: {
      title: 'Prayer Request',
      subtitle: 'Share your prayer needs with us',
      nameLabel: 'Your Name',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number (Optional)',
      requestTypeLabel: 'Request Type',
      requestTypes: {
        personal: 'Personal',
        family: 'Family',
        health: 'Health & Healing',
        financial: 'Financial',
        spiritual: 'Spiritual Growth',
        other: 'Other'
      },
      prayerRequestLabel: 'Your Prayer Request',
      prayerRequestPlaceholder: 'Please share your prayer needs...',
      confidentialLabel: 'Keep this request confidential',
      submitButton: 'Submit Prayer Request',
      submittingButton: 'Submitting...',
      successMessage: 'Your prayer request has been submitted. Our prayer team will be praying for you.',
      errorMessage: 'There was an error submitting your request. Please try again.',
      requiredField: 'This field is required',
      notificationSent: 'Admin has been notified of your prayer request.'
    },
    ta: {
      title: 'ஜெப வேண்டுகோள்',
      subtitle: 'உங்கள் ஜெப தேவைகளை எங்களுடன் பகிர்ந்து கொள்ளுங்கள்',
      nameLabel: 'உங்கள் பெயர்',
      emailLabel: 'மின்னஞ்சல் முகவரி',
      phoneLabel: 'தொலைபேசி எண் (விருப்பம்)',
      requestTypeLabel: 'வேண்டுகோள் வகை',
      requestTypes: {
        personal: 'தனிப்பட்ட',
        family: 'குடும்பம்',
        health: 'ஆரோக்கியம் & குணமாதல்',
        financial: 'நிதி',
        spiritual: 'ஆன்மீக வளர்ச்சி',
        other: 'மற்றவை'
      },
      prayerRequestLabel: 'உங்கள் ஜெப வேண்டுகோள்',
      prayerRequestPlaceholder: 'தயவுசெய்து உங்கள் ஜெப தேவைகளை பகிரவும்...',
      confidentialLabel: 'இந்த வேண்டுகோளை ரகசியமாக வைக்கவும்',
      submitButton: 'ஜெப வேண்டுகோளை சமர்ப்பிக்கவும்',
      submittingButton: 'சமர்ப்பிக்கிறது...',
      successMessage: 'உங்கள் ஜெப வேண்டுகோள் சமர்ப்பிக்கப்பட்டது. எங்கள் ஜெபக் குழு உங்களுக்காக ஜெபிக்கும்.',
      errorMessage: 'உங்கள் வேண்டுகோளைச் சமர்ப்பிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      requiredField: 'இந்த புலம் தேவை',
      notificationSent: 'நிர்வாகிக்கு உங்கள் ஜெப வேண்டுகோள் பற்றி அறிவிக்கப்பட்டுள்ளது.'
    }
  };
  
  const t = translations[language] || translations.en;
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.name || !formData.email || !formData.prayerRequest) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send data to backend
      await axiosInstance.post(API_ENDPOINTS.prayerRequests, formData, { requiresAuth: false });
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        requestType: 'personal',
        prayerRequest: '',
        isConfidential: false
      });
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      setError(t.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setSubmitted(false);
    setError(null);
  };
  
  return (
    <div className="bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 my-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="mt-2">{t.subtitle}</p>
        </div>
        
        {submitted ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.title}</h3>
            <p className="text-gray-600 mb-4">{t.successMessage}</p>
            <div className="flex items-center justify-center text-blue-600 mb-6">
              <Bell className="w-4 h-4 mr-2" />
              <p className="text-sm">{t.notificationSent}</p>
            </div>
            <button
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t.nameLabel} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t.emailLabel} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="requestType" className="block text-sm font-medium text-gray-700">
                  {t.requestTypeLabel}
                </label>
                <select
                  id="requestType"
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(t.requestTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="prayerRequest" className="block text-sm font-medium text-gray-700">
                {t.prayerRequestLabel} *
              </label>
              <textarea
                id="prayerRequest"
                name="prayerRequest"
                rows="4"
                value={formData.prayerRequest}
                onChange={handleChange}
                required
                placeholder={t.prayerRequestPlaceholder}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isConfidential"
                    name="isConfidential"
                    type="checkbox"
                    checked={formData.isConfidential}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isConfidential" className="font-medium text-gray-700">
                    {t.confidentialLabel}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.submittingButton}
                  </>
                ) : (
                  <>
                    <Send className="-ml-1 mr-2 h-5 w-5" />
                    {t.submitButton}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PrayerRequest;