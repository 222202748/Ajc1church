import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import axiosInstance from '../utils/axiosConfig';

const AllEvents = () => {
  const navigate = useNavigate();
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=450&fit=crop&auto=format";
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const t = useMemo(() => translations[language] || translations.en || {}, [language]);

  // Normalize various common URL types into a displayable image URL
  const normalizeImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return FALLBACK_IMAGE;
    const trimmed = url.trim();
    // Data URLs (base64)
    if (trimmed.startsWith('data:image/')) return trimmed;
    // YouTube links -> thumbnail
    const ytMatch =
      trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/) ||
      trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/);
    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    // Google Drive share links -> direct view
    // Format 1: https://drive.google.com/file/d/<id>/view?usp=sharing
    const gdFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (gdFileMatch && gdFileMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${gdFileMatch[1]}`;
    }
    // Format 2: https://drive.google.com/open?id=<id> or ...?id=<id>
    const gdIdParam = trimmed.match(/[?&]id=([^&]+)/);
    if (gdIdParam && gdIdParam[1]) {
      return `https://drive.google.com/uc?export=view&id=${gdIdParam[1]}`;
    }
    // Dropbox -> direct content
    if (trimmed.includes('dropbox.com')) {
      return trimmed
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('dl=0', 'dl=1');
    }
    // Google Photos and other non-direct links usually won't display due to CORS/mixed content;
    // we return the URL and rely on onError fallback below.
    return trimmed;
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/events', { requiresAuth: false });
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getCurrentDate = useCallback(() => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    };
    return today.toLocaleDateString(language === 'tamil' ? 'ta-IN' : 'en-US', options);
  }, [language]);

  // Add fallback values for missing translation keys
  const getTranslation = useCallback((key, fallback = key) => {
    return t[key] || fallback;
  }, [t]);

  const filteredEvents = useMemo(() => {
    // If no events from backend, return empty array or handle accordingly
    if (!events || events.length === 0) {
      return [];
    }

    const formattedEvents = events.map(event => {
      const eventDate = new Date(event.date);
      const day = eventDate.getDate().toString().padStart(2, '0');
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = monthNames[eventDate.getMonth()];
      const year = eventDate.getFullYear().toString();

      return {
        id: event._id,
        title: event.title,
        date: day,
        month: month,
        year: year,
        time: event.time,
        location: event.location,
        description: event.description,
        image: event.image || FALLBACK_IMAGE
      };
    });

    if (!searchTerm.trim()) {
      return formattedEvents;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    
    return formattedEvents.filter(event => {
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.month.toLowerCase().includes(searchLower) ||
        event.date.includes(searchLower) ||
        event.time.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, events]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const styles = {
    container: {
      backgroundColor: '#f8f8f8',
      minHeight: '80vh'
    },
    topBar: {
      backgroundColor: '#8B4513',
      color: 'white',
      padding: '8px 0',
      fontSize: '14px'
    },
    topBarContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    eventsSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px'
    },
    filterSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginBottom: '40px'
    },
    filterLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap'
    },
    dateText: {
      fontSize: '16px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      color: '#333'
    },
    iconButton: {
      backgroundColor: 'transparent',
      border: '1px solid #ddd',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.3s ease'
    },
    searchContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '350px'
    },
    searchInput: {
      padding: '12px 80px 12px 40px',
      border: '2px solid #ddd',
      borderRadius: '25px',
      fontSize: '16px',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#999',
      fontSize: '18px'
    },
    clearButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#999',
      cursor: 'pointer',
      fontSize: '18px',
      padding: '4px',
      borderRadius: '50%',
      transition: 'color 0.3s ease'
    },
    searchResults: {
      marginBottom: '20px',
      fontSize: '14px',
      color: '#666',
      fontStyle: 'italic'
    },
    eventsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginBottom: '60px'
    },
    eventCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    eventImageWrapper: {
      width: '100%',
      height: '200px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#e5e7eb'
    },
    eventImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    },
    dateTag: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      backgroundColor: '#2d5a4a',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    dateNumber: {
      fontSize: '20px',
      lineHeight: '1'
    },
    dateMonth: {
      fontSize: '12px',
      opacity: '0.9'
    },
    eventContent: {
      flex: '1',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    eventTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 10px 0'
    },
    eventTime: {
      color: '#666',
      margin: '0 0 5px 0',
      fontSize: '14px'
    },
    eventLocation: {
      color: '#666',
      margin: '0 0 10px 0',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    eventDescription: {
      color: '#777',
      fontSize: '13px',
      lineHeight: '1.4',
      margin: '0 0 20px 0'
    },
    registerButton: {
      backgroundColor: '#D4B896',
      color: '#5D4037',
      border: 'none',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: '6px',
      cursor: 'pointer',
      alignSelf: 'flex-start',
      transition: 'background-color 0.3s ease'
    },
    noResults: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666'
    },
    noResultsIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    noResultsText: {
      fontSize: '18px',
      marginBottom: '10px'
    },
    noResultsSubtext: {
      fontSize: '14px',
      color: '#999'
    }
  };

  const mediaStyles = `
    @media (min-width: 768px) {
      .filter-section {
        flex-direction: row !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      .events-grid {
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)) !important;
      }
      .event-card {
        flex-direction: row !important;
      }
      .event-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
      }
      .event-image {
        width: 200px !important;
        height: 180px !important;
        flex-shrink: 0 !important;
      }
      .event-title {
        font-size: 20px !important;
      }
    }

    @media (max-width: 767px) {
      .events-section {
        padding: 20px 15px !important;
      }
      .filter-left {
        justify-content: center !important;
      }
      .search-container {
        max-width: 100% !important;
      }
      .events-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
    }

    .icon-button:hover {
      background-color: #f0f0f0 !important;
      transform: translateY(-1px) !important;
    }

    .search-input:focus {
      border-color: #8B4513 !important;
    }

    .clear-button:hover {
      color: #8B4513 !important;
      background-color: #f0f0f0 !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mediaStyles }} />
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.topBarContent}></div>
        </div>

        <div style={styles.eventsSection} className="events-section">
          <div style={styles.filterSection} className="filter-section">
            <div style={styles.filterLeft} className="filter-left">
              <span style={styles.dateText}>{getCurrentDate()}</span>
              <button style={styles.iconButton} title={getTranslation('eventCalendar', 'Event Calendar')}>📅</button>
            </div>

            <div style={styles.searchContainer} className="search-container">
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder={getTranslation('search', 'Search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} style={styles.clearButton} className="clear-button" title={getTranslation('search', 'Clear search')}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {searchTerm && (
            <div style={styles.searchResults}>
              {filteredEvents.length === 0 
                ? `${getTranslation('noResults', 'No results found for')} "${searchTerm}"` 
                : `${getTranslation('search', 'Found')} ${filteredEvents.length} ${getTranslation('events', 'events')}`
              }
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: '20px', color: '#666' }}>Loading upcoming events...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#d9534f' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
              <div>{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                style={{ ...styles.registerButton, marginTop: '20px', backgroundColor: '#d9534f', color: 'white' }}
              >
                Retry
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={styles.noResults}>
              <div style={styles.noResultsIcon}>🔍</div>
              <div style={styles.noResultsText}>{getTranslation('noResults', 'No results found')}</div>
              <div style={styles.noResultsSubtext}>
                {getTranslation('search', 'Try a different search term')}
              </div>
              {searchTerm && (
                <button onClick={clearSearch} style={{ ...styles.registerButton, marginTop: '20px' }}>
                  {getTranslation('events', 'View all events')}
                </button>
              )}
            </div>
          ) : (
            <div style={styles.eventsGrid} className="events-grid">
              {filteredEvents.map((event) => (
                <div key={event.id} style={styles.eventCard} className="event-card">
                  <div style={styles.eventImageWrapper} className="event-image">
                    <img
                      src={normalizeImageUrl(event.image)}
                      alt={event.title}
                      style={styles.eventImage}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      referrerPolicy="no-referrer"
                    />
                    <div style={styles.dateTag}>
                      <div style={styles.dateNumber}>{event.date}</div>
                      <div style={styles.dateMonth}>{event.month}</div>
                    </div>
                  </div>

                  <div style={styles.eventContent} className="event-content">
                    <div>
                      <h3 style={styles.eventTitle}>{event.title}</h3>
                      <p style={styles.eventTime}>🕐 {event.time}</p>
                      <p style={styles.eventLocation}>📍 {event.location}</p>
                      <p style={styles.eventDescription}>{event.description}</p>
                    </div>

                    <button
                      onClick={() => navigate('/event-registration', { 
                        state: { 
                          eventTitle: event.title,
                          eventDate: `${event.date} ${event.month} ${event.year}`,
                          eventTime: event.time,
                          eventLocation: event.location,
                          eventDescription: event.description,
                          eventId: event.id
                        }
                      })}                    
                      style={styles.registerButton}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#C5A47F'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#D4B896'}
                    >
                      {getTranslation('registerNow', 'Register Now')} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllEvents;
