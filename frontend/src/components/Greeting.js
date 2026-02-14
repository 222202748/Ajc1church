import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const greetingsData = {
  english: [
    'Welcome to AJC Church!',
    'God Bless You!',
    'Peace Be With You!',
    'Have a Blessed Day!',
    'Join Us in Prayer!'
  ],
  tamil: [
    'AJC திருச்சபைக்கு உங்களை வரவேற்கிறோம்!',
    'கடவுள் உங்களை ஆசீர்வதிப்பாராக!',
    'சமாதானம் உங்களுடனே இருப்பதாக!',
    'ஆசீர்வதிக்கப்பட்ட நாளாக அமையட்டும்!',
    'ஜெபத்தில் எங்களுடன் இணையுங்கள்!'
  ]
};

const Greeting = () => {
  const { language } = useLanguage();
  const [greeting, setGreeting] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentGreetings = greetingsData[language] || greetingsData.english;
  
  useEffect(() => {
    // Set initial greeting
    setGreeting(currentGreetings[Math.floor(Math.random() * currentGreetings.length)]);
    
    // Change greeting every 5 seconds
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Wait for fade out animation to complete
      setTimeout(() => {
        setGreeting(currentGreetings[Math.floor(Math.random() * currentGreetings.length)]);
        setIsAnimating(false);
      }, 500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [language, currentGreetings]);
  
  return (
    <div className="bg-amber-50 p-8 rounded-lg shadow-md my-8 max-w-3xl mx-auto text-center transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-center mb-4">
        <Heart className="text-red-500 w-8 h-8" fill="#ef4444" />
      </div>
      <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <h2 className="text-2xl font-bold text-amber-800 mb-2">
          {greeting}
        </h2>
        <p className="text-amber-700">
          {language === 'tamil' 
            ? 'இன்று நீங்கள் எங்களுடன் இருப்பதில் நாங்கள் மகிழ்ச்சியடைகிறோம்.'
            : "We're glad you're here with us today."}
        </p>
      </div>
    </div>
  );
};

export default Greeting;