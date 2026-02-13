import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language] || {};

  return (
    <footer className="pt-5 pb-3 bg-dark text-light">
      <div className="container">
        <div className="row gy-4">

          {/* Brand Section */}
          <div className="col-12 col-md-4 text-center text-md-start">
            <h4 className="fw-bold">AJC Siluvairaja Ministry</h4>
            <p className="small">{t.footer?.church || ''}</p>
            <p className="small">{t.footer?.branch || ''}</p>
            <p className="h5 fw-bold">{t.footer?.phone || 'Phone'}: +919841711591, +919444201754</p>
            <p className="h5 fw-bold">{t.footer?.whatsapp || 'WhatsApp'}: +919841711591, +919444201754</p>
            <p className="small">{t.footer?.support || ''}: @gmail.com</p>
          </div>

          {/* Newsletter Section */}
          <div className="col-12 col-md-4 text-center text-md-start">
            <h5>{t.footer?.newsletter || 'Newsletter'}</h5>
            <form className="d-flex flex-column flex-sm-row align-items-center mt-2">
              <input
                type="email"
                className="form-control me-sm-2 mb-2 mb-sm-0"
                placeholder={t.footer?.emailPlaceholder || 'Enter your email'}
              />
              <button className="btn btn-outline-light" type="submit">
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
            <p className="small mt-2">{t.footer?.newsletterText || ''}</p>
          </div>

          {/* Quick Links and Working Hours */}
          <div className="col-12 col-md-4 text-center text-md-start">
            <div className="row">
              <div className="col-6">
                <h6 className="fw-bold">{t.footer?.quickLinks || 'Quick Links'}</h6>
                <ul className="list-unstyled small">
                  <li><a href="/" className="text-light text-decoration-none">{t.home || 'Home'}</a></li>
                  <li><a href="/pastors" className="text-light text-decoration-none">{t.pastors || 'Pastors'}</a></li>
                  <li><a href="/sermons" className="text-light text-decoration-none">{t.sermons || 'Sermons'}</a></li>
                  <li><a href="/events" className="text-light text-decoration-none">{t.events || 'Events'}</a></li>
                  {/* Contact link removed as requested */}
                </ul>
              </div>
              <div className="col-6">
                <h6 className="fw-bold">{t.footer?.workingHours || 'Working Hours'}</h6>
                <ul className="list-unstyled small">
                  <li>{t.footer?.monFri || 'Mon-Fri: 9am - 5pm'}</li>
                  <li>{t.footer?.sat || 'Saturday: 10am - 2pm'}</li>
                  <li>{t.footer?.sun || 'Sunday: Closed'}</li>
                </ul>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-3">
              <h6 className="fw-bold">{t.footer?.followUs || 'Follow Us'}</h6>
              <a href="#" className="text-light me-3"><i className="bi bi-facebook fs-5"></i></a>
              <a href="#" className="text-light me-3"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#" className="text-light me-3"><i className="bi bi-youtube fs-5"></i></a>
              <a href="#" className="text-light"><i className="bi bi-telegram fs-5"></i></a>
            </div>
          </div>
        </div>

        <hr className="border-light my-4" />

        {/* Footer Bottom */}
        <div className="text-center small">
          © 2025 AJC Siluvairaja Ministry. {t.footer?.allRightsReserved || 'All rights reserved'}
          <span className="mx-2">|</span>
          <a href="#" className="text-light text-decoration-none">{t.footer?.termsOfService || 'Terms of Service'}</a>
          <span className="mx-2">|</span>
          <a href="#" className="text-light text-decoration-none">{t.footer?.privacyPolicy || 'Privacy Policy'}</a>
          <span className="mx-2">|</span>
          <a href="#" className="text-light text-decoration-none">{t.footer?.cookiePolicy || 'Cookie Policy'}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
