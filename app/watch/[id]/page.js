'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar'; 
import Footer from '../../../components/Footer';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function WatchTV() {
  const params = useParams();
  const id = params?.id; 

  const [showDetails, setShowDetails] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [similarShows, setSimilarShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeServerId, setActiveServerId] = useState('server1');
  
  // États pour la fenêtre de téléchargement
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const servers = [
    { id: 'server1', name: 'MultiEmbed', url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${currentSeason}&e=${currentEpisode}` },
    { id: 'server2', name: 'SuperEmbed', url: `https://embed.su/embed/tv/${id}/${currentSeason}/${currentEpisode}` },
    { id: 'server3', name: 'VidSrc Me', url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}` },
    { id: 'server4', name: 'VidSrc To', url: `https://vidsrc.to/embed/tv/${id}/${currentSeason}/${currentEpisode}` },
    { id: 'server5', name: 'AutoEmbed', url: `https://player.autoembed.co/tv/${id}/${currentSeason}/${currentEpisode}` },
    { id: 'server6', name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/tv/${id}/${currentSeason}/${currentEpisode}` },
  ];

  const activeServer = servers.find(s => s.id === activeServerId) || servers[0];

  // Lien direct du flux actuel à copier
  const currentStreamUrl = activeServer.url;

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const detailsRes = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
        const detailsData = await detailsRes.json();
        setShowDetails(detailsData);
        
        const validSeasons = (detailsData.seasons || []).filter(s => s.season_number > 0);
        setSeasons(validSeasons);
        
        if (validSeasons.length > 0) {
          setCurrentSeason(validSeasons[0].season_number);
        }

        const similarRes = await fetch(`${BASE_URL}/tv/${id}/similar?api_key=${API_KEY}`);
        const similarData = await similarRes.json();
        setSimilarShows((similarData.results || []).slice(0, 12));

      } catch (err) {
        console.error("Failed to load show structural data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
    setCurrentSeason(1);
    setCurrentEpisode(1);
  }, [id]);

  useEffect(() => {
    if (!id || !currentSeason) return;

    const fetchEpisodes = async () => {
      try {
        const epRes = await fetch(`${BASE_URL}/tv/${id}/season/${currentSeason}?api_key=${API_KEY}`);
        const epData = await epRes.json();
        setEpisodes(epData.episodes || []);
      } catch (err) {
        console.error("Failed to map episode structural array:", err);
      }
    };

    fetchEpisodes();
  }, [id, currentSeason]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentStreamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !showDetails) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-red-600 border-zinc-800 rounded-full animate-spin"></div>
          <span className="text-sm font-bold tracking-widest uppercase text-gray-400">Loading Metadata Stream...</span>
        </div>
      </div>
    );
  }

  const activeSeasonData = seasons.find(s => s.season_number === currentSeason);
  const currentSeasonName = activeSeasonData ? (activeSeasonData.name || `Season ${activeSeasonData.season_number}`) : `Season ${currentSeason}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pb-16">
      
      <Navbar contentType="tv" setContentType={() => {}} filterType="default" setFilterType={() => {}} />

      <main className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col gap-10 mb-12">
        
        {/* LECTEUR + INFOS & ÉPISODES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Lecteur Vidéo */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl">
              <iframe
                src={activeServer.url}
                className="w-full h-full absolute inset-0"
                allowFullScreen
                scrolling="no"
                frameBorder="0"
              />
            </div>

            {/* Serveurs */}
            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-md p-4 rounded-xl flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
                <i className="fa-solid fa-server text-red-500 mr-1.5"></i> Select Server:
              </span>
              {servers.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => setActiveServerId(srv.id)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border cursor-pointer focus:outline-none ${
                    activeServerId === srv.id
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-zinc-800 border-white/5 text-gray-300 hover:bg-zinc-700/60 hover:text-white'
                  }`}
                >
                  {srv.name}
                </button>
              ))}
            </div>

            {/* Métadonnées & Description */}
            <div className="p-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                  {showDetails.name}
                </h1>
                
                {/* Le bouton déclenche maintenant l'ouverture de la boîte de téléchargement */}
                <button 
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-red-600/20 flex-shrink-0 cursor-pointer"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Download Options</span>
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-400 mb-4">
                <span className="text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                  <i className="fa-solid fa-star text-[11px]"></i>
                  {showDetails.vote_average?.toFixed(1)}
                </span>
                <span>•</span>
                <span className="font-medium text-gray-200">
                  Season {currentSeason}, Episode {currentEpisode}
                </span>
                <span>•</span>
                <span className="text-gray-300">{showDetails.first_air_date?.substring(0, 4)}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  {showDetails.genres?.slice(0, 3).map(g => (
                    <span key={g.id} className="bg-zinc-800 text-gray-300 px-2 py-0.5 rounded text-[11px] border border-white/5">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                {showDetails.overview || "No serialization record summaries found inside our system databanks."}
              </p>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="lg:col-span-1 relative min-h-[480px] lg:min-h-0">
            <div className="lg:absolute lg:inset-0 bg-zinc-900/30 border border-white/5 backdrop-blur-md rounded-xl p-5 flex flex-col">
              
              {/* Menu Saisons */}
              <div className="mb-4 relative flex-shrink-0">
                <label className="block text-xs font-black tracking-widest uppercase text-gray-400 mb-2">
                  Select Season Layout
                </label>
                
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-zinc-800 text-sm text-gray-200 border border-white/10 px-4 py-3 rounded-lg outline-none cursor-pointer focus:border-red-600 transition-all flex items-center justify-between font-bold"
                >
                  <span>{currentSeasonName}</span>
                  <i className={`fa-solid fa-chevron-down transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-500' : 'text-gray-400'}`}></i>
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute z-50 left-0 right-0 mt-1.5 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto premium-panel-scrollbar">
                      {seasons.map((s) => {
                        const isSelected = s.season_number === currentSeason;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              setCurrentSeason(Number(s.season_number));
                              setCurrentEpisode(1); 
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors cursor-pointer flex items-center justify-between border-b border-white/5 last:border-b-0 ${
                              isSelected ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                            }`}
                          >
                            <span>{s.name || `Season ${s.season_number}`}</span>
                            {isSelected && <i className="fa-solid fa-check text-xs text-white"></i>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Titre Liste */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 flex-shrink-0">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Episodes Index List
                </span>
                <span className="text-[11px] font-bold text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                  {episodes.length} Items
                </span>
              </div>

              {/* Liste Épisodes */}
              <div className="flex-1 overflow-y-auto premium-panel-scrollbar pr-1 flex flex-col gap-2">
                {episodes.map((ep) => {
                  const isSelected = ep.episode_number === currentEpisode;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setCurrentEpisode(ep.episode_number)}
                      className={`w-full flex items-start gap-3 py-[7px] px-2.5 rounded-lg text-left transition-all group/ep cursor-pointer border ${
                        isSelected
                          ? 'bg-red-600/10 border-red-600/40 text-white shadow-md'
                          : 'bg-zinc-900/40 border-transparent text-gray-400 hover:bg-zinc-800/40 hover:text-white'
                      }`}
                    >
                      <div className="relative w-24 aspect-[16/9] bg-zinc-950 rounded overflow-hidden flex-shrink-0 shadow border border-white/5">
                        {ep.still_path ? (
                          <img src={`${IMAGE_BASE_URL}/w185${ep.still_path}`} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[10px] text-zinc-600">No Preview</div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-[9px] font-black tracking-tighter px-1.5 py-0.2 rounded text-gray-200">
                          EP {ep.episode_number}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <h4 className={`text-xs font-bold line-clamp-1 transition-colors ${isSelected ? 'text-red-400' : 'text-gray-200 group-hover/ep:text-white'}`}>
                          {ep.name || `Episode ${ep.episode_number}`}
                        </h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-normal pr-1">
                          {ep.overview || "No summary descriptions logged inside our servers for this entry."}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        <hr className="border-white/5 my-2" />

        {/* RECOMMANDATIONS SIMILAIRES */}
        <div className="w-full">
          <h3 className="text-lg md:text-xl font-black tracking-wide uppercase mb-6 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-sm"></span> More Shows Like This
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {similarShows.map((show) => (
              <Link 
                href={`/watch/${show.id}`} 
                key={show.id}
                className="group flex flex-col bg-zinc-900/20 border border-white/5 rounded-lg overflow-hidden transition-all hover:scale-[1.03] hover:border-white/10 hover:shadow-xl"
              >
                <div className="relative aspect-[2/3] w-full bg-zinc-950">
                  {show.poster_path ? (
                    <img src={`${IMAGE_BASE_URL}/w342${show.poster_path}`} alt={show.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/60 text-center p-4 border-b border-white/5">
                      <i className="fa-solid fa-clapperboard text-2xl text-zinc-600 mb-2"></i>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 line-clamp-3 px-1">{show.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow">Watch Now</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/60 backdrop-blur-sm min-w-0">
                  <h4 className="text-xs md:text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white transition-colors">{show.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                    <span className="text-amber-400 font-medium">★ {show.vote_average?.toFixed(1)}</span>
                    <span>•</span>
                    <span>{show.first_air_date?.substring(0, 4) || 'N/A'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL / CENTRE DE TÉLÉCHARGEMENT */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Arrière-plan flouté */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsDownloadModalOpen(false)}
          />
          
          {/* Contenu de la boîte */}
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <i className="fa-solid fa-cloud-arrow-down text-red-500 text-xl"></i>
                <div>
                  <h3 className="font-extrabold text-base">Download Dashboard</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Season {currentSeason} • Episode {currentEpisode}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Option 1: Serveurs Externes Directs */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Option 1: Open Video Hub (Click Download Inside Player)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href={`https://multiembed.mov/?video_id=${id}&tmdb=1&s=${currentSeason}&e=${currentEpisode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700/80 border border-white/5 p-3 rounded-xl text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all text-gray-200 hover:text-white"
                >
                  <span className="text-red-400 font-black">MultiEmbed Server</span>
                  <span className="text-[10px] text-gray-400 font-normal">Has internal DL Cloud</span>
                </a>
                <a 
                  href={`https://embed.su/embed/tv/${id}/${currentSeason}/${currentEpisode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700/80 border border-white/5 p-3 rounded-xl text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all text-gray-200 hover:text-white"
                >
                  <span className="text-amber-400 font-black">SuperEmbed Server</span>
                  <span className="text-[10px] text-gray-400 font-normal">Fast segment fetching</span>
                </a>
              </div>
            </div>

            {/* Option 2: Copier l'adresse de flux pour les gestionnaires externes */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Option 2: Copy Stream Gateway (For VLC / 1DM / IDM)
              </span>
              <div className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-white/5">
                <input 
                  type="text" 
                  readOnly 
                  value={currentStreamUrl}
                  className="bg-transparent text-xs text-gray-400 flex-1 outline-none select-all truncate font-mono px-1"
                />
                <button
                  onClick={handleCopyLink}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  }`}
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Option 3: Guide/Astuce Express */}
            <div className="bg-red-950/20 border border-red-500/20 p-3 rounded-xl text-xs flex gap-3 text-gray-300">
              <i className="fa-solid fa-circle-info text-red-400 text-sm mt-0.5 flex-shrink-0"></i>
              <div className="leading-relaxed">
                <span className="font-bold text-white block mb-0.5">How to save the .MP4 immediately:</span>
                Since these are segmented HLS streams, install a free extension like <span className="text-red-400 font-bold">FetchV</span> or <span className="text-red-400 font-bold">Video DownloadHelper</span>. Launch the player on your site, click the extension icon, and it will capture and assemble the true HD file in 1-click!
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        .premium-panel-scrollbar::-webkit-scrollbar { width: 5px; }
        .premium-panel-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
        .premium-panel-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .premium-panel-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.4); }
      `}} />
    </div>
  );
}