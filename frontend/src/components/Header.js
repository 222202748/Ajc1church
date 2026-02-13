import React from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const Header = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <>
      <style>{`
        .hero {
          background-image: url('https://conradschmitt.com/wp-content/uploads/2022/03/StThomasFinished-1.jpg');
          background-size: cover;
          background-position: center;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          text-align: center;
          padding: 1rem;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 320px;
          margin: auto;
        }

        .hero h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.8rem;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
          line-height: 1.2;
        }

        .hero p {
          font-size: 0.95rem;
          margin-bottom: 1.2rem;
          opacity: 0.95;
          padding: 0 0.5rem;
          line-height: 1.4;
        }

        .hero-btn {
          background: white;
          color: #92400e;
          border: none;
          padding: 10px 20px;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          text-decoration: none;
          display: inline-block;
        }

        .hero-btn:hover {
          background: #fef3c7;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .bible-bg, .bible-bg2 {
          display: none;
        }

        @media (min-width: 480px) {
          .hero-content {
            max-width: 400px;
          }
          .hero h1 {
            font-size: 2.2rem;
          }
          .hero p {
            font-size: 1rem;
            padding: 0 0.8rem;
          }
        }

        @media (min-width: 768px) {
          .hero-content {
            max-width: 600px;
          }
          .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          .hero p {
            font-size: 1.1rem;
            padding: 0 1rem;
            margin-bottom: 1.5rem;
          }
          .hero {
            padding: 1.5rem;
          }
        }

        @media (min-width: 992px) {
          .hero-content {
            max-width: 700px;
          }
          .hero h1 {
            font-size: 2.8rem;
          }
          .hero p {
            font-size: 1.2rem;
          }
          .hero {
            padding: 2rem;
          }
          .bible-bg {
            display: block;
            position: absolute;
            top: 10%;
            right: 10%;
            width: 200px;
            height: 250px;
            background: rgba(139, 69, 19, 0.1);
            border-radius: 5px;
            transform: rotate(15deg);
            z-index: 1;
          }

          .bible-bg2 {
            display: block;
            position: absolute;
            bottom: 20%;
            left: 15%;
            width: 150px;
            height: 200px;
            background: rgba(160, 82, 45, 0.1);
            border-radius: 5px;
            transform: rotate(-10deg);
            z-index: 1;
          }
        }
      `}</style>

      <header className="hero">
        <div className="bible-bg"></div>
        <div className="bible-bg2"></div>

        <div className="container hero-content">
          <h1>{t?.header?.welcomeTitle || t?.welcomeTitle || 'God\'s Glory!'}</h1>
          <p>
            {t?.header?.churchDescription || t?.churchDescription || 'AJC SILUVAIRAJA MINISTRY - faith, love, community!'}
          </p>
          <div className="hero-buttons">
            <Link to="/sermons" className="hero-btn">
              {t?.header?.joinUsNow || t?.joinUsNow || 'Join Us Now →'}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;