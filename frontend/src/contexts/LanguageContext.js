import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'english';
  });

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'english' ? 'tamil' : 'english';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.lang = newLanguage === 'tamil' ? 'ta' : 'en';
    // Force a re-render of all components
    window.dispatchEvent(new Event('languagechange'));
  }, [language]);

  // Helper function to get the current language display name
  const getLanguageDisplayName = useCallback(() => {
    return language === 'tamil' ? 'தமிழ்' : 'English';
  }, [language]);

  // Helper function to get language code for HTML lang attribute
  const getLanguageCode = useCallback(() => {
    return language === 'tamil' ? 'ta' : 'en';
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = getLanguageCode();
  }, [getLanguageCode]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      toggleLanguage, 
      getLanguageDisplayName,
      getLanguageCode
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};