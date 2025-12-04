import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, User, Heart, Share2, Volume2, VolumeX, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

// --- MASUKKAN API KEY ANDA DI SINI ---
const YOUTUBE_API_KEY = 'AIzaSyCLEVeOYlPBpWyG3sGfwHksRu4WyVDmWfk'; 
// -------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Index video yang sedang aktif
  const [activeIndex, setActiveIndex] = useState(0); 
  
  const [searchQuery, setSearchQuery] = useState('funny shorts'); 
  const [isMuted, setIsMuted] = useState(true);

  // Setup Telegram WebApp
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.enableClosingConfirmation(); // Mencegah app tertutup saat swipe tak sengaja
      window.Telegram.WebApp.setHeaderColor('#000000');
      window.Telegram.WebApp.setBackgroundColor('#000000');
    }
  }, []);

  const fetchYouTubeShorts = async (query) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('MASUKKAN')) {
      setError("API Key belum diisi di GitHub.");
      return;
    }
    setLoading(true);
    setVideos([]); 
    try {
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

  useEffect(() => { fetchYouTubeShorts(searchQuery); }, []);

  // --- LOGIKA SCROLL ---
  const handleScroll = (e) => {
    const container = e.target;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);
    if (newIndex !== activeIndex && videos[newIndex]) {
      setActiveIndex(newIndex);
    }
  };

  const VideoSlide = ({ video, index, isActive }) => {
    const [liked, setLiked] = useState(false);
    // URL Youtube
    const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&loop=1`;

    return (
      <div className="w-full h-full snap-start relative bg-black overflow-hidden">
        
        {/* Layer Video/Iframe */}
        <div className="absolute inset-0 w-full h-full bg-black z-0 flex items-center justify-center">
          {isActive ? (
            <iframe
              key={video.id + isMuted} 
              src={embedUrl}
              title={video.title}
              className="w-full h-full object-cover scale-[1.35] origin-center" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ pointerEvents: 'none' }} 
            ></iframe>
          ) : (
            <img 
              src={video.thumbnail} 
              className="w-full h-full object-cover opacity-40 blur-sm" 
              alt="loading"
            />
          )}
        </div>

        {/* Overlay Gradasi Hitam */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10"></div>

        {/* Tap untuk Suara (Tengah) */}
        {isActive && isMuted && (
          <div className="absolute z-30 inset-0 flex items-center justify-center cursor-pointer" onClick={() => setIsMuted(false)}>
            <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full animate-pulse border border-white/10 flex items-center gap-2">
              <VolumeX size={14} className="text-white" />
              <p className="text-[9px] text-white font-bold">Tap Suara</p>
            </div>
          </div>
        )}

        {/* --- TOMBOL SAMPING KANAN (SUPER TINY) --- */}
        <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3 z-40">
          <div className="flex flex-col items-center gap-0.5 group cursor-pointer" onClick={() => setLiked(!liked)}>
             <div className={`p-2 rounded-full transition-all ${liked ? 'bg-red-500/20' : 'bg-gray-800/50'}`}>
                <Heart size={18} className={liked ? "fill-red-500 text-red-500 scale-110" : "text-white"} />
             </div>
             <span className="text-[8px] font-medium text-white drop-shadow-md">Suka</span>
          </div>
          
          <div className="flex flex-col items-center gap-0.5 cursor-pointer">
             <div className="bg-gray-800/50 backdrop-blur p-2 rounded-full active:scale-90 transition-transform">
                <Share2 size={18} className="text-white" />
             </div>
             <span className="text-[8px] font-medium text-white drop-shadow-md">Share</span>
          </div>

          <div className="flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => setIsMuted(!isMuted)}>
             <div className="bg-gray-800/50 backdrop-blur p-2 rounded-full active:scale-90 transition-transform">
                {isMuted ? <VolumeX size={18} className="text-white"/> : <Volume2 size={18} className="text-white"/>}
             </div>
          </div>
        </div>

        {/* --- INFO VIDEO KIRI BAWAH --- */}
        <div className="absolute left-3 bottom-12 right-12 z-40 text-left pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
             <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center font-bold text-[7px]">YT</div>
             <p className="font-bold text-[10px] text-white drop-shadow-lg truncate opacity-90">{video.channel}</p>
          </div>
          <p className="text-[10px] text-gray-200 line-clamp-2 leading-tight font-normal opacity-90">{video.title}</p>
        </div>
      </div>
    );
  };

  return (
    // PENGATURAN LAYOUT UTAMA: FIXED INSET-0 (Mengunci Layar)
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden">
      
      {/* Search Overlay */}
      {activeTab === 'search' && (
        <div className="absolute inset-0 bg-black/95 z-[60] p-4 flex flex-col animate-in fade-in">
           <button onClick={() => setActiveTab('home')} className="mb-4 flex items-center gap-2 text-gray-400 font-bold text-xs"><ArrowLeft size={16} /> Kembali</button>
           <input autoFocus type="text" placeholder="Cari..." className="w-full bg-gray-800 p-3 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-600" 
             onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(e.target.value); setActiveTab('home'); fetchYouTubeShorts(e.target.value); }}} 
           />
           <div className="mt-4 flex flex-wrap gap-2">
             {['Lucu', 'Gaming', 'Horror'].map(tag => (
               <button key={tag} onClick={() => { setSearchQuery(tag); setActiveTab('home'); fetchYouTubeShorts(tag); }} className="bg-gray-800 px-3 py-1 rounded-full text-[10px]">#{tag}</button>
             ))}
           </div>
        </div>
      )}

      {/* --- AREA VIDEO SCROLL --- */}
      {/* Absolute Top-0 sampai Bottom-50px (Menyisakan ruang untuk nav bar) */}
      <div 
        className="absolute top-0 left-0 right-0 bottom-[45px] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
        onScroll={handleScroll}
      >
        {loading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-black"><RefreshCw className="animate-spin text-red-600" size={32}/></div>}
        {error && <div className="absolute inset-0 flex items-center justify-center z-50 p-6 text-center text-red-500 bg-black text-xs"><AlertCircle size={20} className="mb-2"/><p>{error}</p></div>}
        
        {videos.map((video, index) => (
          // Wrapper div Wajib 100% Height
          <div key={video.id} className="w-full h-full">
            <VideoSlide video={video} index={index} isActive={index === activeIndex} />
          </div>
        ))}
      </div>

      {/* --- BOTTOM NAV BAR (Fixed di Bawah) --- */}
      <div className="absolute bottom-0 w-full h-[45px] bg-black border-t border-white/5 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'home' ? 'text-white' : 'text-gray-600'}`}>
          <Home size={18} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        </button>
        
        <button onClick={() => setActiveTab('search')} className="bg-gradient-to-tr from-red-600 to-pink-600 p-2 rounded-lg -mt-3 border-2 border-black shadow-lg">
          <Search size={18} className="text-white" />
        </button>

        <button className="flex flex-col items-center justify-center w-12 h-full text-gray-600">
          <User size={18} />
        </button>
      </div>

    </div>
  );
}
