import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Ensure Bootstrap Icons are loaded

// Helper: Safely get nested translation
const getTranslation = (language, key, fallback) => {
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

const PastorCard = ({ name, image, role, description, phone, whatsapp }) => {
  const { language } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Failed to load image: ${image}`);
    }
  };

  const placeholderImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320'%3E%3Crect width='320' height='320' fill='%23f0f0f0'/%3E%3Ccircle cx='160' cy='120' r='50' fill='%23ccc'/%3E%3Cpath d='M80 280c0-44 36-80 80-80s80 36 80 80' fill='%23ccc'/%3E%3C/svg%3E";

  const getImageSrc = () => {
    if (imageError || !image || typeof image !== 'string') return placeholderImage;

    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      return image;
    }

    // Encode the image filename to handle spaces and special characters
    return `/images/${encodeURIComponent(image)}`;
  };

  const pastorCardStyle = {
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  return (
    <div className="col-12 col-lg-10 col-xl-8 mx-auto">
      <div
        className="pastor-card d-flex flex-column flex-lg-row bg-light p-4 rounded-3 align-items-center shadow-sm"
        style={pastorCardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <img
          src={getImageSrc()}
          className="img-fluid rounded-circle mb-3 mb-lg-0 me-lg-4"
          alt={name || 'Pastor'}
          onError={handleImageError}
          style={{
            width: '100%',
            maxWidth: '320px',
            height: 'auto',
            objectFit: 'cover',
            border: '4px solid #8B4513'
          }}
        />

        <div className="pastor-info text-center text-lg-start" style={{ flex: 1 }}>
          <h3 className="fw-bold text-primary mb-2">{name}</h3>
          <p className="text-muted mb-3 fs-5">{role}</p>
          <p className="mb-3">{description}</p>

          {/* Communication Buttons */}
          <div className="communication-buttons mb-3 d-flex flex-column flex-lg-row gap-2">
            <a
              href={`tel:${phone}`}
              className="btn btn-outline-primary d-inline-flex align-items-center call-btn flex-fill"
              aria-label={getTranslation(language, 'pastors.callNow', 'Call Now')}
              style={{
                borderColor: '#8B4513',
                color: '#8B4513',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8B4513';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#8B4513';
              }}
            >
              <i className="bi bi-telephone-fill me-2"></i>
              {getTranslation(language, 'pastors.callNow', 'Call Now')}
            </a>

            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success d-inline-flex align-items-center whatsapp-btn flex-fill"
              aria-label={getTranslation(language, 'pastors.whatsapp', 'WhatsApp')}
              style={{
                backgroundColor: '#25D366',
                borderColor: '#25D366',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1ea952';
                e.currentTarget.style.borderColor = '#1ea952';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#25D366';
                e.currentTarget.style.borderColor = '#25D366';
              }}
            >
              <i className="bi bi-whatsapp me-2"></i>
              {getTranslation(language, 'pastors.whatsapp', 'WhatsApp')}
            </a>
          </div>

          {/* Social Media Icons (removed as requested) */}
          <div className="social-icons"></div>
        </div>
      </div>
    </div>
  );
};

const Pastors = () => {
  const { language } = useLanguage();

  const pastors = [
    {
      name: getTranslation(language, 'pastors.pastorName', 'SILUVAI RAJA'),
      role: getTranslation(language, 'pastors.pastorRole', 'Pastor'),
      image: 'pastor-img.jpg', // Using hyphen instead of space for better URL compatibility
      description: getTranslation(
        language,
        'pastors.pastorDescription',
        'A dedicated spiritual leader with over 15 years of experience in ministry.'
      ),
      phone: '+919841711591',
      whatsapp: '919841711591'
    }
  ];

  return (
    <section className="py-5" style={{ background: '#f8f9fa' }}>
      <div className="container">
        <h2 className="text-center fw-bold mb-4" style={{ color: '#8B4513' }}>
          {getTranslation(language, 'pastors.meetOurPastor', 'Meet Our Pastor')}
        </h2>
        <p className="text-center mb-5 lead">
          {getTranslation(
            language,
            'pastors.meetOurPastorDescription',
            'Meet our pastor, a dedicated leader guiding our community in faith and love.'
          )}
        </p>
        <div className="row g-4 justify-content-center">
          {pastors.map((pastor, index) => (
            <PastorCard key={index} {...pastor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pastors;