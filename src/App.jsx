import React, { useState, useEffect } from 'react';
import { Home, Search, User, Heart, Share2, Play, RefreshCw, AlertCircle, Video } from 'lucide-react';

// --- GANTI KODE DI BAWAH INI DENGAN API KEY ANDA ---
const YOUTUBE_API_KEY = 'AIzaSyCLEVeOYlPBpWyG3sGfwHksRu4WyVDmWfk'; 
// --------------------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('funny shorts'); 

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
  }, []);

  const fetchYouTubeShorts = async (query) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('MASUKKAN')) {
      setError("API Key belum diisi. Edit file src/App.jsx di GitHub Anda.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${query}&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchYouTubeShorts(searchQuery); }, []);

  const VideoCard = ({ video }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    return (
      <div className="bg-gray-900 mb-6 rounded-xl overflow-hidden border border-gray-800">
        <div className="p-3 bg-black/40 flex items-center gap-2">
           <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold">YT</div>
           <p className="text-xs font-bold truncate">{video.channel}</p>
        </div>
        <div className="relative w-full aspect-[9/16] bg-black">
          {isPlaying ? (
            <iframe src={`https://www.youtube.com/embed/${video.id}?autoplay=1&controls=1`} className="w-full h-full absolute inset-0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
          ) : (
            <div className="w-full h-full relative cursor-pointer" onClick={() => setIsPlaying(true)}>
              <img src={video.thumbnail} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center"><Play fill="white" size={40}/></div>
            </div>
          )}
        </div>
        <div className="p-3 flex justify-between">
           <Heart size={20} className={liked ? "text-red-500 fill-red-500" : "text-white"} onClick={() => setLiked(!liked)} />
           <span className="text-xs text-gray-400">Tonton di App</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans max-w-md mx-auto flex flex-col h-screen overflow-hidden">
      <div className="px-4 py-3 bg-black/90 border-b border-gray-800 flex justify-between items-center shrink-0">
        <h1 className="font-bold text-lg">ShortsMini</h1>
        <RefreshCw size={18} onClick={() => fetchYouTubeShorts(searchQuery)} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-20">
        {error && <div className="text-red-500 text-xs bg-red-900/20 p-2 rounded mb-4">{error}</div>}
        {loading && <div className="text-center text-gray-500 py-10">Loading...</div>}
        {activeTab === 'home' && videos.map(v => <VideoCard key={v.id} video={v} />)}
        {activeTab === 'search' && (
           <div className="pt-10 px-4">
             <input type="text" placeholder="Cari..." className="w-full bg-gray-800 p-3 rounded-lg text-white" 
               onKeyDown={(e) => { if(e.key === 'Enter'){ setSearchQuery(e.target.value); setActiveTab('home'); fetchYouTubeShorts(e.target.value); }}} 
             />
           </div>
        )}
      </div>
      <div className="bg-gray-900 border-t border-gray-800 shrink-0 h-14 flex justify-around items-center">
        <Home size={24} onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-red-500' : 'text-gray-500'}/>
        <Search size={24} onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'text-red-500' : 'text-gray-500'}/>
      </div>
    </div>
  );
}
