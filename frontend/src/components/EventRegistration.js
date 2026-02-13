import React from 'react';
import { useLocation } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { API_ENDPOINTS } from '../config/api';

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
      
      const response = await fetch(API_ENDPOINTS.eventRegistration, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`Registration failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      alert(t.eventRegistration.successMessage || 'Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('Unable to connect to server. Please check if the backend is running.');
      } else {
        alert(`Registration failed: ${error.message}. Please try again.`);
      }
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