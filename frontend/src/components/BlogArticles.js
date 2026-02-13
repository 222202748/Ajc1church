import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, Share2, Heart, MessageCircle, Phone, Download, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

const TamilChurchArticle = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Use the actual API endpoint from config
  const API_ENDPOINTS = {
    blogArticles: 'http://localhost:5000/api/blog'
  };
  
  // Fetch the latest article on component mount
  useEffect(() => {
    const fetchLatestArticle = async () => {
      try {
        setLoading(true);
        
        // Make a real API call to get the latest published article
        const response = await fetch(`${API_ENDPOINTS.blogArticles}/latest`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.blog) {
          setArticle(data.blog);
        } else {
          throw new Error('No articles found');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestArticle();
  }, []);
  
  // Handle share functionality
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };
  
  // Share on social media
  const shareOnSocial = (platform) => {
    const url = window.location.href;
    const title = article ? article.title : 'Church Article';
    
    let shareUrl;
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };
  
  // Handle download functionality
  const handleDownload = () => {
    if (!article) return;
    
    const title = article.title || 'Church Article';
    const content = article.content || '';
    const author = article.author?.username || 'Church Author';
    const date = article.publishedAt || article.createdAt || new Date().toISOString();
    
    // Format the content for download
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const downloadContent = `${title}

By: ${author}
Date: ${formattedDate}

${content.replace(/<[^>]*>/g, '')}`;
    
    // Create a blob and download
    const blob = new Blob([downloadContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Close share options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareOptions && !event.target.closest('.share-dropdown')) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareOptions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-600">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">✝</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Church Articles</h1>
                <p className="text-gray-600">Spiritual Growth & Faith</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative share-dropdown">
                <button 
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Share article"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                {showShareOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button 
                        onClick={() => shareOnSocial('facebook')} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                        Facebook
                      </button>
                      <button 
                        onClick={() => shareOnSocial('twitter')} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                        Twitter
                      </button>
                      <button 
                        onClick={() => shareOnSocial('linkedin')} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
                        LinkedIn
                      </button>
                      <button 
                        onClick={() => shareOnSocial('email')} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Mail className="w-4 h-4 mr-3 text-gray-600" />
                        Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Download Article"
                aria-label="Download article"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Like article"
              >
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading article...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : article ? (
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="mb-4">
              <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                Faith & Hope
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{article.author?.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>March 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>8 min read</span>
              </div>
            </div>
          </div>

          {/* Bible Verse */}
          <div className="p-8 bg-blue-50 border-l-4 border-blue-600">
            <blockquote className="text-lg italic text-gray-700 font-medium leading-relaxed">
              "சிலுவையைப் பற்றிய உபதேசம் கெட்டுப்போகிறவர்களுக்குப் பைத்தியமாயிருக்கிறது, இரட்சிக்கப்படுகிற நமக்கோ அது தேவபெலனாயிருக்கிறது."
            </blockquote>
            <cite className="text-blue-600 font-semibold mt-2 block">- 1 கொரிந்தியர் 1:18</cite>
          </div>

          {/* Article Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                பிரபல தேவ ஊழியரான பில்லி கிரகாம் அவர்கள் கீழ்கண்ட சம்பவத்தை குறித்து தனது புத்தகத்தில் எழுதியுள்ளார்:
              </p>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">ரான் பாக்கரின் மாற்றம்</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ரான் பாக்கர் (Ron Baker) என்னும் மனிதரின் வாழ்க்கையில் எல்லாமே தலை கீழாக போய் கொண்டிருந்தது. அவர் தனது சிறுவயதில் பட்ட கெட்ட அனுபவங்களால், சரியாக பேச கூடாதவராக, மற்றும் படிக்காதவராக இருந்தார். அவர் சரியான குடிகாரனாக மாறினார். சூதாட்டத்தில் பங்கு பெறுபவராக, அதைவிட மோசமாக, செய்வினை பில்லி சூனியம் போன்ற கொடிய பழக்கங்களிலும் ஈடுபட்டிருந்தார்.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  அவர் ஒரு பஸ் டிரைவராக வேலைபார்த்தாலும், அவர் தினமும் மதுபான கடைக்கு போய், குடித்து விட்டு, வீட்டுக்கு வந்து மனைவியை உதைப்பது வழக்கம். அவர் பஸ் ஓட்டுநராக இருந்த காரணத்தால், பில்லி கிரகாமின் கூட்டங்களுக்கு மக்களை கொண்டு செல்பவராக நான்கு நாட்கள் பணியாற்றினார்.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ஒரு நாள் வேலை முடிய மிகவும் தாமதமானபடியால், அவரால் குடிக்க முடியாமல் போனது. மிகவும் கோபத்துடன் வந்த அவரிடம் அவரது நண்பர், பில்லிகிரகாமின் கூட்டங்களுக்கு அழைத்தார். ஆனால் அவருக்கு இருந்த கோபத்தில் அந்த நண்பரை கன்னாபின்னாவென்று திட்டினார்.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  மனைவி அவரிடம் சொன்னார்கள், 'நான் நான்கு நாளாக அந்த கூட்டங்களுக்கு போய் வருகிறேன். கர்த்தர் கிரியை செய்தார், நான் கர்த்தரிடம் என் வாழ்க்கையை அர்ப்பணித்தேன். நீங்களும் போய் வாருங்கள்' என அவர்களும் கூறினார்கள்.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-green-800 mb-4">தேவனின் கிருபையால் மாற்றம்</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  கூட்டத்தில் இருந்த ரான், மேடைக்கு வெகு தூரத்தில் உட்கார்ந்து கேட்டு கொண்டிருந்தார். அவரது இருதயத்தில் 'இந்த மனுஷன் சொல்கிறது எல்லாம் குப்பை' என்று நினைத்து கொண்டே கேட்டு கொண்டிருந்தார். அந்த இரவிலே தேவன் அவரை தொட்டார். அவர் தன் வாழ்வை கிறிஸ்துவுக்கு அர்பணித்தார்.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  அதன்பின் இரண்டு வருடங்கள் அவர் குடி பழக்கத்தை விட போராடினார். ஆனால் தேவன் அவரை கிருபையாக அந்த பழக்கம் மற்றும், பில்லி சூனிய கட்டுகளிலிருந்து அவரை விடுவித்தார்.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  ஒரு நல்ல கிறிஸ்தவ பேச்சு பயிற்சியாளர் மூலம் நன்கு பேசவும் பழகி, படிக்கவும் ஆரம்பித்தார். ஒரு வேதாகம கல்லூரியில் சேர்ந்து, வேதத்தை முறையாக கற்று, ஆஸ்திரேலியா முழுவதும் கர்த்தரின் நாமத்தை பறைசாற்றுகிற வல்லமையுள்ள ஊழியராக மாறினார்.
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">நம் தேவனால் கூடாத காரியம் ஒன்றுண்டோ?</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  அன்பார்ந்தவர்களே, இயேசுகிறிஸ்துவிடம் வரும்போது, நாம் இலவசமாக இரட்சிக்கப்படுவது மட்டுமன்றி, நம்முடைய ஆவி ஆத்துமா சரீரத்தில் முழுவதிலும் முழு சுகத்தையும் அடைகிறோம். அதற்கு மேற்கண்ட உண்மை சம்பவம் உறுதிபடுத்துகிறதல்லவா?
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-purple-800 mb-4">சிலுவையின் வல்லமை</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  சிலுவையைப் பற்றிய உபதேசம் கெட்டுப்போகிறவர்களுக்குப் பைத்தியமாயிருக்கிறது, இரட்சிக்கப்படுகிற நமக்கோ அது தேவபெலனாயிருக்கிறது. இந்நாட்களில் கிறிஸ்துவை குறித்து, உபதேசங்களை கேட்கும்போது, அநேகருக்கு அது பைத்தியமாக தோன்றுகிறது. இந்த கிறிஸ்தவர்களுக்கு வேறுவேலையில்லை என்று கூறுகிறவர்களும் உண்டு.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ஆனால் அந்த இரட்சிப்பை பெற்றுக்கொள்க்கை எத்தனைபேர்களோ, அத்தனைபேர்களும் உம்முடைய பிள்ளைகளாகும்படி, அவர்களுக்கு அதிகாரங் கொடுத்தீரே உமக்கு ஸ்தோத்திரம். எங்கள் ஜெபத்தை கேட்டு எங்களுக்கு பதில் கொடுப்பவரே உமக்கே நன்றி.
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-indigo-800 mb-4">இயேசு கிறிஸ்துவே நமது இரட்சிப்பு</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ஏன் அந்த உபதேசத்திற்கு அத்தனை ஆற்றல் என்றால், அது இயேசுகிறிஸ்துவாகிய உலக இரட்சகரை பற்றினது. அவரே நமது விசுவாசத்தின் துவக்கமும் முடிவுமாய் இருக்கிறார், அவரே ஆதியும் அந்தமுமாக, வழியும் சத்தியமும், ஜீவனுமாக இருக்கிறார்.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  அவரே நமது இரட்சிப்பின் தலைவராக, உலகத்தில் வந்த எந்த மனிதனையும் பிரகாசிப்பிக்கும் ஒளியாக, உலகத்தில் வந்த எந்த மனிதனையும் தமது விலையேறப்பெற்ற இரत்தத்தால் கழுவி சுத்திகரிப்பவராக, அவரே நமது சமாதான கர்த்தராக, தேவனுடைய ஒரே பேறான குமாரனாக, இருப்பவராகவே இருக்கிறவர்.
                </p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-orange-800 mb-4">ஜெபம்</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  எங்களை அதிகமாய் நேசித்து வழிநடத்தும் நல்ல தகப்பனே, சிலுவையை பற்றிய உபதேசம் இரட்சிக்கப்படுகிற எங்களுக்கு தேவ பெலனாய் இருக்கிறதற்காய் உமக்கு நன்றி செலுத்துகிறோம். உம்மை சிசுவாசிப்பதால் ஆக்கினை தீர்ப்பு இல்லாதபடி எங்கள் ஆத்துமாவை மரணத்தினின்று காக்கு ஸ்தோத்திரம் செலுத்துகிறோம்.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  விசுவாசமுள்ளவர்களாய் உம்மை ஏற்றுக் கொண்டவர்கள் எத்தனைபேர்களோ, அத்தனைபேர்களும் உம்முடைய பிள்ளைகளாகும்படி, அவர்களுக்கு அதிகாரங் கொடுத்தீரே உமக்கு ஸ்தோத்திரம். எங்கள் ஜெபத்தை கேட்டு எங்களுக்கு பதில் கொடுப்பவரே உமக்கே நன்றி.
                </p>
                <p className="text-gray-700 leading-relaxed font-semibold">
                  இயேசு கிறிஸ்துவின் நாமத்தில் ஜெபிக்கிறோம் எங்கள் ஜீவனுள்ள நல்ல பிதாவே ஆமென்.
                </p>
              </div>
            </div>
          </div>

          {/* Author Section */}
          <div className="bg-gray-50 p-8 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{article.author?.username}</h3>
                  <p className="text-gray-600">கிறிஸ்துவின் பணியில்</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Follow
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </article>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No article found.</p>
          </div>
        )}


      </main>
    </div>
  );
};

export default TamilChurchArticle;