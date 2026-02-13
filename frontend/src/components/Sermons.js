import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axiosInstance from '../utils/axiosConfig';
import { BASE_URL } from '../config/api';

const SermonCard = ({ title, category, time, pastor, videoUrl, audioUrl, thumbnail }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef(null);
  
  const fullVideoUrl = videoUrl ? (videoUrl.startsWith('http') ? videoUrl : `${BASE_URL}${videoUrl}`) : '';
  const fullThumbnailUrl = thumbnail ? (thumbnail.startsWith('http') ? thumbnail : `${BASE_URL}${thumbnail}`) : '';
  
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    
    try {
      // Clear any previous media errors when attempting to play
      setMediaError(null);
      
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        // Check if video has sources
        const sources = video.querySelectorAll('source');
        if (sources.length === 0) {
          throw new Error('No video sources available');
        }
        
        // Check if at least one source exists on the server
        let sourceExists = false;
        for (const source of sources) {
          try {
            const response = await fetch(source.src, { method: 'HEAD' });
            if (response.ok) {
              sourceExists = true;
              break;
            }
          } catch (e) {
            console.warn(`Failed to check source: ${source.src}`, e);
          }
        }
        
        if (!sourceExists) {
          throw new Error('Video files not found on server');
        }
        
        // Ensure video is loaded before playing
        if (video.readyState < 2) {
          await new Promise((resolve, reject) => {
            const onCanPlay = () => {
              video.removeEventListener('canplay', onCanPlay);
              video.removeEventListener('error', onError);
              resolve();
            };
            const onError = (e) => {
              video.removeEventListener('canplay', onCanPlay);
              video.removeEventListener('error', onError);
              
              // Get more specific error information if possible
              let errorMsg = 'Video failed to load';
              if (e && e.target && e.target.error) {
                const err = e.target.error;
                switch (err.code) {
                  case err.MEDIA_ERR_ABORTED:
                    errorMsg = 'Video loading aborted';
                    break;
                  case err.MEDIA_ERR_NETWORK:
                    errorMsg = 'Network error while loading video';
                    break;
                  case err.MEDIA_ERR_DECODE:
                    errorMsg = 'Video decoding error';
                    break;
                  case err.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMsg = 'Video format not supported';
                    break;
                  default:
                    errorMsg = err.message || 'Unknown video error';
                }
              }
              
              reject(new Error(errorMsg));
            };
            
            video.addEventListener('canplay', onCanPlay);
            video.addEventListener('error', onError);
            video.load();
          });
        }
        
        // Request fullscreen before playing
        const requestFs = async (el) => {
          if (el.requestFullscreen) return el.requestFullscreen();
          if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
          if (el.msRequestFullscreen) return el.msRequestFullscreen();
          // Fallback to parent element if available
          if (el.parentElement && el.parentElement.requestFullscreen) {
            return el.parentElement.requestFullscreen();
          }
          return Promise.resolve();
        };
        try {
          await requestFs(video);
        } catch (fsErr) {
          console.warn('Fullscreen request failed:', fsErr);
        }
        
        await video.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing video:', err);
      
      // Provide more specific error messages based on the error
      let errorMessage = 'Unable to play video';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Playback was prevented by your browser. Please try clicking the play button again.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'The video format is not supported by your browser.';
      } else if (err.name === 'AbortError') {
        errorMessage = 'The video playback was aborted.';
      } else if (err.name === 'NetworkError') {
        errorMessage = 'Network error: Unable to load video. Please check your connection.';
      } else if (err.message) {
        errorMessage = `Unable to play video: ${err.message}`;
      }
      
      setMediaError(errorMessage);
      setIsPlaying(false);
    }
  };
  
  const handleVideoEvents = {
    onLoadStart: () => {
      setMediaError(null);
    },
    onCanPlay: () => {
      setMediaError(null);
    },
    onPlay: () => {
      setIsPlaying(true);
    },
    onPause: () => {
      setIsPlaying(false);
    },
    onEnded: () => {
      setIsPlaying(false);
    },
    onError: (e) => {
      console.error('Video error event:', e);
      handleMediaError(e);
    }
  };
  
  const handleMediaError = (e) => {
    console.error('Media error:', e);
    
    let errorMessage = 'Media playback error';
    let detailedMessage = 'The media file could not be loaded';
    
    // Check if the media element has sources
    const hasNoSources = e.target && e.target.querySelectorAll('source').length === 0;
    const sourcesExist = e.target && e.target.querySelectorAll('source').length > 0;
    const allSourcesFailed = sourcesExist && Array.from(e.target.querySelectorAll('source')).every(source => {
      try {
        // Try to fetch the source to check if it exists
        const testFetch = new XMLHttpRequest();
        testFetch.open('HEAD', source.src, false);
        testFetch.send();
        return testFetch.status >= 400; // Return true if file doesn't exist
      } catch (err) {
        return true; // Assume failure if we can't check
      }
    });
    
    if (hasNoSources) {
      detailedMessage = 'No media sources provided';
    } else if (allSourcesFailed) {
      detailedMessage = 'Media file not found on server';
    } else if (e.target && e.target.error) {
      const error = e.target.error;
      
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          detailedMessage = 'Media loading was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          detailedMessage = 'Network error while loading media';
          break;
        case error.MEDIA_ERR_DECODE:
          detailedMessage = 'Media decoding error - file may be corrupted';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          detailedMessage = 'Media format not supported or file not found';
          break;
        default:
          detailedMessage = 'Unknown media error occurred';
      }
      
      errorMessage = error.message || `Error code: ${error.code}`;
    }
    
    console.error('Media error details:', errorMessage, detailedMessage);
    setMediaError(`${detailedMessage}. Please try again or contact support.`);
    setIsPlaying(false);
  };
  
  const handleImageError = (e) => {
    console.log('Failed to load image:', e.target.src);
    // Set a fallback image
    e.target.src = 'https://via.placeholder.com/600x400/8B4513/ffffff?text=No+Preview+Available';
  };

  const getVideoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    if (cleanUrl.includes('/uploads/')) return `${BASE_URL}${cleanUrl}`;
    return cleanUrl;
  };

  const getAudioUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    if (cleanUrl.includes('/uploads/')) return `${BASE_URL}${cleanUrl}`;
    return cleanUrl;
  };

  const getThumbnailUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    if (cleanUrl.includes('/uploads/')) return `${BASE_URL}${cleanUrl}`;
    return cleanUrl;
  };

  const finalVideoUrl = getVideoUrl(videoUrl);
  const finalAudioUrl = getAudioUrl(audioUrl);
  const finalThumbnailUrl = getThumbnailUrl(thumbnail);

  const getShareUrl = () => {
    if (!videoUrl) return null;
    if (videoUrl.startsWith('http')) return videoUrl;
    const path = videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`;
    return `${window.location.origin}${path}`;
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedSermons') || '[]');
    const key = `${title}|${videoUrl || ''}`;
    setIsSaved(saved.includes(key));
  }, [title, videoUrl]);

  const handleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem('savedSermons') || '[]');
    const key = `${title}|${videoUrl || ''}`;
    let next;
    if (saved.includes(key)) {
      next = saved.filter((k) => k !== key);
      setIsSaved(false);
    } else {
      next = [...saved, key];
      setIsSaved(true);
    }
    localStorage.setItem('savedSermons', JSON.stringify(next));
  };

  const handleDownload = () => {
    const url = getShareUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    const name = title ? title.replace(/\s+/g, '_') : 'sermon';
    a.download = `${name}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    const url = getShareUrl();
    if (!url) return;
    const text = title || 'Sermon video';
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
      }
    } catch (e) {}
  };

  return (
    <div className="col-sm-12 col-md-6 col-lg-4 d-flex">
      <div className="card bg-dark text-white w-100">
        <div className="position-relative" style={{ height: '200px' }}>
          {finalVideoUrl ? (
            <>
              <video 
                ref={videoRef}
                className="card-img img-fluid w-100 h-100" 
                style={{ objectFit: 'cover' }} 
                poster={finalThumbnailUrl || ''}
                {...handleVideoEvents}
                preload="metadata"
                playsInline
                controls={isPlaying}
              >
                <source src={finalVideoUrl} type="video/mp4" />
                {/* Try alternative formats if available */}
                <source src={finalVideoUrl.replace('.mp4', '.webm')} type="video/webm" />
                <source src={finalVideoUrl.replace('.mp4', '.ogg')} type="video/ogg" />
                Your browser does not support the video element.
              </video>
              
              {/* Play Button Overlay - hidden while playing */}
              {!isPlaying && !mediaError && (
                <div className="card-img-overlay d-flex justify-content-center align-items-center">
                  <button 
                    className="btn btn-light rounded-circle p-3" 
                    onClick={togglePlay}
                    style={{ 
                      opacity: 0.9,
                      transition: 'opacity 0.3s ease',
                      fontSize: '1.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                  >
                    <i className="bi bi-play-fill"></i>
                  </button>
                </div>
              )}
              {/* Play/Pause Button Overlay removed; overlay handled conditionally above */}
              
              {/* Error Display */}
              {mediaError && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-75">
                  <div className="text-center text-white p-3">
                    <i className="bi bi-exclamation-triangle fs-1 mb-3 text-warning"></i>
                    <p className="mb-2 fw-bold">Video Error</p>
                    <p className="small">{mediaError}</p>
                    <button 
                      className="btn btn-outline-light btn-sm mt-2"
                      onClick={() => {
                        setMediaError(null);
                        if (videoRef.current) {
                          videoRef.current.load();
                        }
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <img 
                src={thumbnail || 'https://via.placeholder.com/600x400/8B4513/ffffff?text=No+Preview+Available'} 
                className="card-img img-fluid w-100 h-100" 
                alt={title} 
                style={{ objectFit: 'cover' }}
                onError={handleImageError}
              />
              <div className="card-img-overlay d-flex justify-content-center align-items-center">
                <div className="btn btn-light rounded-circle p-3 disabled opacity-50">
                  <i className="bi bi-play-fill"></i>
                </div>
                <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-dark bg-opacity-50">
                  <small className="text-white">
                    <i className="bi bi-info-circle me-1"></i>
                    Video not available
                  </small>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="card-body bg-white text-dark">
          <small className={`badge ${category.color} mb-2`}>{category.name}</small>
          <h5 className="card-title">{title}</h5>
          <p className="mb-1"><i className="bi bi-calendar me-1"></i> {time}</p>
          <p className="mb-3"><i className="bi bi-person me-1"></i> {pastor}</p>
          
          {/* Audio Player Section */}
          {finalAudioUrl && (
            <div className="mb-3">
              <label className="form-label small">
                <i className="bi bi-music-note me-1"></i> Audio Sermon:
              </label>
              <audio 
                controls 
                className="w-100" 
                onError={handleMediaError}
                style={{ height: '40px' }}
                preload="metadata"
              >
                <source src={finalAudioUrl} type="audio/mpeg" />
                <source src={finalAudioUrl.replace('.mp3', '.ogg')} type="audio/ogg" />
                <source src={finalAudioUrl.replace('.mp3', '.wav')} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          
          <div className="d-flex gap-3">
            <button className="btn btn-link p-0 text-muted" title="Share" onClick={handleShare}>
              <i className="bi bi-share"></i>
            </button>
            <button className="btn btn-link p-0 text-muted" title="Download" onClick={handleDownload}>
              <i className="bi bi-download"></i>
            </button>
            <button className={`btn btn-link p-0 ${isSaved ? 'text-primary' : 'text-muted'}`} title="Bookmark" onClick={handleBookmark}>
              <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sermons = () => {
  const { language } = useLanguage();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch videos from the backend
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch videos from the backend using axios instance
        const response = await axiosInstance.get('/api/upload/videos/list', { requiresAuth: false });
        
        if (response.status === 200 && response.data) {
          const data = response.data;
          
          // Map videos to sermon format
          if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
            const mappedSermons = data.videos.map((video, index) => ({
              id: video.id || index,
              title: video.title || video.filename?.split('.')[0]?.replace(/_/g, ' ') || `Sermon ${index + 1}`,
              category: { name: video.category || "Sermon", color: 'bg-success' },
              time: video.date || (video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Recent'),
              pastor: video.pastor || "Pastor SILUVAI RAJA",
              videoUrl: video.url || video.videoUrl || null,
              audioUrl: video.audioUrl || null,
              thumbnail: video.thumbnail || null
            }));
            setSermons(mappedSermons);
          } else {
            console.log('No videos found in response, using default sermons');
            setSermons(getDefaultSermons());
          }
        } else {
          console.log('Invalid response, using default sermons');
          setSermons(getDefaultSermons());
        }
      } catch (err) {
        console.error('Error fetching sermons:', err);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load sermons';
        if (err.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error: Please check your internet connection';
        } else if (err.response?.status === 404) {
          errorMessage = 'Sermon service not available';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error: Please try again later';
        }
        
        setError(errorMessage);
        setSermons(getDefaultSermons());
      } finally {
        setLoading(false);
      }
    };
    
    fetchSermons();
  }, []);
  
  // Default sermons data if API fails
  const getDefaultSermons = () => [
    {
      id: 1,
      title: "Finding Strength in God's Promises",
      category: { name: "Faith", color: 'bg-success' },
      time: "Sunday, 10:00 AM",
      pastor: "Pastor SILUVAI RAJA",
      thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNodXJjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
      videoUrl: '/videos/sermon1.mp4', // Sample video URL
      audioUrl: '/audio/sermon1.mp3'  // Sample audio URL
    },
    {
      id: 2,
      title: "Insights of Faith: Finding Peace in Uncertain Times",
      category: { name: "Peace", color: 'bg-primary' },
      time: "Sunday, 6:00 PM",
      pastor: "Pastor SILUVAI RAJA",
      thumbnail: 'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNodXJjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
      videoUrl: '/videos/sermon2.mp4',
      audioUrl: '/audio/sermon2.mp3'
    },
    {
      id: 3,
      title: "Walking in Faith: Believing Beyond What You See",
      category: { name: "Belief", color: 'bg-info text-dark' },
      time: "Wednesday, 7:00 PM",
      pastor: "Pastor SILUVAI RAJA",
      thumbnail: 'https://images.unsplash.com/photo-1548625361-1adcab316530?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNodXJjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
      videoUrl: '/videos/sermon3.mp4',
      audioUrl: '/audio/sermon3.mp3'
    }
  ];

  return (
    <>
      <div className="py-5 bg-light">
        <div className="container text-center">
          <h1 className="display-4 mb-4" style={{ color: '#8B4513' }}>Our Sermons</h1>
          <p className="lead mb-5">Join us for inspiring messages that will strengthen your faith and bring you closer to God.</p>
        </div>
      </div>
      
      <section className="text-white py-5" style={{ background: 'linear-gradient(to right, #8B4513, #A0522D)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2>{language === 'tamil' ? 'இன்றைய பிரசங்கம்' : 'Today\'s Sermon'}</h2>
            <p>{language === 'tamil' ? 'கடவுளின் வார்த்தையை கேட்டு உங்கள் ஆன்மீக பயணத்தை மேம்படுத்துங்கள்' : 'Enhance your spiritual journey by listening to the Word of God'}</p>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading sermons...</p>
            </div>
          ) : error ? (
            <div className="alert alert-warning text-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : (
            <div className="row g-4">
              {sermons.map((sermon) => (
                <SermonCard key={sermon.id || sermon.title} {...sermon} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-5">
            <a 
              href="/event-registration"
              className="btn btn-primary btn-lg px-4 py-2 rounded-pill fw-bold text-uppercase"
              style={{
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
            >
              {language === 'tamil' ? 'இப்போது பதிவு செய்யவும்' : 'Register Now'}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Sermons;
