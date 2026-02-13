import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button 
      onClick={toggleLanguage}
      style={{
        background: 'none',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '4px',
        padding: '6px 12px',
        color: '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '14px'
      }}
    >
      {language === 'english' ? 'தமிழ்' : 'English'}
    </button>
  );
};

export default LanguageSwitcher;