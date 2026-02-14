import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import axiosInstance from '../utils/axiosConfig';

const EventCountdown = () => {
  const { language } = useLanguage();
  const t = translations[language]?.eventCountdown;
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr) return new Date();
    const date = new Date(dateStr);
    
    if (!timeStr) return date;

    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let [, hours, minutes, ampm] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  };

  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/events', { requiresAuth: false });
        const events = response.data;
        
        if (events && events.length > 0) {
          const now = new Date();
          // Find the closest future event
          const futureEvents = events
            .map(e => ({ ...e, dateObj: combineDateTime(e.date, e.time) }))
            .filter(e => e.dateObj > now)
            .sort((a, b) => a.dateObj - b.dateObj);
          
          if (futureEvents.length > 0) {
            setNextEvent(futureEvents[0]);
          } else {
            // If no future events, maybe show the most recent past event but without a running timer
            const sortedEvents = events
              .map(e => ({ ...e, dateObj: combineDateTime(e.date, e.time) }))
              .sort((a, b) => b.dateObj - a.dateObj);
            setNextEvent(sortedEvents[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching next event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvent();
  }, []);

  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = combineDateTime(nextEvent.date, nextEvent.time).getTime();
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
  }, [nextEvent]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  const handleAllEventsClick = () => {
    window.location.href = '/events';
  };

  if (loading || !t) return null;

  if (!nextEvent) {
    return (
      <div style={{
        backgroundColor: '#2d5a4a',
        background: 'linear-gradient(135deg, #2d5a4a 0%, #1e3a2e 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
          {language === 'tamil' ? 'வரவிருக்கும் நிகழ்வுகள் எதுவும் இல்லை' : 'No Upcoming Events'}
        </h2>
        <button 
          onClick={handleAllEventsClick}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 30px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#2d5a4a';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'white';
          }}
        >
          {t.allEventsButton}
        </button>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: t.days },
    { value: timeLeft.hours, label: t.hours },
    { value: timeLeft.minutes, label: t.minutes },
    { value: timeLeft.seconds, label: t.seconds }
  ];

  const isStarted = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && nextEvent && (new Date().getTime() > combineDateTime(nextEvent.date, nextEvent.time).getTime());

  return (
    <div style={{
      backgroundColor: '#2d5a4a',
      background: 'linear-gradient(135deg, #2d5a4a 0%, #1e3a2e 100%)',
      color: 'white',
      padding: '60px 20px',
      textAlign: 'center',
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
        {isStarted ? 'LIVE NOW 🔴' : t.upcomingEvent}
      </p>

      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 30px 0',
        color: '#ffffff'
      }}>
        {isStarted ? `🎉 ${nextEvent.title} HAS STARTED! 🎉` : nextEvent.title}
      </h2>

      <div style={{
        fontSize: '16px',
        marginBottom: '40px',
        lineHeight: '1.6'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ opacity: '0.8' }}>{t.startTime}: </span>
          <strong>{nextEvent.time}</strong>
        </div>
        <div>
          <span style={{ opacity: '0.8' }}>{t.location}: </span>
          <strong>{nextEvent.location}</strong>
        </div>
      </div>

      {!isStarted ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {timeUnits.map((unit, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '80px'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '1',
                marginBottom: '10px'
              }}>
                {formatNumber(unit.value)}
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: '0.7'
              }}>
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '40px',
          color: '#ffd700',
          animation: 'pulse 2s infinite'
        }}>
          ✨ {language === 'tamil' ? 'நிகழ்வு தொடங்கிவிட்டது!' : 'Join us now for the event!'} ✨
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <button 
        onClick={handleAllEventsClick}
        style={{
          backgroundColor: 'transparent',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '12px 30px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = '#2d5a4a';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'white';
        }}
      >
        {t.allEventsButton}
      </button>
    </div>
  );
};

export default EventCountdown;
