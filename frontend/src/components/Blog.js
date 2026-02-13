import React, { useState } from 'react';
import { MapPin, Clock, Facebook, Twitter, Instagram, ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations as mainTranslations } from '../translations';

// Blog-specific translations that extend the main translations
const blogTranslations = {
  english: {
    faithChallenges: 'Faith Challenges',
    buildingCommunity: 'Building Community',
    discipleship: 'Village Ministry',
    actsOfKindness: 'Acts of Kindness',
    kindnessInAction: 'Kindness in Action',
    impactingLives: 'Impacting Lives Through Faith',
    blogDate1: 'December 15, 2024',
    blogDate2: 'December 10, 2024',
    blogDate3: 'December 5, 2024',
    blogDate4: 'December 1, 2024',
    faithChallengesExcerpt: 'Exploring the challenges we face in our faith journey and how to overcome them with God\'s help...',
    buildingCommunityExcerpt: 'How to build strong community bonds in your church and create lasting relationships...',
    discipleshipExcerpt: 'Bringing hope and ministry to rural communities through dedicated outreach programs...',
    actsOfKindnessExcerpt: 'Small acts of kindness that make a big difference in people\'s lives...',
    kindnessInActionExcerpt: 'Real stories of compassion in our community and how we can all make a difference...',
    churchAddress: '123 Church Street, City, State',
    workingHours: 'Mon-Sun: 9:00 AM - 6:00 PM',
    related: 'Related',
    buyNow: 'Buy Now',
    backToBlog: 'Back to Blog',
    readMore: 'Read More',
    shareArticle: 'Share Article',
    relatedPosts: 'Related Posts'
  },
  tamil: {
    faithChallenges: 'நம்பிக்கை சவால்கள்',
    buildingCommunity: 'சமூகத்தை கட்டியெழுப்புதல்',
    discipleship: 'கிராம ஊழியம்',
    actsOfKindness: 'தயவு செயல்கள்',
    kindnessInAction: 'செயலில் தயவு',
    impactingLives: 'நம்பிக்கையால் வாழ்க்கையை பாதித்தல்',
    blogDate1: 'டிசம்பர் 15, 2024',
    blogDate2: 'டிசம்பர் 10, 2024',
    blogDate3: 'டிசம்பர் 5, 2024',
    blogDate4: 'டிசம்பர் 1, 2024',
    faithChallengesExcerpt: 'நம் நம்பிக்கை பயணத்தில் நாம் எதிர்கொள்ளும் சவால்களையும் கடவுளின் உதவியால் அவற்றை எவ்வாறு வெல்வது என்பதையும் ஆராய்கிறோம்...',
    buildingCommunityExcerpt: 'உங்கள் தேவாலயத்தில் வலுவான சமூக பிணைப்புகளை உருவாக்கி நீடித்த உறவுகளை உருவாக்குவது எப்படி...',
    discipleshipExcerpt: 'அர்ப்பணிப்புள்ள வெளிநாட்டு திட்டங்களின் மூலம் கிராமப்புற சமூகங்களுக்கு நம்பிக்கையும் ஊழியமும் கொண்டுவருதல்...',
    actsOfKindnessExcerpt: 'மக்களின் வாழ்க்கையில் பெரிய மாற்றத்தை ஏற்படுத்தும் சிறிய தயவு செயல்கள்...',
    kindnessInActionExcerpt: 'நம் சமூகத்தில் இரக்கத்தின் உண்மையான கதைகளும் நாம் அனைவரும் எவ்வாறு மாற்றத்தை ஏற்படுத்தலாம்...',
    churchAddress: '123 சர்ச் தெரு, நகரம், மாநிலம்',
    workingHours: 'திங்கள்-ஞாயிறு: காலை 9:00 - மாலை 6:00',
    related: 'தொடர்புடைய',
    buyNow: 'இப்போது வாங்கு',
    backToBlog: 'வலைப்பதிவுக்கு திரும்பு',
    readMore: 'மேலும் படிக்க',
    shareArticle: 'கட்டுரை பகிர்',
    relatedPosts: 'தொடர்புடைய பதிவுகள்'
  }
};



