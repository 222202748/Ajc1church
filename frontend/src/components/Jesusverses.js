import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen } from 'lucide-react';

const JesusVersesPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());

  const verses = [
    {
      tamil: "கர்த்தர் என் மேய்ப்பர், எனக்கு ஒன்றும் குறைவிராது.",
      english: "The Lord is my shepherd; I shall not want.",
      reference: "சங்கீதம் 23:1 / Psalm 23:1"
    },
    {
      tamil: "நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.",
      english: "Come to me, all you who are weary and burdened, and I will give you rest.",
      reference: "மத்தேயு 11:28 / Matthew 11:28"
    },
    {
      tamil: "நான் வழியும் சத்தியும் ஜீவனுமாயிருக்கிறேன்.",
      english: "I am the way and the truth and the life.",
      reference: "யோவான் 14:6 / John 14:6"
    },
    {
      tamil: "தேவன் உலகத்தை இவ்வளவாய் அன்புகூர்ந்தார்.",
      english: "For God so loved the world that he gave his one and only Son.",
      reference: "யோவான் 3:16 / John 3:16"
    },
    {
      tamil: "என் கிருபை உனக்குப் போதும்.",
      english: "My grace is sufficient for you.",
      reference: "2 கொரிந்தியர் 12:9 / 2 Corinthians 12:9"
    },
    {
      tamil: "நான் உங்களை விட்டுவிட்டுப் போகமாட்டேன்.",
      english: "I will never leave you nor forsake you.",
      reference: "எபிரெயர் 13:5 / Hebrews 13:5"
    },
    {
      tamil: "எல்லாவற்றையும் செய்ய எனக்கு பெலன் உண்டு.",
      english: "I can do all things through Christ who strengthens me.",
      reference: "பிலிப்பியர் 4:13 / Philippians 4:13"
    },
    {
      tamil: "நீங்கள் என்னில் நிலைத்திருந்தால், நான் உங்களில் நிலைத்திருப்பேன்.",
      english: "Remain in me, as I also remain in you.",
      reference: "யோவான் 15:4 / John 15:4"
    },
    {
      tamil: "பயப்படாதே, நான் உன்னுடனே இருக்கிறேன்.",
      english: "Do not fear, for I am with you.",
      reference: "ஏசாயா 41:10 / Isaiah 41:10"
    },
    {
      tamil: "சமாதானத்தை உங்களுக்கு வைத்துச் செல்லுகிறேன்.",
      english: "Peace I leave with you; my peace I give you.",
      reference: "யோவான் 14:27 / John 14:27"
    },
    {
      tamil: "நம்பிக்கையுள்ளவர்களுக்கு எல்லாம் கூடும்.",
      english: "All things are possible for one who believes.",
      reference: "மாற்கு 9:23 / Mark 9:23"
    },
    {
      tamil: "என் சுகம் பூரணமாகும்படி இவைகளை உங்களுக்குச் சொல்லுகிறேன்.",
      english: "I have told you this so that my joy may be in you.",
      reference: "யோவான் 15:11 / John 15:11"
    },
    {
      tamil: "நீங்கள் உலகத்தின் ஒளியாயிருக்கிறீர்கள்.",
      english: "You are the light of the world.",
      reference: "மத்தேயு 5:14 / Matthew 5:14"
    },
    {
      tamil: "கர்த்தரைத் தேடுங்கள், கிடைக்கும்போதே.",
      english: "Seek the Lord while he may be found.",
      reference: "ஏசாயா 55:6 / Isaiah 55:6"
    },
    {
      tamil: "நான் உங்களுக்காக ஒரு இடத்தை ஆயத்தப்படுத்தப் போகிறேன்.",
      english: "I go to prepare a place for you.",
      reference: "யோவான் 14:2 / John 14:2"
    },
    {
      tamil: "கர்த்தரில் சந்தோஷப்படுங்கள்.",
      english: "Rejoice in the Lord always.",
      reference: "பிலிப்பியர் 4:4 / Philippians 4:4"
    },
    {
      tamil: "எல்லா காரியத்திலும் ஜெபத்தோடும் வேண்டுதலோடும் நன்றியுணர்வோடும் கேளுங்கள்.",
      english: "In everything, by prayer and petition, with thanksgiving, present your requests to God.",
      reference: "பிலிப்பியர் 4:6 / Philippians 4:6"
    },
    {
      tamil: "நான் உலகத்தை ஜெயித்திருக்கிறேன்.",
      english: "I have overcome the world.",
      reference: "யோவான் 16:33 / John 16:33"
    },
    {
      tamil: "அன்பு பயத்தை வெளியே தள்ளுகிறது.",
      english: "Perfect love drives out fear.",
      reference: "1 யோவான் 4:18 / 1 John 4:18"
    },
    {
      tamil: "உங்கள் இருதயம் கலங்காமலும் பயப்படாமலும் இருக்கட்டும்.",
      english: "Do not let your hearts be troubled and do not be afraid.",
      reference: "யோவான் 14:27 / John 14:27"
    },
    {
      tamil: "கர்த்தருக்காகக் காத்திருப்பவர்கள் புதுப் பெலன் பெறுவார்கள்.",
      english: "Those who hope in the Lord will renew their strength.",
      reference: "ஏசாயா 40:31 / Isaiah 40:31"
    },
    {
      tamil: "என் நுகம் எளிதும் என் சுமை இலேசுமாயிருக்கிறது.",
      english: "My yoke is easy and my burden is light.",
      reference: "மத்தேயு 11:30 / Matthew 11:30"
    },
    {
      tamil: "நான் உங்களை நேசித்தபடி நீங்களும் ஒருவரையொருவர் நேசியுங்கள்.",
      english: "Love one another as I have loved you.",
      reference: "யோவான் 13:34 / John 13:34"
    },
    {
      tamil: "விசுவாசத்தினால் நாம் நடக்கிறோமே தவிர, காணுகிறதினால் அல்ல.",
      english: "We live by faith, not by sight.",
      reference: "2 கொரிந்தியர் 5:7 / 2 Corinthians 5:7"
    },
    {
      tamil: "தேவனுடைய ராஜ்யத்தையும் அவருடைய நீதியையும் முதலாகத் தேடுங்கள்.",
      english: "Seek first his kingdom and his righteousness.",
      reference: "மத்தேயு 6:33 / Matthew 6:33"
    },
    {
      tamil: "கர்த்தர் உங்களுக்காக யுத்தம் செய்வார்.",
      english: "The Lord will fight for you.",
      reference: "யாத்திராகமம் 14:14 / Exodus 14:14"
    },
    {
      tamil: "எல்லாவற்றிலும் நன்றி செலுத்துங்கள்.",
      english: "Give thanks in all circumstances.",
      reference: "1 தெசலோனிக்கேயர் 5:18 / 1 Thessalonians 5:18"
    },
    {
      tamil: "நம்முடைய பாடு இலேசும் அல்பமும் நித்தியமான மகிமையைச் சம்பாதிக்கும்.",
      english: "Our light and momentary troubles are achieving for us an eternal glory.",
      reference: "2 கொரிந்தியர் 4:17 / 2 Corinthians 4:17"
    },
    {
      tamil: "கர்த்தரின் மகிழ்ச்சி உங்களுக்குப் பலமாயிருக்கும்.",
      english: "The joy of the Lord is your strength.",
      reference: "நெகேமியா 8:10 / Nehemiah 8:10"
    },
    {
      tamil: "நான் எப்போதும் உங்களுடன் இருக்கிறேன்.",
      english: "I am with you always, to the very end of the age.",
      reference: "மத்தேயு 28:20 / Matthew 28:20"
    }
  ];

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);
    setCurrentVerseIndex(today.getDate() % verses.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const openPopup = () => {
    setIsOpen(true);
    showTodayVerse();
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      showTodayVerse();
    }, 1000); // 1 second delay before showing popup

    return () => clearTimeout(timer);
  }, []);

  const showTodayVerse = () => {
    const today = new Date();
    setCurrentVerseIndex(today.getDate() % verses.length);
    setCurrentDate(today);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentVerse = verses[currentVerseIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
      {/* Main Button */}
      <button
        onClick={openPopup}
        className="group relative bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 animate-pulse" />
          <span className="text-lg md:text-xl">
            📖 இயேசு கிறிஸ்துவின் தினசரி வசனம்
          </span>
        </div>
        <div className="text-sm mt-1 opacity-90">
          Daily Jesus Verse
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Popup Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closePopup}
        >
          {/* Popup Window */}
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-3xl">
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  இயேசு கிறிஸ்துவின் வசனம்
                </h2>
                <p className="text-blue-100 text-sm md:text-base">
                  {formatDate(currentDate)}
                </p>
              </div>
            </div>

            {/* Verse Content */}
            <div className="p-6 md:p-8">
              {/* Tamil Verse */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-500 shadow-lg">
                <p className="text-lg md:text-xl leading-relaxed text-gray-800 font-medium">
                  {currentVerse.tamil}
                </p>
              </div>

              {/* English Verse */}
              <div className="mb-6 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border-l-4 border-rose-500 shadow-lg">
                <p className="text-base md:text-lg leading-relaxed text-gray-700 italic">
                  {currentVerse.english}
                </p>
              </div>

              {/* Reference */}
              <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl shadow-inner">
                <p className="font-bold text-purple-800 text-sm md:text-base">
                  {currentVerse.reference}
                </p>
              </div>

              {/* Today's Verse Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={showTodayVerse}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>இன்றைய வசனம்</span>
                </button>
              </div>

              {/* Verse Counter */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Verse {currentVerseIndex + 1} of {verses.length}
                </p>
                <div className="flex justify-center mt-2">
                  <div className="bg-gray-200 rounded-full h-2 w-32">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentVerseIndex + 1) / verses.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default JesusVersesPopup;