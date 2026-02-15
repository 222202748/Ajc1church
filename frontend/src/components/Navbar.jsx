import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Globe, 
  ChevronRight
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const currentPage = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getNavLinks = () => {
    const isTamil = language === 'tamil';
    return [
      { to: '/', label: isTamil ? 'முகப்பு' : 'Home' },
      { to: '/events', label: isTamil ? 'நிகழ்வுகள்' : 'Events' },
      { to: '/blog', label: isTamil ? 'வலைப்பதிவு' : 'Blog' },
      { to: '/pastors', label: isTamil ? 'பாஸ்டர்கள்' : 'Pastors' },
      { to: '/service-schedule', label: isTamil ? 'சேவை அட்டவணை' : 'Schedule' },
      { to: '/prayer-request', label: isTamil ? 'பிரார்த்தனை' : 'Prayer' },
      { to: '/contact', label: isTamil ? 'தொடர்பு' : 'Contact' },
      { to: '/admin', label: isTamil ? 'நிர்வாகி' : 'Admin' },
      { to: '/donate', label: isTamil ? 'நன்கொடை' : 'Donate', highlight: true }
    ];
  };

  const isCurrentPage = (path) => {
    if (path === '/' && currentPage === '/') return true;
    if (path !== '/' && currentPage.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
      scrolled 
        ? 'bg-[#8B4513] shadow-lg py-2' 
        : 'bg-[#8B4513] py-4'
    }`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <Link 
            to="/" 
            onClick={handleNavClick}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/favicon.ico'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl sm:text-2xl tracking-tight leading-none">AJC</span>
              <span className={`text-white/80 font-medium ${
                language === 'tamil' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              }`}>
                {language === 'tamil' ? 'திருச்சபை' : 'Church'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5 bg-white/5 p-1 rounded-2xl border border-white/10">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={`flex items-center px-3 py-2.5 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${
                  language === 'tamil' 
                    ? 'text-[13px] 2xl:text-sm' 
                    : 'text-[15px] 2xl:text-[17px]'
                } ${
                  isCurrentPage(link.to)
                    ? 'bg-white text-[#8B4513] shadow-sm'
                    : link.highlight 
                      ? 'bg-yellow-500 text-white hover:bg-yellow-400'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section: Language & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-base font-bold hover:bg-white/20 transition-all"
            >
              <Globe size={18} />
              {language === 'tamil' ? 'தமிழ்' : 'English'}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="xl:hidden p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[999] xl:hidden transition-all duration-500 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />
        
        {/* Menu Content */}
        <div className={`absolute top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-[#8B4513] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <span className="text-white font-bold text-lg">
              {language === 'tamil' ? 'மெனு' : 'Menu'}
            </span>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-white/10 text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 ${
                  isCurrentPage(link.to)
                    ? 'bg-white text-[#8B4513]'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center">
                  <span className={`font-bold ${language === 'tamil' ? 'text-base' : 'text-lg'}`}>
                    {link.label}
                  </span>
                </div>
                <ChevronRight size={18} className="opacity-40" />
              </Link>
            ))}
          </div>

          <div className="p-6 border-t border-white/10">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all"
            >
              <Globe size={20} />
              {language === 'tamil' ? 'தமிழ் மொழிக்கு மாற்றவும்' : 'Switch to Tamil'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
