import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const Greeting = () => {
  const [greeting, setGreeting] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const greetings = [
    'Welcome to Mani Church!',
    'God Bless You!',
    'Peace Be With You!',
    'Have a Blessed Day!',
    'Join Us in Prayer!'
  ];
  
  useEffect(() => {
    // Set initial greeting
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    
    // Change greeting every 5 seconds
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Wait for fade out animation to complete
      setTimeout(() => {
        setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
        setIsAnimating(false);
      }, 500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-amber-50 p-8 rounded-lg shadow-md my-8 max-w-3xl mx-auto text-center transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-center mb-4">
        <Heart className="text-red-500 w-8 h-8" fill="#ef4444" />
      </div>
      <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <h2 className="text-2xl font-bold text-amber-800 mb-2">{greeting}</h2>
        <p className="text-amber-700">We're glad you're here with us today.</p>
      </div>
    </div>
  );
};

export default Greeting;