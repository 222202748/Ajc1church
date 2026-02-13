import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

// ✅ Define the target date once outside the component
const targetDate = (() => {
  const date = new Date();
  date.setDate(date.getDate() + 4); // 13 days from now
  date.setHours(18, 0, 0, 0); // 6:00 PM
  return date;
})();

const EventCountdown = () => {
  const { language } = useLanguage();
  const t = translations[language]?.eventCountdown;
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  const handleAllEventsClick = () => {
    window.location.href = '/events';
  };

  if (!t) return null; // Return null if translations are not loaded

  const timeUnits = [
    { value: timeLeft.days, label: t.days },
    { value: timeLeft.hours, label: t.hours },
    { value: timeLeft.minutes, label: t.minutes },
    { value: timeLeft.seconds, label: t.seconds }
  ];

  return (
    <div style={{
      backgroundColor: '#2d5a4a',
      background: 'linear-gradient(135deg, #2d5a4a 0%, #1e3a2e 100%)',
      color: 'white',
      padding: '60px 20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <p style={{
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '2px',
        margin: '0 0 10px 0',
        opacity: '0.9'
      }}>
        {t.upcomingEvent}
      </p>

      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 30px 0',
        color: '#ffffff'
      }}>
        {t.celebrationTitle}
      </h2>

      <div style={{
        fontSize: '16px',
        marginBottom: '40px',
        lineHeight: '1.6'
      }}>
        <p style={{ margin: '0 0 5px 0' }}>
          <strong>{t.startTime}:</strong> {t.time}
        </p>
        <p style={{ margin: '0' }}>
          <strong>{t.location}:</strong> {t.address}
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        {timeUnits.map((item, index) => (
          <div key={index} style={{
            textAlign: 'center',
            minWidth: '60px',
            animation: item.label === t.seconds ? 'pulse 1s ease-in-out' : 'none'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: '1',
              marginBottom: '8px',
              transition: 'all 0.3s ease'
            }}>
              {formatNumber(item.value)}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#cccccc',
              fontWeight: '500'
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleAllEventsClick}
        style={{
          backgroundColor: '#d4b896',
          color: '#2d5a4a',
          border: 'none',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#c4a886';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#d4b896';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        }}
      >
        {t.allEventsButton}
      </button>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};

export default EventCountdown;
