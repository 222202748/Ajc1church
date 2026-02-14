import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ServiceSchedule = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('weekly');

  // Translations
  const translations = {
    english: {
      title: 'Church Service Schedule',
      subtitle: 'Join us for worship and fellowship',
      weekly: 'Weekly Services',
      special: 'Special Services',
      upcoming: 'Upcoming Events',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      time: 'Time',
      service: 'Service',
      location: 'Location',
      mainHall: 'Main Hall',
      chapelRoom: 'Chapel Room',
      youthCenter: 'Youth Center',
      prayerRoom: 'Prayer Room',
      morningPrayer: 'Morning Prayer',
      sundaySchool: 'Sunday School',
      mainService: 'Main Service',
      eveningService: 'Evening Service',
      bibleStudy: 'Bible Study',
      youthService: 'Youth Service',
      choirPractice: 'Choir Practice',
      womenFellowship: 'Women Fellowship',
      menFellowship: 'Men Fellowship',
      familyPrayer: 'Family Prayer',
      specialNote: 'Special Note',
      holidaySchedule: 'Holiday schedule may vary. Please check our announcements for updates.',
      viewAll: 'View All Events',
    },
    tamil: {
      title: 'தேவாலய சேவை அட்டவணை',
      subtitle: 'வழிபாடு மற்றும் ஐக்கியத்திற்காக எங்களுடன் இணையுங்கள்',
      weekly: 'வாராந்திர சேவைகள்',
      special: 'சிறப்பு சேவைகள்',
      upcoming: 'வரவிருக்கும் நிகழ்வுகள்',
      days: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
      time: 'நேரம்',
      service: 'சேவை',
      location: 'இடம்',
      mainHall: 'முக்கிய மண்டபம்',
      chapelRoom: 'சிற்றாலயம்',
      youthCenter: 'இளைஞர் மையம்',
      prayerRoom: 'ஜெப அறை',
      morningPrayer: 'காலை ஜெபம்',
      sundaySchool: 'ஞாயிறு பள்ளி',
      mainService: 'முக்கிய ஆராதனை',
      eveningService: 'மாலை ஆராதனை',
      bibleStudy: 'வேதாகம ஆய்வு',
      youthService: 'இளைஞர் ஆராதனை',
      choirPractice: 'பாடகர் குழு பயிற்சி',
      womenFellowship: 'பெண்கள் ஐக்கியம்',
      menFellowship: 'ஆண்கள் ஐக்கியம்',
      familyPrayer: 'குடும்ப ஜெபம்',
      specialNote: 'சிறப்பு குறிப்பு',
      holidaySchedule: 'விடுமுறை அட்டவணை மாறுபடலாம். புதுப்பிப்புகளுக்கு எங்கள் அறிவிப்புகளைப் பார்க்கவும்.',
      viewAll: 'அனைத்து நிகழ்வுகளையும் காண',
    }
  };

  const t = translations[language === 'tamil' ? 'tamil' : 'english'];

  // Weekly service schedule data
  const weeklyServices = [
    { day: t.days[0], time: '07:00 AM', service: t.morningPrayer, location: t.prayerRoom },
    { day: t.days[0], time: '09:00 AM', service: t.sundaySchool, location: t.chapelRoom },
    { day: t.days[0], time: '10:30 AM', service: t.mainService, location: t.mainHall },
    { day: t.days[0], time: '06:00 PM', service: t.eveningService, location: t.mainHall },
    { day: t.days[2], time: '07:00 PM', service: t.bibleStudy, location: t.chapelRoom },
    { day: t.days[3], time: '06:30 PM', service: t.choirPractice, location: t.mainHall },
    { day: t.days[5], time: '07:00 PM', service: t.youthService, location: t.youthCenter },
    { day: t.days[6], time: '04:00 PM', service: t.womenFellowship, location: t.chapelRoom },
  ];

  // Special services data
  const specialServices = [
    { date: '2023-12-24', time: '07:00 PM', service: 'Christmas Eve Service', location: t.mainHall },
    { date: '2023-12-25', time: '10:00 AM', service: 'Christmas Day Celebration', location: t.mainHall },
    { date: '2023-12-31', time: '10:30 PM', service: 'New Year Eve Watch Night Service', location: t.mainHall },
    { date: '2024-01-01', time: '10:30 AM', service: 'New Year Blessing Service', location: t.mainHall },
    { date: '2024-04-07', time: '06:00 AM', service: 'Easter Sunrise Service', location: t.mainHall },
  ];

  // Upcoming events data
  const upcomingEvents = [
    { date: '2023-11-20', time: '09:00 AM', event: 'Community Outreach Program', location: 'Community Center' },
    { date: '2023-11-25', time: '10:00 AM', event: 'Children\'s Day Celebration', location: t.mainHall },
    { date: '2023-12-10', time: '04:00 PM', event: 'Christmas Carol Service', location: t.mainHall },
    { date: '2023-12-15', time: '06:00 PM', event: 'Youth Christmas Celebration', location: t.youthCenter },
  ];

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

  const buttonStyle = {
    display: 'block',
    width: '200px',
    margin: '30px auto 0',
    padding: '12px 0',
    backgroundColor: '#8B4513',
    color: 'white',
    textAlign: 'center',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 10px rgba(139, 69, 19, 0.3)',
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

      {activeTab === 'weekly' && (
        <div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{t.days[0]}</th>
                <th style={thStyle}>{t.time}</th>
                <th style={thStyle}>{t.service}</th>
                <th style={thStyle}>{t.location}</th>
              </tr>
            </thead>
            <tbody>
              {weeklyServices.map((service, index) => (
                <tr key={index} style={trStyle(index)}>
                  <td style={tdStyle}>{service.day}</td>
                  <td style={tdStyle}>{service.time}</td>
                  <td style={tdStyle}>{service.service}</td>
                  <td style={tdStyle}>{service.location}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={noteStyle}>
            <p style={noteTextStyle}>
              <strong>{t.specialNote}:</strong> {t.holidaySchedule}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'special' && (
        <div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>{t.time}</th>
                <th style={thStyle}>{t.service}</th>
                <th style={thStyle}>{t.location}</th>
              </tr>
            </thead>
            <tbody>
              {specialServices.map((service, index) => (
                <tr key={index} style={trStyle(index)}>
                  <td style={tdStyle}>{formatDate(service.date)}</td>
                  <td style={tdStyle}>{service.time}</td>
                  <td style={tdStyle}>{service.service}</td>
                  <td style={tdStyle}>{service.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>{t.time}</th>
                <th style={thStyle}>Event</th>
                <th style={thStyle}>{t.location}</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((event, index) => (
                <tr key={index} style={trStyle(index)}>
                  <td style={tdStyle}>{formatDate(event.date)}</td>
                  <td style={tdStyle}>{event.time}</td>
                  <td style={tdStyle}>{event.event}</td>
                  <td style={tdStyle}>{event.location}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button style={buttonStyle}>
            {t.viewAll}
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceSchedule;