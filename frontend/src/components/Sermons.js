import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axiosInstance from '../utils/axiosConfig';
import { BASE_URL } from '../config/api';

const SermonCard = ({ title, category, time, pastor, videoUrl, audioUrl, thumbnail }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef(null);
  
  const getMediaUrl = (url) => {
    if (!url || url === 'null' || url === 'undefined' || url === '') return null;
    
    // If it's already a full URL, return it
    if (url.startsWith('http')) return url;
    
    // Clean up the path
    let cleanPath = url;
    if (cleanPath.startsWith('http')) return cleanPath; // redundant but safe
    
    // If it's a relative path to public assets (videos, audio, images)
    if (cleanPath.startsWith('/videos/') || cleanPath.startsWith('/audio/') || cleanPath.startsWith('/images/')) {
      return cleanPath;
    }
    
    // If it's a path from the API/uploads
    if (cleanPath.includes('/uploads/') || cleanPath.startsWith('/api/upload/')) {
      // If it already has the API prefix, just prepend BASE_URL
      if (cleanPath.startsWith('/api/upload/')) {
        return `${BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
      }
      // If it's just /uploads/..., prepend BASE_URL and the API prefix
      const uploadIndex = cleanPath.indexOf('/uploads/');
      const relativeUploadPath = cleanPath.substring(uploadIndex);
      return `${BASE_URL}/api/upload${relativeUploadPath}`;
    }
    
    // Default fallback: prepend BASE_URL if it doesn't look like a local path
    const path = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${BASE_URL}/api/upload/videos${path}`;
  };

  const finalVideoUrl = getMediaUrl(videoUrl);
  const finalAudioUrl = getMediaUrl(audioUrl);
  const finalThumbnailUrl = getMediaUrl(thumbnail);
  
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    
    try {
      setMediaError(null);
      
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        console.log('Media Debug - Attempting play:', {
          src: video.src,
          currentSrc: video.currentSrc,
          readyState: video.readyState,
          networkState: video.networkState,
          paused: video.paused,
          sources: video.querySelectorAll('source').length
        });

        // If the video is in an error state or not loaded, try to load it
        if (video.error || video.readyState === 0) {
          video.load();
        }

        // Wait for the video to be playable
        await new Promise((resolve, reject) => {
          let hasResolved = false;

          const onCanPlay = () => {
            if (hasResolved) return;
            hasResolved = true;
            cleanup();
            resolve();
          };
          
          const onError = (e) => {
            if (hasResolved) return;
            
            const target = e.target;
            const isVideoElement = target === video;
            const sourceTags = Array.from(video.querySelectorAll('source'));
            const isLastSource = target === sourceTags[sourceTags.length - 1];

            // Detailed logging for debugging
            console.error('Media Debug - Error Event:', {
              targetTagName: target.tagName,
              targetSrc: target.src || target.currentSrc,
              isVideoElement,
              isLastSource,
              error: video.error ? { code: video.error.code, message: video.error.message } : null
            });

            if (isVideoElement || isLastSource || sourceTags.length === 0) {
              hasResolved = true;
              cleanup();
              
              const error = video.error;
              let errorMsg = 'Failed to load video';
              if (error) {
                switch (error.code) {
                  case 1: errorMsg = 'Video loading aborted'; break;
                  case 2: errorMsg = 'Network error: Please check your connection or the server status.'; break;
                  case 3: errorMsg = 'Video decoding error: The file might be corrupted.'; break;
                  case 4: errorMsg = 'Video not found or format not supported by your browser.'; break;
                  default: errorMsg = error.message || 'Unknown video error';
                }
              } else if (sourceTags.length === 0 && !video.src) {
                errorMsg = 'No video source provided.';
              }
              reject(new Error(errorMsg));
            }
          };

          const cleanup = () => {
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('error', onError, true);
            sourceTags.forEach(source => source.removeEventListener('error', onError));
          };

          const sourceTags = Array.from(video.querySelectorAll('source'));
          video.addEventListener('canplay', onCanPlay);
          video.addEventListener('error', onError, true); 
          sourceTags.forEach(source => source.addEventListener('error', onError));
          
          setTimeout(() => {
            if (!hasResolved) {
              hasResolved = true;
              cleanup();
              if (video.readyState >= 3) resolve();
              else reject(new Error('Video loading timed out.'));
            }
          }, 15000);

          if (video.readyState >= 3) {
            onCanPlay();
          }
        });

        // Request fullscreen before playing
        const requestFs = async (el) => {
          try {
            if (el.requestFullscreen) return await el.requestFullscreen();
            if (el.webkitRequestFullscreen) return await el.webkitRequestFullscreen();
            if (el.msRequestFullscreen) return await el.msRequestFullscreen();
          } catch (err) {
            console.warn('Fullscreen request failed:', err);
          }
        };
        
        await requestFs(video);
        await video.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error in togglePlay:', err);
      setMediaError(err.message || 'Unable to play video');
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
    // Prevent event bubbling if it's from a source tag to avoid multiple error triggers
    if (e.target.tagName === 'SOURCE') {
      e.stopPropagation();
    }

    // The target could be the <source> element or the <video>/<audio> element
    const target = e.target;
    const isSourceTag = target && target.tagName === 'SOURCE';
    const mediaElement = isSourceTag ? target.parentElement : target;
    
    // Log the error for diagnostics
    const errorDetails = {
      type: e.type,
      targetTagName: target ? target.tagName : 'unknown',
      targetSrc: target ? (target.src || target.currentSrc) : 'none',
      mediaElementTagName: mediaElement ? mediaElement.tagName : 'none',
      timestamp: new Date().toISOString()
    };
    console.error('Media error event caught:', errorDetails);
    
    let errorMessage = 'Media playback error';
    let detailedMessage = 'The media file could not be loaded';
    
    if (!mediaElement) {
      console.error('Media element not found for error event');
      return;
    }

    // Check for sources
    const sources = Array.from(mediaElement.querySelectorAll('source'));
    const hasNoSources = sources.length === 0 && !mediaElement.src;
    
    if (hasNoSources) {
      detailedMessage = 'No media sources provided';
      console.error('Error: Media element has no sources and no src attribute', mediaElement);
    } else {
      // If the error came from a specific source tag, it might just be one format failing
      if (isSourceTag) {
        const sourceSrc = target.src || target.currentSrc || 'unknown source';
        console.warn(`Failed to load specific media source: ${sourceSrc}`);
        
        // If this is not the last source, the browser will try the next one automatically
        const sourceIndex = sources.indexOf(target);
        if (sourceIndex !== -1 && sourceIndex < sources.length - 1) {
          console.log(`Browser will attempt next source (index ${sourceIndex + 1} of ${sources.length})...`);
          return; // Don't show error UI yet, let the browser try the next source
        }
        
        detailedMessage = 'All provided media sources failed to load';
      }

      const error = mediaElement.error;
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            detailedMessage = 'Media loading was aborted';
            break;
          case error.MEDIA_ERR_NETWORK:
            detailedMessage = 'Network error while loading media. Check your connection.';
            break;
          case error.MEDIA_ERR_DECODE:
            detailedMessage = 'Media decoding error - the file might be corrupted or unsupported.';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            detailedMessage = 'Media format not supported or the file was not found on the server.';
            break;
          default:
            detailedMessage = `Media error: ${error.message || 'Unknown error'}`;
        }
        errorMessage = error.message || `Error code: ${error.code}`;
      } else if (isSourceTag) {
        // We already set a detailed message for source failure
      } else {
        detailedMessage = 'The media file could not be reached or is not in a valid format';
      }
    }
    
    console.error('Final media error summary:', { errorMessage, detailedMessage });
    setMediaError(`${detailedMessage}`);
    setIsPlaying(false);
  };
  
  const handleImageError = (e) => {
    console.log('Failed to load image:', e.target.src);
    // Set a more reliable fallback image from Unsplash
    e.target.src = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60';
  };

  const getShareUrl = () => {
    return finalVideoUrl;
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
                crossOrigin="anonymous"
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
                src={thumbnail || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'} 
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
