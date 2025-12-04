import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, User, Heart, Share2, Volume2, VolumeX, ArrowLeft, RefreshCw, AlertCircle, Check } from 'lucide-react';

// --- MASUKKAN API KEY ANDA DI SINI ---
const YOUTUBE_API_KEY = 'AIzaSyCLEVeOYlPBpWyG3sGfwHksRu4WyVDmWfk'; 
// -------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isMuted, setIsMuted] = useState(true);

  // STATE UNTUK MINAT USER
  const [userInterests, setUserInterests] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Setup Telegram & Cek Minat Tersimpan
  useEffect(() => {
    // Cek apakah user sudah pernah pilih minat sebelumnya di HP ini
    const savedInterests = localStorage.getItem('user_interests');
    if (savedInterests) {
      const interests = JSON.parse(savedInterests);
      setUserInterests(interests);
      setShowOnboarding(false);
      // Gabungkan minat jadi query pencarian (misal: "Gaming Comedy Shorts")
      fetchYouTubeShorts(interests.join(' ') + ' shorts');
    }

    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.enableClosingConfirmation();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
  }, []);

  const fetchYouTubeShorts = async (query) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('MASUKKAN')) {
      setError("API Key belum diisi.");
      return;
    }
    setLoading(true);
    setVideos([]); 
    try {
      // Mengambil video random berdasarkan minat user
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${query}&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const formattedVideos = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high.url,
      }));
      
      setVideos(formattedVideos);
      setActiveIndex(0); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const newIndex = Math.round(container.scrollTop / container.clientHeight);
    if (newIndex !== activeIndex && videos[newIndex]) {
      setActiveIndex(newIndex);
    }
  };

  // --- HALAMAN PILIH MINAT (ONBOARDING) ---
  const OnboardingPage = () => {
    const categories = ['Lucu', 'Gaming', 'Musik', 'Olahraga', 'Edukasi', 'Masak', 'Horor', 'Anime', 'Teknologi', 'Kucing', 'Motivasi', 'Berita'];
    
    const toggleInterest = (cat) => {
      if (userInterests.includes(cat)) {
        setUserInterests(userInterests.filter(i => i !== cat));
      } else {
        setUserInterests([...userInterests, cat]);
      }
    };

    const saveInterests = () => {
      if (userInterests.length === 0) return; // Wajib pilih minimal 1
      localStorage.setItem('user_interests', JSON.stringify(userInterests));
      setShowOnboarding(false);
      fetchYouTubeShorts(userInterests.join(' ') + ' shorts');
    };

    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col p-6 items-center justify-center text-center animate-in fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">Apa yang kamu suka?</h1>
        <p className="text-gray-400 text-sm mb-8">Pilih topik agar video sesuai seleramu.</p>
        
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map(cat => {
            const isSelected = userInterests.includes(cat);
            return (
              <button 
                key={cat}
                onClick={() => toggleInterest(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  isSelected 
                    ? 'bg-red-600 border-red-600 text-white scale-105 shadow-[0_0_10px_rgba(220,38,38,0.5)]' 
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {cat} {isSelected && <Check size={12} className="inline ml-1"/>}
              </button>
            )
          })}
        </div>

        <button 
          onClick={saveInterests}
          disabled={userInterests.length === 0}
          className={`w-full max-w-xs py-4 rounded-xl font-bold text-white transition-all ${
            userInterests.length > 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          Mulai Menonton
        </button>
      </div>
    );
  };

  // --- KOMPONEN SLIDE VIDEO ---
  const VideoSlide = ({ video, index, isActive }) => {
    const [liked, setLiked] = useState(false);
    const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&loop=1`;

    return (
      <div className="w-full h-full snap-start relative bg-black overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-black z-0 flex items-center justify-center">
          {isActive ? (
            <iframe key={video.id + isMuted} src={embedUrl} title={video.title} className="w-full h-full object-cover scale-[1.35] origin-center" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ pointerEvents: 'none' }} ></iframe>
          ) : (
            <img src={video.thumbnail} className="w-full h-full object-cover opacity-40 blur-sm" alt="loading"/>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10"></div>
        
        {isActive && isMuted && (
          <div className="absolute z-30 inset-0 flex items-center justify-center cursor-pointer" onClick={() => setIsMuted(false)}>
            <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full animate-pulse border border-white/10 flex items-center gap-2">
              <VolumeX size={14} className="text-white" /><p className="text-[9px] text-white font-bold">Tap Suara</p>
            </div>
          </div>
        )}

        <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3 z-40">
          <div className="flex flex-col items-center gap-0.5" onClick={() => setLiked(!liked)}><div className={`p-2 rounded-full ${liked ? 'bg-red-500/20' : 'bg-gray-800/50'}`}><Heart size={18} className={liked ? "fill-red-500 text-red-500" : "text-white"} /></div><span className="text-[8px] text-white font-medium shadow-black drop-shadow-md">Suka</span></div>
          <div className="flex flex-col items-center gap-0.5"><div className="bg-gray-800/50 backdrop-blur p-2 rounded-full"><Share2 size={18} className="text-white" /></div><span className="text-[8px] text-white font-medium shadow-black drop-shadow-md">Share</span></div>
          <div className="flex flex-col items-center gap-0.5" onClick={() => setIsMuted(!isMuted)}><div className="bg-gray-800/50 backdrop-blur p-2 rounded-full">{isMuted ? <VolumeX size={18} className="text-white"/> : <Volume2 size={18} className="text-white"/>}</div></div>
        </div>

        <div className="absolute left-3 bottom-12 right-12 z-40 text-left pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1"><div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center font-bold text-[7px]">YT</div><p className="font-bold text-[10px] text-white drop-shadow-lg truncate opacity-90">{video.channel}</p></div>
          <p className="text-[10px] text-gray-200 line-clamp-2 leading-tight font-normal opacity-90">{video.title}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden">
      
      {/* ONBOARDING SCREEN */}
      {showOnboarding && <OnboardingPage />}

      {/* Search Overlay */}
      {activeTab === 'search' && (
        <div className="absolute inset-0 bg-black/95 z-[60] p-4 flex flex-col animate-in fade-in">
           <button onClick={() => setActiveTab('home')} className="mb-4 flex items-center gap-2 text-gray-400 font-bold text-xs"><ArrowLeft size={16} /> Kembali</button>
           <input autoFocus type="text" placeholder="Cari..." className="w-full bg-gray-800 p-3 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-600" onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(e.target.value); setActiveTab('home'); fetchYouTubeShorts(e.target.value); }}} />
        </div>
      )}

      {/* Video Scroll Area */}
      <div className="absolute top-0 left-0 right-0 bottom-[45px] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black" onScroll={handleScroll}>
        {loading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-black"><RefreshCw className="animate-spin text-red-600" size={32}/></div>}
        {error && <div className="absolute inset-0 flex items-center justify-center z-50 p-6 text-center text-red-500 bg-black text-xs"><AlertCircle size={20} className="mb-2"/><p>{error}</p></div>}
        {videos.map((video, index) => (<div key={video.id} className="w-full h-full"><VideoSlide video={video} index={index} isActive={index === activeIndex} /></div>))}
      </div>

      {/* Navbar */}
      <div className="absolute bottom-0 w-full h-[45px] bg-black border-t border-white/5 flex justify-around items-center z-50">
        <button onClick={() => { setActiveTab('home'); fetchYouTubeShorts(userInterests.join(' ')); }} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'home' ? 'text-white' : 'text-gray-600'}`}><Home size={18} /></button>
        <button onClick={() => setActiveTab('search')} className="bg-gradient-to-tr from-red-600 to-pink-600 p-2 rounded-lg -mt-3 border-2 border-black shadow-lg"><Search size={18} className="text-white" /></button>
        {/* Tombol Reset Minat */}
        <button onClick={() => { localStorage.removeItem('user_interests'); setShowOnboarding(true); }} className="flex flex-col items-center justify-center w-12 h-full text-gray-600"><User size={18} /></button>
      </div>
    </div>
  );
}
