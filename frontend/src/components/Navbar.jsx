import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState('/');
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    const updateCurrentPage = () => {
      setCurrentPage(window.location.pathname);
    };

    checkScreenSize();
    updateCurrentPage();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', updateCurrentPage);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', updateCurrentPage);
    };
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getNavLinks = () => {
    if (language === 'tamil') {
      return [
        { to: '/', label: 'முகப்பு' },
        { to: '/events', label: 'நிகழ்வுகள்' },
        { to: '/blog', label: 'வலைப்பதிவு' },
        { to: '/pastors', label: 'பாஸ்டர்கள்' },
        { to: '/service-schedule', label: 'சேவை அட்டவணை' },
        { to: '/prayer-request', label: 'பிரார்த்தனை கோரிக்கை' },
        { to: '/contact', label: 'தொடர்பு' },
        { to: '/Admin', label: 'நிர்வாகி' },
        { to: '/Donate', label: 'நன்கொடை' }
      ];
    } else {
      return [
        { to: '/', label: 'Home' },
        { to: '/events', label: 'Events' },
        { to: '/blog', label: 'Blog' },
        { to: '/pastors', label: 'Pastors' },
        { to: '/service-schedule', label: 'Service Schedule' },
        { to: '/prayer-request', label: 'Prayer Request' },
        { to: '/contact', label: 'Contact' },
        { to: '/admin', label: 'Admin' },
        { to: '/donate', label: 'Donation' }
      ];
    }
  };

  const isCurrentPage = (path) => {
    if (path === '/' && currentPage === '/') return true;
    if (path !== '/' && currentPage.startsWith(path)) return true;
    return false;
  };

  const headerStyles = {
    background: scrolled 
      ? 'linear-gradient(135deg, rgba(139, 69, 19, 0.95) 0%, rgba(160, 82, 45, 0.95) 50%, rgba(139, 69, 19, 0.95) 100%)'
      : 'linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #CD853F 50%, #A0522D 75%, #8B4513 100%)',
    padding: isMobile ? (scrolled ? '10px 0' : '15px 0') : (scrolled ? '12px 0' : '18px 0'),
    boxShadow: scrolled 
      ? '0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.1)'
      : '0 2px 10px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: '0',
    zIndex: '1000',
    width: '100%',
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
  };

  const containerStyles = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '0 16px' : '0 24px',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative'
  };

  const logoContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '10px' : '15px',
    textDecoration: 'none',
    zIndex: '1001',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    minWidth: 'fit-content'
  };

  const logoIconStyles = {
    width: isMobile ? (scrolled ? '40px' : '45px') : (scrolled ? '50px' : '55px'),
    height: isMobile ? (scrolled ? '40px' : '45px') : (scrolled ? '50px' : '55px'),
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    flexShrink: 0,
    transition: 'all 0.3s ease',
    border: '3px solid rgba(255,255,255,0.8)',
    position: 'relative'
  };

  const logoImageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  };

  const logoTextStyles = {
    fontSize: isMobile ? (scrolled ? '20px' : '22px') : (scrolled ? '26px' : '30px'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: '0',
    fontFamily: 'serif',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    letterSpacing: '1px',
    position: 'relative'
  };

  // Improved desktop navigation styles for better visibility
  const desktopNavStyles = {
    display: isMobile ? 'none' : 'flex',
    gap: '6px',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '50px',
    padding: '10px 15px',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(255,255,255,0.25)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
    maxWidth: 'fit-content',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const navLinkStyles = {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '12px 18px',
    borderRadius: '30px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
    overflow: 'hidden',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    border: '1px solid transparent'
  };

  const getNavLinkStyles = (path) => ({
    ...navLinkStyles,
    background: isCurrentPage(path) 
      ? 'linear-gradient(45deg, #4CAF50, #45a049)'
      : 'rgba(255,255,255,0.1)',
    boxShadow: isCurrentPage(path) 
      ? '0 6px 20px rgba(76, 175, 80, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
      : '0 2px 8px rgba(0,0,0,0.1)',
    border: isCurrentPage(path) 
      ? '1px solid rgba(76, 175, 80, 0.5)'
      : '1px solid rgba(255,255,255,0.2)',
    transform: isCurrentPage(path) ? 'translateY(-1px)' : 'translateY(0)'
  });

  const mobileMenuButtonStyles = {
    display: isMobile ? 'flex' : 'none',
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: '#FFFFFF',
    fontSize: '22px',
    cursor: 'pointer',
    zIndex: '1001',
    padding: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    width: '48px',
    height: '48px',
    minWidth: '48px'
  };

  const mobileMenuOverlayStyles = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.98) 0%, rgba(160, 82, 45, 0.98) 50%, rgba(139, 69, 19, 0.98) 100%)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    zIndex: '1000',
    padding: '20px',
    boxSizing: 'border-box',
    animation: 'slideIn 0.3s ease-out',
    overflowY: 'auto'
  };

  const mobileNavLinkStyles = {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '600',
    padding: '16px 28px',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    minWidth: '220px',
    border: '2px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  };

  const getMobileNavLinkStyles = (path) => ({
    ...mobileNavLinkStyles,
    background: isCurrentPage(path) 
      ? 'linear-gradient(45deg, #4CAF50, #45a049)'
      : 'rgba(255,255,255,0.15)',
    border: isCurrentPage(path) 
      ? '2px solid #4CAF50'
      : '2px solid rgba(255,255,255,0.3)',
    boxShadow: isCurrentPage(path) 
      ? '0 8px 25px rgba(76, 175, 80, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
      : '0 6px 20px rgba(0,0,0,0.2)'
  });

  const languageSwitcherStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '25px',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    marginLeft: isMobile ? '0' : '12px',
    position: 'relative',
    overflow: 'hidden',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    minWidth: 'fit-content'
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 'fit-content'
  };

  // Add keyframes for animations
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }
    
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* Responsive navbar adjustments */
    @media (max-width: 1200px) and (min-width: 769px) {
      .nav-link {
        font-size: 14px !important;
        padding: 10px 14px !important;
      }
    }

    @media (max-width: 1000px) and (min-width: 769px) {
      .nav-link {
        font-size: 13px !important;
        padding: 8px 12px !important;
      }
    }
  `;
  if (!document.querySelector('#header-styles')) {
    styleSheet.id = 'header-styles';
    document.head.appendChild(styleSheet);
  }

  return (
    <header style={headerStyles}>
      <div style={containerStyles}>
        <a 
          href="/" 
          style={logoContainerStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div 
            style={logoIconStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            }}
          >
            <img 
              src="/logo.jpg"
              alt="AJC Church Logo" 
              style={logoImageStyles}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/favicon.ico';
              }}
            />
          </div>
          <div>
            <h1 style={logoTextStyles}>AJC</h1>
            <div style={{
              fontSize: isMobile ? '11px' : '13px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '500',
              marginTop: '-5px',
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              {language === 'tamil' ? 'திருச்சபை' : 'Church'}
            </div>
          </div>
        </a>

        {/* Desktop Navigation Menu */}
        <nav style={desktopNavStyles}>
          {getNavLinks().map((link) => (
            <a
              key={link.to}
              href={link.to}
              onClick={handleNavClick}
              className="nav-link"
              style={getNavLinkStyles(link.to)}
              onMouseEnter={(e) => {
                if (!isCurrentPage(link.to)) {
                  e.target.style.background = 'linear-gradient(45deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))';
                  e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                }
                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                if (!isCurrentPage(link.to)) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                } else {
                  e.target.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.5)';
                  e.target.style.transform = 'translateY(-1px) scale(1)';
                  e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section with Language Switcher and Mobile Menu */}
        <div style={rightSectionStyles}>
          <button
            onClick={toggleLanguage}
            style={{
              ...languageSwitcherStyles,
              display: isMobile ? 'none' : 'flex'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(45deg, rgba(255,255,255,0.35), rgba(255,255,255,0.25))';
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}
          >
            <span style={{ fontSize: '16px' }}>🌐</span>
            {language === 'tamil' ? 'தமிழ்' : 'EN'}
          </button>

          {/* Mobile Language Switcher */}
          <button
            onClick={toggleLanguage}
            style={{
              ...languageSwitcherStyles,
              display: isMobile ? 'flex' : 'none',
              padding: '10px 14px',
              minWidth: 'auto'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '16px' }}>🌐</span>
            {language === 'tamil' ? 'தமிழ்' : 'EN'}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            style={mobileMenuButtonStyles}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.25)';
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.15)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{
              transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div style={mobileMenuOverlayStyles}>
            <div style={{
              position: 'absolute',
              top: '25px',
              right: '25px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              {language === 'tamil' ? 'மெனு' : 'Menu'}
            </div>
            {getNavLinks().map((link, index) => (
              <a
                key={link.to}
                href={link.to}
                onClick={handleNavClick}
                style={{
                  ...getMobileNavLinkStyles(link.to),
                  animationDelay: `${index * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentPage(link.to)) {
                    e.target.style.background = 'linear-gradient(45deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))';
                  }
                  e.target.style.borderColor = '#FFFFFF';
                  e.target.style.transform = 'scale(1.05) translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentPage(link.to)) {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                  } else {
                    e.target.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                    e.target.style.borderColor = '#4CAF50';
                  }
                  e.target.style.transform = 'scale(1) translateY(0)';
                  e.target.style.boxShadow = isCurrentPage(link.to) 
                    ? '0 8px 25px rgba(76, 175, 80, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                    : '0 6px 20px rgba(0,0,0,0.2)';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;