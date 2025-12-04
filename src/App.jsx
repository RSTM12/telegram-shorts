import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, User, Heart, Share2, Play, RefreshCw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

// --- GANTI KODE DI BAWAH INI DENGAN API KEY ANDA ---
const YOUTUBE_API_KEY = 'AIzaSyCLEVeOYlPBpWyG3sGfwHksRu4WyVDmWfk'; 
// --------------------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null); // Melacak video mana yang sedang dilihat
  const [searchQuery, setSearchQuery] = useState('funny shorts'); 

  // Referensi untuk mendeteksi scroll
  const containerRef = useRef(null);
  const videoRefs = useRef({});

  // Setup Telegram
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
      window.Telegram.WebApp.setBackgroundColor('#000000');
    }
  }, []);

  // Fetch Data YouTube
  const fetchYouTubeShorts = async (query) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('MASUKKAN')) {
      setError("API Key belum diisi. Edit file src/App.jsx di GitHub Anda.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
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
      if (formattedVideos.length > 0) {
        setActiveVideoId(formattedVideos[0].id); // Set video pertama aktif
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchYouTubeShorts(searchQuery); }, []);

  // Logika "Mata-Mata" (Intersection Observer) untuk mendeteksi video mana yang sedang tampil
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Jika video masuk layar > 50%, set sebagai aktif
            const videoId = entry.target.getAttribute('data-id');
            setActiveVideoId(videoId);
          }
        });
      },
      { threshold: 0.6 } // Harus 60% terlihat baru dianggap aktif
    );

    // Pasang mata-mata ke setiap elemen video
    Object.values(videoRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos]); // Jalankan ulang kalau list video berubah

  // Komponen Kartu Video Full Screen
  const VideoSlide = ({ video, isActive }) => {
    const [liked, setLiked] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Default unmuted, tapi browser mungkin maksa mute

    return (
      <div 
        ref={el => videoRefs.current[video.id] = el}
        data-id={video.id}
        className="w-full h-[100dvh] snap-start shrink-0 relative bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Layer Video / Thumbnail */}
        <div className="absolute inset-0 w-full h-full bg-black">
          {isActive ? (
            // Jika aktif, load iframe YouTube dengan Autoplay
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&mute=${isMuted ? 1 : 0}`}
              title={video.title}
              className="w-full h-full object-cover pointer-events-none scale-[1.35]" // scale untuk zoom dikit biar full
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            // Jika tidak aktif, tampilkan gambar saja (Hemat Memori)
            <img 
              src={video.thumbnail} 
              className="w-full h-full object-cover opacity-60" 
              alt="thumbnail"
            />
          )}
        </div>

        {/* Overlay Hitam Gradasi (biar teks terbaca) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none"></div>

        {/* Info & Tombol di Kanan */}
        <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-20">
          <div className="flex flex-col items-center gap-1">
             <div className="bg-gray-800/60 backdrop-blur p-3 rounded-full active:scale-90 transition-transform" onClick={() => setLiked(!liked)}>
                <Heart size={28} className={liked ? "fill-red-500 text-red-500" : "text-white"} />
             </div>
             <span className="text-xs font-bold shadow-black drop-shadow-md">Suka</span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
             <div className="bg-gray-800/60 backdrop-blur p-3 rounded-full active:scale-90 transition-transform">
                <Share2 size={28} className="text-white" />
             </div>
             <span className="text-xs font-bold shadow-black drop-shadow-md">Share</span>
          </div>

          <div className="flex flex-col items-center gap-1">
             <div className="bg-gray-800/60 backdrop-blur p-3 rounded-full active:scale-90 transition-transform" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
             </div>
          </div>
        </div>

        {/* Info Video di Kiri Bawah */}
        <div className="absolute left-4 bottom-20 right-20 z-20 text-left">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg border border-white/20">
               <span className="text-xs font-bold">YT</span>
             </div>
             <p className="font-bold text-md text-white drop-shadow-md truncate">{video.channel}</p>
          </div>
          <p className="text-sm text-gray-100 line-clamp-2 leading-snug drop-shadow-md">
            {video.title}
          </p>
        </div>

        {/* Pause/Play Overlay (jika loading) */}
        {isActive && !video && (
           <div className="absolute inset-0 flex items-center justify-center z-0">
             <RefreshCw className="animate-spin text-white/50" size={40} />
           </div>
        )}
      </div>
    );
  };

  // --- RENDER UTAMA ---
  return (
    <div className="bg-black text-white font-sans max-w-md mx-auto h-[100dvh] flex flex-col overflow-hidden relative">
      
      {/* Search Overlay (Jika Mode Search Aktif) */}
      {activeTab === 'search' && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col p-6 animate-in slide-in-from-bottom">
           <button onClick={() => setActiveTab('home')} className="mb-6 flex items-center gap-2 text-gray-400">
             <ArrowLeft /> Kembali
           </button>
           <h2 className="text-2xl font-bold mb-4">Cari Video</h2>
           <input 
             autoFocus
             type="text" 
             placeholder="Ketik lalu Enter..." 
             className="w-full bg-gray-800 p-4 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-red-600" 
             onKeyDown={(e) => { 
               if (e.key === 'Enter') { 
                 setSearchQuery(e.target.value); 
                 setActiveTab('home'); 
                 fetchYouTubeShorts(e.target.value); 
               }
             }} 
           />
           <div className="mt-6 flex flex-wrap gap-2">
             {['Lucu', 'Mobile Legends', 'Masak', 'Anime', 'Kucing'].map(tag => (
               <button key={tag} onClick={() => { setSearchQuery(tag); setActiveTab('home'); fetchYouTubeShorts(tag); }} 
                 className="bg-gray-800 px-4 py-2 rounded-full text-sm hover:bg-gray-700">
                 #{tag}
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Container Video Swipe (Main Content) */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative"
      >
        {/* Loading / Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
            <div className="text-center p-6">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-2"/>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {loading && videos.length === 0 && (
           <div className="h-full flex items-center justify-center">
             <RefreshCw className="animate-spin text-red-600" size={40}/>
           </div>
        )}

        {/* Mapping Video */}
        {videos.map((video) => (
          <VideoSlide 
            key={video.id} 
            video={video} 
            isActive={activeVideoId === video.id} 
          />
        ))}

        {/* Footer spacer untuk menu bawah */}
        <div className="h-16 snap-start"></div> 
      </div>

      {/* Bottom Navigation (Fixed on top of video) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-t border-white/10 flex justify-around items-center z-40">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-white' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        
        {/* Tombol Search di Tengah */}
        <button onClick={() => setActiveTab('search')} className="bg-gradient-to-tr from-red-600 to-pink-600 p-3 rounded-xl -mt-6 shadow-lg shadow-red-900/50 border border-white/20 active:scale-95 transition-transform">
           <Search size={24} className="text-white" />
        </button>

        <button onClick={() => alert('Fitur Profil Segera Hadir!')} className="flex flex-col items-center gap-1 text-gray-500">
          <User size={24} />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </div>

    </div>
  );
}
