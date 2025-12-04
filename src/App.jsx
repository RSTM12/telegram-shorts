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
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('funny shorts'); 
  
  // State global untuk suara (Default harus true/mute agar autoplay jalan)
  const [isMuted, setIsMuted] = useState(true);

  const containerRef = useRef(null);
  const videoRefs = useRef({});

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
    try {
      // Mengambil max 20 video agar scroll lebih puas
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${query}&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
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
      if (formattedVideos.length > 0) setActiveVideoId(formattedVideos[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchYouTubeShorts(searchQuery); }, []);

  // Logika Scroll Otomatis (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveVideoId(entry.target.getAttribute('data-id'));
          }
        });
      },
      { threshold: 0.7 } // Harus 70% terlihat baru play
    );

    Object.values(videoRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [videos]);

  const VideoSlide = ({ video, isActive }) => {
    const [liked, setLiked] = useState(false);

    // URL Iframe yang Dioptimalkan
    // mute=1 adalah KUNCI agar autoplay jalan di HP
    const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&loop=1`;

    return (
      <div 
        ref={el => videoRefs.current[video.id] = el}
        data-id={video.id}
        className="w-full h-[100dvh] snap-start shrink-0 relative bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Layer Video */}
        <div className="absolute inset-0 w-full h-full bg-black z-0">
          {isActive ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full object-cover scale-[1.35]" // Zoom agar full screen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ pointerEvents: 'none' }} // Agar user tidak bisa klik pause/stop video youtube (native feel)
            ></iframe>
          ) : (
            <img 
              src={video.thumbnail} 
              className="w-full h-full object-cover opacity-50 blur-sm transition-all duration-500" 
              alt="loading"
            />
          )}
        </div>

        {/* Overlay Hitam Gradasi */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none z-10"></div>

        {/* Tombol Unmute Besar (Jika Mute Aktif) */}
        {isActive && isMuted && (
          <div 
            className="absolute z-30 inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMuted(false)} // Matikan mute saat layar diklik
          >
            <div className="bg-black/50 backdrop-blur-md p-4 rounded-full animate-pulse border border-white/20">
              <VolumeX size={32} className="text-white" />
              <p className="text-[10px] text-white font-bold mt-1 text-center">Tap Suara</p>
            </div>
          </div>
        )}

        {/* Action Buttons (Kanan) */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-40">
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setLiked(!liked)}>
             <div className={`p-3 rounded-full transition-all duration-200 ${liked ? 'bg-red-500/20' : 'bg-gray-800/60'}`}>
                <Heart size={28} className={`transition-colors ${liked ? "fill-red-500 text-red-500 scale-110" : "text-white"}`} />
             </div>
             <span className="text-xs font-bold text-white drop-shadow-md">Suka</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 cursor-pointer">
             <div className="bg-gray-800/60 backdrop-blur p-3 rounded-full active:scale-90 transition-transform">
                <Share2 size={28} className="text-white" />
             </div>
             <span className="text-xs font-bold text-white drop-shadow-md">Share</span>
          </div>

          {/* Tombol Mute Kecil */}
          <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setIsMuted(!isMuted)}>
             <div className="bg-gray-800/60 backdrop-blur p-3 rounded-full active:scale-90 transition-transform">
                {isMuted ? <VolumeX size={28} className="text-white"/> : <Volume2 size={28} className="text-white"/>}
             </div>
          </div>
        </div>

        {/* Info Video (Kiri Bawah) */}
        <div className="absolute left-4 bottom-24 right-20 z-40 text-left pointer-events-none">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg border border-white/20">
               <span className="text-[10px] font-bold text-white">YT</span>
             </div>
             <p className="font-bold text-md text-white drop-shadow-lg truncate">{video.channel}</p>
          </div>
          <p className="text-sm text-gray-100 line-clamp-2 leading-relaxed drop-shadow-md font-medium">
            {video.title}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white font-sans mx-auto h-[100dvh] w-full flex flex-col overflow-hidden relative">
      
      {/* Search Overlay */}
      {activeTab === 'search' && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
           <button onClick={() => setActiveTab('home')} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
             <ArrowLeft /> <span className="font-bold">Kembali ke Feed</span>
           </button>
           <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">Cari Video</h2>
           <input 
             autoFocus
             type="text" 
             placeholder="Cari sesuatu..." 
             className="w-full bg-gray-800/50 border border-gray-700 p-5 rounded-2xl text-white text-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-500" 
             onKeyDown={(e) => { 
               if (e.key === 'Enter') { 
                 setSearchQuery(e.target.value); 
                 setActiveTab('home'); 
                 fetchYouTubeShorts(e.target.value); 
               }
             }} 
           />
           <div className="mt-8 flex flex-wrap gap-3">
             {['Lucu', 'Mobile Legends', 'Jurnal Risa', 'Windah Basudara', 'Masak', 'Anime'].map(tag => (
               <button key={tag} onClick={() => { setSearchQuery(tag); setActiveTab('home'); fetchYouTubeShorts(tag); }} 
                 className="bg-gray-800 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 active:scale-95 transition-all">
                 #{tag}
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Main Swipe Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative"
      >
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50 p-6">
            <div className="bg-red-900/20 border border-red-800 p-6 rounded-2xl text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4"/>
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-40 gap-4">
             <RefreshCw className="animate-spin text-red-600" size={48}/>
             <p className="text-gray-400 text-sm animate-pulse">Memuat Video...</p>
           </div>
        )}

        {videos.map((video) => (
          <VideoSlide 
            key={video.id} 
            video={video} 
            isActive={activeVideoId === video.id} 
          />
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-black/80 backdrop-blur-xl border-t border-white/5 flex justify-around items-center z-50 px-2 pb-2">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
          <Home size={24} strokeWidth={activeTab === 'home' ? 3 : 2} />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        
        <button onClick={() => setActiveTab('search')} className="bg-gradient-to-tr from-red-600 to-pink-600 p-4 rounded-full -mt-8 shadow-[0_8px_16px_rgba(220,38,38,0.4)] border-4 border-black active:scale-95 transition-transform hover:shadow-[0_12px_20px_rgba(220,38,38,0.6)]">
           <Search size={26} className="text-white" strokeWidth={3} />
        </button>

        <button className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-gray-500 hover:text-gray-300 transition-colors">
          <User size={24} />
          <span className="text-[10px] font-bold">Saya</span>
        </button>
      </div>

    </div>
  );
}
