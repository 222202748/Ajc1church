import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'english';
  });

  const toggleLanguage = () => {
    const newLanguage = language === 'english' ? 'tamil' : 'english';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.lang = newLanguage === 'tamil' ? 'ta' : 'en';
    // Force a re-render of all components
    window.dispatchEvent(new Event('languagechange'));
  };

  // Helper function to get the current language display name
  const getLanguageDisplayName = () => {
    return language === 'tamil' ? 'தமிழ்' : 'English';
  };

  // Helper function to get language code for HTML lang attribute
  const getLanguageCode = () => {
    return language === 'tamil' ? 'ta' : 'en';
  };

  useEffect(() => {
    document.documentElement.lang = getLanguageCode();
  }, [language]);

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