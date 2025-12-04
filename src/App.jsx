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

  // Setup Telegram
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
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

    // Menghitung index
    const newIndex = Math.round(scrollPosition / windowHeight);

    if (newIndex !== activeIndex && videos[newIndex]) {
      setActiveIndex(newIndex);
    }
  };

  const VideoSlide = ({ video, index, isActive }) => {
    const [liked, setLiked] = useState(false);

    // Embed URL (Mute default true agar autoplay jalan)
    const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&loop=1`;

    return (
      // HAPUS Flex, ganti jadi Relative Block biasa
      <div className="w-full h-full snap-start relative bg-black overflow-hidden block">
        
        {/* Container Video */}
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

        {/* Overlay Gradasi */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10"></div>

        {/* Tombol Tap Suara (Tengah) */}
        {isActive && isMuted && (
          <div className="absolute z-30 inset-0 flex items-center justify-center cursor-pointer" onClick={() => setIsMuted(false)}>
            <div className="bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full animate-pulse border border-white/10 flex items-center gap-2">
              <VolumeX size={16} className="text-white" />
              <p className="text-[10px] text-white font-bold">Tap untuk Suara</p>
            </div>
          </div>
        )}

        {/* --- TOMBOL SAMPING KANAN (SUPER KECIL & RAPI) --- */}
        <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 z-40">
          
          {/* Tombol Like */}
          <div className="flex flex-col items-center gap-0.5 group cursor-pointer" onClick={() => setLiked(!liked)}>
             <div className={`p-2 rounded-full transition-all ${liked ? 'bg-red-500/20' : 'bg-gray-800/50'}`}>
                {/* Ukuran ICON diperkecil jadi 20 */}
                <Heart size={20} className={liked ? "fill-red-500 text-red-500 scale-110" : "text-white"} />
             </div>
             <span className="text-[9px] font-medium text-white drop-shadow-md">Suka</span>
          </div>
          
          {/* Tombol Share */}
          <div className="flex flex-col items-center gap-0.5 cursor-pointer">
             <div className="bg-gray-800/50 backdrop-blur p-2 rounded-full active:scale-90 transition-transform">
                <Share2 size={20} className="text-white" />
             </div>
             <span className="text-[9px] font-medium text-white drop-shadow-md">Share</span>
          </div>

          {/* Tombol Mute Kecil */}
          <div className="flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => setIsMuted(!isMuted)}>
             <div className="bg-gray-800/50 backdrop-blur p-2 rounded-full active:scale-90 transition-transform">
                {isMuted ? <VolumeX size={20} className="text-white"/> : <Volume2 size={20} className="text-white"/>}
             </div>
          </div>
        </div>

        {/* --- INFO VIDEO KIRI BAWAH --- */}
        <div className="absolute left-3 bottom-16 right-14 z-40 text-left pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1.5">
             <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center font-bold text-[8px]">YT</div>
             <p className="font-bold text-xs text-white drop-shadow-lg truncate opacity-90">{video.channel}</p>
          </div>
          <p className="text-[11px] text-gray-100 line-clamp-2 leading-tight font-normal opacity-90">{video.title}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white font-sans w-full h-[100dvh] flex flex-col relative overflow-hidden">
      
      {/* Search Overlay */}
      {activeTab === 'search' && (
        <div className="absolute inset-0 bg-black/95 z-50 p-6 flex flex-col animate-in fade-in">
           <button onClick={() => setActiveTab('home')} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-sm"><ArrowLeft size={18} /> Kembali</button>
           <h2 className="text-xl font-bold mb-4 text-white">Cari Video</h2>
           <input autoFocus type="text" placeholder="Cari..." className="w-full bg-gray-800 p-3 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-600" 
             onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(e.target.value); setActiveTab('home'); fetchYouTubeShorts(e.target.value); }}} 
           />
           <div className="mt-6 flex flex-wrap gap-2">
             {['Lucu', 'Gaming', 'Horror', 'Masak'].map(tag => (
               <button key={tag} onClick={() => { setSearchQuery(tag); setActiveTab('home'); fetchYouTubeShorts(tag); }} className="bg-gray-800 px-3 py-1.5 rounded-full text-xs">#{tag}</button>
             ))}
           </div>
        </div>
      )}

      {/* Main Container - HAPUS FLEX, GANTI JADI BLOCK BIASA */}
      <div 
        className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative block"
        onScroll={handleScroll}
      >
        {loading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-black"><RefreshCw className="animate-spin text-red-600" size={32}/></div>}
        {error && <div className="absolute inset-0 flex items-center justify-center z-50 p-6 text-center text-red-500 bg-black text-xs"><AlertCircle size={20} className="mb-2"/><p>{error}</p></div>}
        
        {videos.map((video, index) => (
          // Bungkus dalam div agar tinggi pasti 100% layar
          <div key={video.id} className="w-full h-full">
            <VideoSlide 
              video={video} 
              index={index}
              isActive={index === activeIndex} 
            />
          </div>
        ))}
        
        {/* Spacer bawah kecil */}
        <div className="h-[50px] snap-start bg-black w-full"></div>
      </div>

      {/* --- BOTTOM NAV (LEBIH KECIL LAGI) --- */}
      <div className="absolute bottom-0 w-full h-[50px] bg-black/90 backdrop-blur border-t border-white/10 flex justify-around items-center z-50 pb-0.5">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-white' : 'text-gray-500'}`}>
          {/* Ikon Navigasi diperkecil jadi 18 */}
          <Home size={18} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[8px] font-bold mt-0.5">Home</span>
        </button>
        
        <button onClick={() => setActiveTab('search')} className="bg-gradient-to-tr from-red-600 to-pink-600 p-2 rounded-lg -mt-4 border-2 border-black shadow-lg active:scale-95 transition-transform">
          <Search size={18} className="text-white" />
        </button>

        <button className="flex flex-col items-center p-2 text-gray-500">
          <User size={18} />
          <span className="text-[8px] font-bold mt-0.5">Saya</span>
        </button>
      </div>

    </div>
  );
}