const BlogApp = () => {
  const [currentView, setCurrentView] = useState('blog');
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useLanguage();
  
  const getTranslation = (key, fallback = `[${key}]`) => {
    // First try blog-specific translations, then fall back to main translations
    const blogT = blogTranslations[language];
    const mainT = mainTranslations[language];
    
    if (blogT && blogT[key]) {
      return blogT[key];
    }
    
    if (mainT && mainT[key]) {
      return mainT[key];
    }
    
    return fallback;
  };

  const blogPosts = [
    {
      id: 1,
      title: getTranslation('faithChallenges'),
      date: getTranslation('blogDate1'),
      image: "https://www.hdwallpapers.in/download/faith_cross_christian_hd_christian-1920x1080.jpg",
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      excerpt: getTranslation('faithChallengesExcerpt'),
      route: 'faith-challenges',
      author: 'SiluvaiRaja',
      tags: ['Faith', 'Challenges', 'Growth'],
      mediaType: 'video'
    },
    {
      id: 2,
      title: getTranslation('buildingCommunity'),
      date: getTranslation('blogDate1'),
      image: "https://chalcedon-edu-web.s3-us-west-2.amazonaws.com/siteMedia/_1200x630_crop_center-center_82_none/christian_community.jpg?mtime=1657542124",
      video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      excerpt: getTranslation('buildingCommunityExcerpt'),
      route: 'building-community',
      author: 'Sarah Miller',
      tags: ['Community', 'Fellowship', 'Unity'],
      isRelated: true,
      mediaType: 'video'
    },
    {
      id: 3,
      title: getTranslation('discipleship'),
      date: getTranslation('blogDate2'),
      image: "https://via.placeholder.com/800x400?text=Village+Ministry",
      excerpt: getTranslation('discipleshipExcerpt'),
      route: 'village-ministry',
      author: 'David Thompson',
      tags: ['Ministry', 'Outreach', 'Rural'],
      mediaType: 'image'
    },
    {
      id: 4,
      title: getTranslation('actsOfKindness'),
      date: getTranslation('blogDate3'),
      image: "https://via.placeholder.com/800x400?text=Acts+of+Kindness",
      video: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
      excerpt: getTranslation('actsOfKindnessExcerpt'),
      route: 'acts-of-kindness',
      author: 'Mary Johnson',
      tags: ['Kindness', 'Service', 'Love'],
      mediaType: 'video'
    }
  ];

  const featuredPost = {
    title: getTranslation('impactingLives'),
    date: getTranslation('blogDate1'),
    day: "17",
    month: language === 'tamil' ? "டிசம்" : "DEC",
    image: "https://www.hdwallpapers.in/download/faith_cross_christian_hd_christian-1920x1080.jpg",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    mediaType: 'video'
  };

  // Media component to handle both images and videos
  const MediaDisplay = ({ post, className, showControls = true }) => {
    if (post.mediaType === 'video' && post.video) {
      return (
        <video 
          className={className}
          controls={showControls}
          poster={post.image}
          preload="metadata"
        >
          <source src={post.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <img 
        src={post.image}
        alt={post.title}
        className={className}
      />
    );
  };

  const TopHeader = () => (
    <div className="bg-amber-900 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{getTranslation('churchAddress')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{getTranslation('workingHours')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Facebook size={16} className="cursor-pointer hover:text-amber-200" />
          <Twitter size={16} className="cursor-pointer hover:text-amber-200" />
          <Instagram size={16} className="cursor-pointer hover:text-amber-200" />
        </div>
      </div>
    </div>
  );

  const BlogListing = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Post */}
        <div className="lg:col-span-2 rounded-lg overflow-hidden shadow-lg">
          <MediaDisplay 
            post={featuredPost}
            className="w-full h-96 object-cover"
          />
          <div className="p-6 bg-white">
            <div className="inline-block bg-amber-600 text-white px-4 py-2 rounded-lg text-center mb-4 w-20">
              <div className="text-2xl font-bold">{featuredPost.day}</div>
              <div className="text-sm">{featuredPost.month}</div>
            </div>
            <h2 className="text-gray-900 text-3xl font-bold mb-2">{featuredPost.title}</h2>
            <p className="text-gray-600">{featuredPost.date}</p>
          </div>
        </div>

        {/* Sidebar Posts */}
        <div className="space-y-6">
          {blogPosts.slice(0, 3).map((post) => (
            <div 
              key={post.id} 
              className="flex gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setCurrentView(post.route)}
            >
              <MediaDisplay 
                post={post}
                className="w-20 h-16 object-cover rounded"
                showControls={false}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-amber-600">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-xs mt-1">{post.date}</p>
                {post.isRelated && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                      {getTranslation('related')}
                    </span>
                    <button className="bg-gray-800 text-white text-xs px-3 py-1 rounded hover:bg-gray-700">
                      {getTranslation('buyNow')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Posts Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.slice(3).map((post) => (
          <div 
            key={post.id} 
            className="flex gap-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setCurrentView(post.route)}
          >
            <MediaDisplay 
              post={post}
              className="w-24 h-20 object-cover rounded"
              showControls={false}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg hover:text-amber-600">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm mt-1">{post.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <div className="flex items-center gap-2">
          <button 
            className={`w-10 h-10 rounded ${currentPage === 1 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button 
            className={`w-10 h-10 rounded ${currentPage === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button className="w-10 h-10 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">
            →
          </button>
        </div>
      </div>
    </div>
  );

  const ArticlePage = ({ post }) => {
    const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 3);
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button 
          onClick={() => setCurrentView('blog')}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-8"
        >
          <ArrowLeft size={16} />
          {getTranslation('backToBlog')}
        </button>

        {/* Article Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <MediaDisplay 
            post={post}
            className="w-full h-96 object-cover"
          />
          <div className="p-8">
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                {post.author}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex items-center gap-2 mb-6">
              <Tag size={16} className="text-gray-400" />
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {post.excerpt}
            </p>
            
            {/* Dynamic content based on article type */}
            {post.route === 'faith-challenges' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'tamil' ? 'நம்பிக்கை சவால்களை புரிந்து கொள்ளுதல்' : 'Understanding Faith Challenges'}
                </h2>
                <p className="text-gray-700 mb-6">
                  {language === 'tamil' 
                    ? 'நம்பிக்கை சவால்கள் ஒவ்வொரு விசுவாசியின் பயணத்தின் தவிர்க்க முடியாத பகுதியாகும். அவை நமது உறுதியை சோதித்து, நமது புரிதலை ஆழப்படுத்தி, இறுதியில் கடவுளுடனான நமது உறவை வலுப்படுத்துகின்றன.'
                    : 'Faith challenges are an inevitable part of every believer\'s journey. They test our resolve, deepen our understanding, and ultimately strengthen our relationship with God.'
                  }
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === 'tamil' ? 'பொதுவான நம்பிக்கை சவால்கள்' : 'Common Faith Challenges'}
                </h3>
                <p className="text-gray-700 mb-6">
                  {language === 'tamil'
                    ? 'பல விசுவாசிகள் ஒரே மாதிரியான போராட்டங்களை எதிர்கொள்கின்றனர்: கடினமான நேரங்களில் கடவுளின் இருப்பை கேள்வி கேட்பது, பிரார்த்தனைகள் பதில் இல்லாமல் இருக்கும்போது கைவிடப்பட்டதாக உணர்வது, அல்லது எதிர்க்கும் உலக கண்ணோட்டங்களால் சந்தேகத்துடன் போராடுவது.'
                    : 'Many believers face similar struggles: questioning God\'s existence during difficult times, feeling abandoned when prayers seem unanswered, or struggling with doubt when confronted by opposing worldviews.'
                  }
                </p>
              </>
            )}

            {post.route === 'building-community' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'tamil' ? 'வலுவான சமூகத்தின் அடித்தளம்' : 'The Foundation of Strong Community'}
                </h2>
                <p className="text-gray-700 mb-6">
                  {language === 'tamil'
                    ? 'வலுவான நம்பிக்கை சமூகத்தை கட்டியெழுப்புவதற்கு நோக்கமுள்ள முயற்சி, உண்மையான கவனிப்பு மற்றும் வாழ்க்கையின் ஏற்ற தாழ்வுகளின் மூலம் ஒருவருக்கொருவர் நடந்து செல்வதற்கான அர்ப்பணிப்பு தேவை.'
                    : 'Building a strong faith community requires intentional effort, genuine care, and a commitment to walking alongside one another through life\'s ups and downs.'
                  }
                </p>
              </>
            )}

            {post.route === 'village-ministry' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'tamil' ? 'கிராமப்புற சமூகங்களை அடைதல்' : 'Reaching Rural Communities'}
                </h2>
                <p className="text-gray-700 mb-6">
                  {language === 'tamil'
                    ? 'கிராம ஊழியம் தனித்துவமான வாய்ப்புகளையும் சவால்களையும் வழங்குகிறது. கிராமப்புற சமூகங்கள் பெரும்பாலும் வெவ்வேறு தேவைகள், கலாச்சார சூழல்கள் மற்றும் வாழ்க்கை முறைகளைக் கொண்டுள்ளன.'
                    : 'Village ministry presents unique opportunities and challenges. Rural communities often have different needs, cultural contexts, and ways of life that require thoughtful and respectful approaches to ministry.'
                  }
                </p>
              </>
            )}
          </div>
        </div>

        {/* Related Posts */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{getTranslation('relatedPosts')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <div 
                key={relatedPost.id}
                className="cursor-pointer group"
                onClick={() => setCurrentView(relatedPost.route)}
              >
                <MediaDisplay 
                  post={relatedPost}
                  className="w-full h-32 object-cover rounded-lg mb-3 group-hover:opacity-90 transition-opacity"
                  showControls={false}
                />
                <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                  {relatedPost.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{relatedPost.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getCurrentPost = () => {
    return blogPosts.find(post => post.route === currentView);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />
      
      {currentView === 'blog' ? (
        <BlogListing />
      ) : (
        <ArticlePage post={getCurrentPost()} />
      )}
    </div>
  );
};

export default BlogApp;