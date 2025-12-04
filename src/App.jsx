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
  
  // Kita simpan INDEX video yang aktif, bukan ID-nya, biar hitungan matematikanya gampang
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
    setVideos([]); // Reset video saat search baru
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
      setActiveIndex(0); // Reset ke video pertama
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchYouTubeShorts(searchQuery); }, []);

  // --- LOGIKA BARU: MATEMATIKA SCROLL ---
  // Fungsi ini dipanggil setiap kali layar digeser
  const handleScroll = (e) => {
    const container = e.target;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;

    // Rumus: Posisi Scroll dibagi Tinggi Layar = Index Video
    // Contoh: Scroll 1600px / Tinggi 800px = Video ke-2 (Index 2)
    const newIndex = Math.round(scrollPosition / windowHeight);

    if (newIndex !== activeIndex && videos[newIndex]) {
      setActiveIndex(newIndex);
    }
  };

  const VideoSlide = ({ video, index, isActive }) => {
    const [liked, setLiked] = useState(false);

    // Kita paksa render ulang iframe setiap kali aktif agar fresh
    const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&loop=1`;

    return (
      <div className="w-full h-[100dvh] snap-start shrink-0 relative bg-black flex items-center justify-center overflow-hidden">
        {/* Container Video */}
        <div className="absolute inset-0 w-full h-full bg-black z-0">
          {isActive ? (
             // Iframe hanya muncul jika ini adalah video yang aktif
            <iframe
              key={video.id + isMuted} // Key unik memaksa React update jika mute berubah
              src={embedUrl}
              title={video.title}
              className="w-full h-full object-cover scale-[1.35]" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ pointerEvents: 'none' }} 
            ></iframe>
          ) : (
            // Jika tidak aktif, tampilkan gambar saja
            <img 
              src={video.thumbnail} 
              className="w-full h-full object-cover opacity-40 blur-sm" 
              alt="loading"
            />
          )}
        </div>

        {/* Overlay Gradasi */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none z-10"></div>

        {/* Tombol Unmute */}
        {isActive && isMuted && (
          <div className="absolute z-30 inset-0 flex items-center justify-center cursor-pointer" onClick={() => setIsMuted(false)}>
            <div className="bg-black/50 backdrop-blur-md p-4 rounded-full animate-pulse border border-white/20">
              <VolumeX size={32} className="text-white" />
              <p className="text-[10px] text-white font-bold mt-1 text-center">Tap Suara</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-40">
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setLiked(!liked)}>
             <div className={`p-3 rounded-full transition-all ${liked ? 'bg-red-500/20' : 'bg-gray-800/60'}`}>
                <Heart size={28} className={liked ? "fill-red-500 text-red-500 scale-110" : "text-white"} />
             </div>
             <span className="text-xs font-bold text-white drop-shadow-md">Suka</span>
          </div>
          <div className="bg-gray-800/60 backdrop-blur p-3 rounded-full cursor-pointer active:scale-90 transition-transform">
             <Share2 size={28} className="text-white" />
          </div>
          <div className="bg-gray-800/60 backdrop-blur p-3 rounded-full cursor-pointer active:scale-90 transition-transform" onClick={() => setIsMuted(!isMuted)}>
             {isMuted ? <VolumeX size={28} className="text-white"/> : <Volume2 size={28} className="text-white"/>}
          </div>
        </div>

        {/* Info Video */}
        <div className="absolute left-4 bottom-24 right-20 z-40 text-left pointer-events-none">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-[10px]">YT</div>
             <p className="font-bold text-md text-white drop-shadow-lg truncate">{video.channel}</p>
          </div>
          <p className="text-sm text-gray-100 line-clamp-2 leading-relaxed font-medium">{video.title}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white font-sans w-full h-[100dvh] flex flex-col relative overflow-hidden">
      
      {/* Search Overlay */}
      {activeTab === 'search' && (
        <div className="absolute inset-0 bg-black/95 z-50 p-6 flex flex-col animate-in fade-in">
           <button onClick={() => setActiveTab('home')} className="mb-6 flex items-center gap-2 text-gray-400 font-bold"><ArrowLeft /> Kembali</button>
           <h2 className="text-2xl font-bold mb-4 text-white">Cari Video</h2>
           <input autoFocus type="text" placeholder="Cari..." className="w-full bg-gray-800 p-4 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-red-600" 
             onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(e.target.value); setActiveTab('home'); fetchYouTubeShorts(e.target.value); }}} 
           />
           <div className="mt-6 flex flex-wrap gap-2">
             {['Lucu', 'Gaming', 'Horror', 'Masak'].map(tag => (
               <button key={tag} onClick={() => { setSearchQuery(tag); setActiveTab('home'); fetchYouTubeShorts(tag); }} className="bg-gray-800 px-4 py-2 rounded-full text-sm">#{tag}</button>
             ))}
           </div>
        </div>
      )}

      {/* Main Container dengan Event Scroll */}
      <div 
        className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative"
        onScroll={handleScroll} // <--- INI KUNCI PERBAIKANNYA
      >
        {loading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-black"><RefreshCw className="animate-spin text-red-600" size={40}/></div>}
        {error && <div className="absolute inset-0 flex items-center justify-center z-50 p-6 text-center text-red-500 bg-black"><AlertCircle className="mb-2"/><p>{error}</p></div>}
        
        {videos.map((video, index) => (
          <VideoSlide 
            key={video.id} 
            video={video} 
            index={index}
            isActive={index === activeIndex} // Cek apakah index video sama dengan index scroll
          />
        ))}
        
        {/* Spacer bawah agar video terakhir tidak tertutup menu */}
        <div className="h-[70px] snap-start bg-black"></div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full h-[70px] bg-black/80 backdrop-blur border-t border-white/10 flex justify-around items-center z-50 pb-2">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-white' : 'text-gray-500'}`}><Home size={24} /><span className="text-[10px] font-bold">Home</span></button>
        <button onClick={() => setActiveTab('search')} className="bg-gradient-to-tr from-red-600 to-pink-600 p-4 rounded-full -mt-8 border-4 border-black shadow-lg"><Search size={26} className="text-white" /></button>
        <button className="flex flex-col items-center p-2 text-gray-500"><User size={24} /><span className="text-[10px] font-bold">Saya</span></button>
      </div>

    </div>
  );
}
