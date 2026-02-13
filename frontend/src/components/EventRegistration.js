import React from 'react';
import { useLocation } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';

const EventRegistration = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const location = useLocation();
  const eventData = location.state || {};

  const handleSubmit = async (formData) => {
    try {
      // Map frontend field 'numberOfPeople' to backend field 'attendeeCount'
      const dataToSubmit = {
        ...formData,
        attendeeCount: formData.numberOfPeople,
        eventType: eventData.eventTitle || t.eventRegistration.eventTitle || 'General Event'
      };
      
      console.log('Submitting registration data:', dataToSubmit);
      
      const response = await axiosInstance.post(API_ENDPOINTS.eventRegistration, dataToSubmit, { requiresAuth: false });

      console.log('Registration successful:', response.data);
      alert(t.eventRegistration.successMessage || 'Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.response?.data?.error || error.message}. Please try again.`);
    }
  };

  return (
    <div className="event-registration">
      <style>{`
        .event-registration {
          min-height: 100vh;
          padding: 4rem 1rem;
          background: linear-gradient(135deg, #92400e, #b45309);
        }

        .event-registration h1 {
          text-align: center;
          color: white;
          margin-bottom: 2rem;
          font-size: 2.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <h1>{t.eventRegistration.title}</h1>
      <RegistrationForm
        eventType="event"
        eventTitle={eventData.eventTitle || t.eventRegistration.eventTitle}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EventRegistration;