import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const Testimonials = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const getTranslation = (key, fallback) => {
    try {
      const keys = key.split('.');
      let result = translations[language] || translations.english;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return fallback;
        }
      }
      return result || fallback;
    } catch (error) {
      return fallback;
    }
  };

  const testimonials = [
    {
      id: 1,
      name: getTranslation('testimonials.sarahName', 'Sarah Thomas'),
      role: getTranslation('testimonials.sarahRole', 'Church Member'),
      quote: getTranslation('testimonials.sarahQuote', 'This church has been a blessing to my family. The community is welcoming and the sermons are inspiring.'),
      image: 'https://randomuser.me/api/portraits/women/32.jpg'
    },
    {
      id: 2,
      name: getTranslation('testimonials.johnName', 'John Davis'),
      role: getTranslation('testimonials.johnRole', 'Youth Group Leader'),
      quote: getTranslation('testimonials.johnQuote', 'I\'ve seen so many young lives transformed through our youth ministry. God is truly working in this place.'),
      image: 'https://randomuser.me/api/portraits/men/41.jpg'
    },
    {
      id: 3,
      name: getTranslation('testimonials.maryName', 'Mary Johnson'),
      role: getTranslation('testimonials.maryRole', 'Choir Member'),
      quote: getTranslation('testimonials.maryQuote', 'The worship experience here is amazing. I feel God\'s presence every time we gather together.'),
      image: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
  ];
  
  const nextTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsAnimating(false);
      }, 500);
    }
  };
  
  const prevTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
        );
        setIsAnimating(false);
      }, 500);
    }
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  return (
    <div className="bg-amber-700 py-16 px-4 sm:px-6 lg:px-8 my-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {getTranslation('testimonials.title', 'Testimonials')}
        </h2>
        
        <div className="relative">
          <div className="flex justify-between absolute top-1/2 transform -translate-y-1/2 w-full px-4 z-10">
            <button 
              onClick={prevTestimonial}
              className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-amber-700" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-amber-700" />
            </button>
          </div>
          
          <div className="overflow-hidden">
            <div 
              className={`bg-white rounded-lg shadow-xl p-8 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="flex items-start mb-6">
                <Quote className="w-12 h-12 text-amber-500 mr-4 flex-shrink-0" />
                <p className="text-lg text-gray-700 italic">{testimonials[currentIndex].quote}</p>
              </div>
              
              <div className="flex items-center">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonials[currentIndex].name}</h3>
                  <p className="text-gray-600">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating && index !== currentIndex) {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setIsAnimating(false);
                    }, 500);
                  }
                }}
                className={`w-3 h-3 mx-1 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;