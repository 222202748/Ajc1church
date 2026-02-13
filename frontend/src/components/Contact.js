import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const Contact = () => {
  const { language } = useLanguage();
  const t = translations[language] || {};

  // Use optional chaining for nested objects
  const contactText = t.contact || {};

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center mb-4">{t.contactUs || 'Contact Us'}</h2>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <form>
              <div className="mb-3">
                <label className="form-label">{contactText.nameLabel || 'Name'}</label>
                <input type="text" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">{contactText.emailLabel || 'Email'}</label>
                <input type="email" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">{contactText.messageLabel || 'Message'}</label>
                <textarea className="form-control" rows="5"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                {contactText.submitButton || 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;