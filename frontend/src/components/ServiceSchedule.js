import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';

const ServiceSchedule = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('weekly');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.serviceSchedules);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Translations
  const translations = {
    english: {
      title: 'Church Service Schedule',
      subtitle: 'Join us for worship and fellowship',
      weekly: 'Weekly Services',
      special: 'Special Services',
      upcoming: 'Upcoming Events',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNames: {
        'Sunday': 'Sunday',
        'Monday': 'Monday',
        'Tuesday': 'Tuesday',
        'Wednesday': 'Wednesday',
        'Thursday': 'Thursday',
        'Friday': 'Friday',
        'Saturday': 'Saturday'
      },
      time: 'Time',
      service: 'Service',
      location: 'Location',
      date: 'Date',
      specialNote: 'Special Note',
      holidaySchedule: 'Holiday schedule may vary. Please check our announcements for updates.',
      viewAll: 'View All Events',
      loading: 'Loading schedule...',
      noSchedule: 'No schedules available for this category.'
    },
    tamil: {
      title: 'தேவாலய சேவை அட்டவணை',
      subtitle: 'வழிபாடு மற்றும் ஐக்கியத்திற்காக எங்களுடன் இணையுங்கள்',
      weekly: 'வாராந்திர சேவைகள்',
      special: 'சிறப்பு சேவைகள்',
      upcoming: 'வரவிருக்கும் நிகழ்வுகள்',
      days: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
      dayNames: {
        'Sunday': 'ஞாயிறு',
        'Monday': 'திங்கள்',
        'Tuesday': 'செவ்வாய்',
        'Wednesday': 'புதன்',
        'Thursday': 'வியாழன்',
        'Friday': 'வெள்ளி',
        'Saturday': 'சனி'
      },
      time: 'நேரம்',
      service: 'சேவை',
      location: 'இடம்',
      date: 'தேதி',
      specialNote: 'சிறப்பு குறிப்பு',
      holidaySchedule: 'விடுமுறை அட்டவணை மாறுபடலாம். புதுப்பிப்புகளுக்கு எங்கள் அறிவிப்புகளைப் பார்க்கவும்.',
      viewAll: 'அனைத்து நிகழ்வுகளையும் காண',
      loading: 'அட்டவணை ஏற்றப்படுகிறது...',
      noSchedule: 'இந்த வகைக்கு அட்டவணைகள் எதுவும் இல்லை.'
    }
  };

  const t = translations[language === 'tamil' ? 'tamil' : 'english'];

  // Filter schedules by active tab
  const filteredSchedules = schedules.filter(s => s.type === activeTab);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(language === 'tamil' ? 'ta-IN' : 'en-US', options);
  };

  // Styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px 0',
    borderBottom: '2px solid #f0f0f0',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: '10px',
  };

  const subtitleStyle = {
    fontSize: '18px',
    color: '#666',
    fontWeight: 'normal',
  };

  const tabsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    marginRight: '10px',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #8B4513' : '3px solid transparent',
    color: isActive ? '#8B4513' : '#666',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
  });

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  const thStyle = {
    backgroundColor: '#8B4513',
    color: 'white',
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
  };

  const tdStyle = {
    padding: '15px',
    borderBottom: '1px solid #eee',
    color: '#333',
  };

  const trStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
    transition: 'background-color 0.3s ease',
  });

  const noteStyle = {
    backgroundColor: '#FFF8E1',
    padding: '15px 20px',
    borderRadius: '8px',
    marginTop: '20px',
    borderLeft: '4px solid #FFB74D',
  };

  const noteTextStyle = {
    margin: '0',
    color: '#5D4037',
    fontSize: '14px',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '18px'
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h2 style={titleStyle}>{t.title}</h2>
        <p style={subtitleStyle}>{t.subtitle}</p>
      </header>

      <div style={tabsContainerStyle}>
        <div 
          style={tabStyle(activeTab === 'weekly')} 
          onClick={() => setActiveTab('weekly')}
        >
          {t.weekly}
        </div>
        <div 
          style={tabStyle(activeTab === 'special')} 
          onClick={() => setActiveTab('special')}
        >
          {t.special}
        </div>
        <div 
          style={tabStyle(activeTab === 'upcoming')} 
          onClick={() => setActiveTab('upcoming')}
        >
          {t.upcoming}
        </div>
      </div>

      {loading ? (
        <div style={loadingStyle}>{t.loading}</div>
      ) : filteredSchedules.length > 0 ? (
        <div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{activeTab === 'weekly' ? t.days[0] : t.date}</th>
                <th style={thStyle}>{t.time}</th>
                <th style={thStyle}>{t.service}</th>
                <th style={thStyle}>{t.location}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule, index) => (
                <tr key={schedule._id || index} style={trStyle(index)}>
                  <td style={tdStyle}>
                    {activeTab === 'weekly' 
                      ? (t.dayNames[schedule.day] || schedule.day)
                      : formatDate(schedule.date)}
                  </td>
                  <td style={tdStyle}>{schedule.time}</td>
                  <td style={tdStyle}>{schedule.serviceName}</td>
                  <td style={tdStyle}>{schedule.location}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeTab === 'weekly' && (
            <div style={noteStyle}>
              <p style={noteTextStyle}>
                <strong>{t.specialNote}:</strong> {t.holidaySchedule}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={loadingStyle}>{t.noSchedule}</div>
      )}
    </div>
  );
};

export default ServiceSchedule;
