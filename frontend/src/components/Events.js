import React, { useState } from 'react';

const Events = () => {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      title: 'Upcoming Events',
      description: 'Get the latest insights, expert tips, and updates to stay informed and inspired.',
      buttonText: 'Events Calendar',
      images: [
        { text: 'Cross', alt: 'Church Image 1' },
        { text: 'Bible', alt: 'Church Image 2' },
        { text: 'Bishop', alt: 'Church Image 3' },
        { text: 'Crucifix', alt: 'Church Image 4' }
      ]
    },
    ta: {
      title: 'வரவிருக்கும் நிகழ்வுகள்',
      description: 'சமீபத்திய நுண்ணறிவுகள், நிபுணர் குறிப்புகள் மற்றும் புதுப்பிப்புகளைப் பெற்று தகவலறிந்து ஊக்கமளிக்கப்படுங்கள்.',
      buttonText: 'நிகழ்வுகள் காலண்டர்',
      images: [
        { text: 'சிலுவை', alt: 'தேவாலய படம் 1' },
        { text: 'வேதாகமம்', alt: 'தேவாலய படம் 2' },
        { text: 'பிஷப்', alt: 'தேவாலய படம் 3' },
        { text: 'கிருசிபிக்ஸ்', alt: 'தேவாலய படம் 4' }
      ]
    }
  };

  const currentLang = translations[language];

  return (
    <>
      <section className="bg-light py-5">
        <div className="container text-center">
          <div className="mb-3">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="btn btn-sm btn-outline-secondary"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
          <h3 className="fw-bold">{currentLang.title}</h3>
          <p>{currentLang.description}</p>
          <a href="#" className="btn btn-outline-dark">{currentLang.buttonText}</a>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-3">
            {currentLang.images.map((image, index) => (
              <div key={index} className="col-6 col-md-3">
                <img 
                  src={`https://via.placeholder.com/300x200?text=${image.text}`} 
                  className="img-fluid rounded" 
                  alt={image.alt} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Events;