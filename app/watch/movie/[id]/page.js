'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar'; 
import Footer from '../../../../components/Footer';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const AdComponent = ({ adKey, width, height, wrapperClassName }) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            background: transparent; 
            overflow: hidden; 
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://environmenttalentrabble.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full flex justify-center items-center overflow-hidden ${wrapperClassName}`} style={{ minHeight: `${height}px` }}>
      <iframe
        srcDoc={srcDoc}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        style={{ display: 'block', maxWidth: '100%', border: 'none', background: 'transparent' }}
      ></iframe>
    </div>
  );
};

export default function WatchMovie() {
  const params = useParams();
  const id = params?.id; 

  const [movieDetails, setMovieDetails] = useState(null);
  const [sidebarMovies, setSidebarMovies] = useState([]);
  const [bottomSimilarMovies, setBottomSimilarMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeServerId, setActiveServerId] = useState('server1');
  const [showAllServers, setShowAllServers] = useState(false); 
  
  const [hasClickedPlayer, setHasClickedPlayer] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const servers = [
    { id: 'server1', name: 'MultiEmbed', url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
    { id: 'server2', name: 'SuperEmbed', url: `https://embed.su/embed/movie/${id}` },
    { id: 'server3', name: 'VidSrc Me', url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { id: 'server4', name: 'VidSrc To', url: `https://vidsrc.to/embed/movie/${id}` },
    { id: 'server5', name: 'AutoEmbed', url: `https://player.autoembed.co/movie/${id}` },
    { id: 'server6', name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/movie/${id}` },
  ];

  const activeServer = servers.find(s => s.id === activeServerId) || servers[0];
  const currentStreamUrl = activeServer.url;

  useEffect(() => {
    if (!id) return;

    const fetchMovieData = async () => {
      setIsLoading(true);
      try {
        const detailsRes = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
        const detailsData = await detailsRes.json();
        setMovieDetails(detailsData);
        
        let franchiseMovies = [];

        if (detailsData.belongs_to_collection) {
          try {
            const collectionRes = await fetch(
              `${BASE_URL}/collection/${detailsData.belongs_to_collection.id}?api_key=${API_KEY}`
            );
            const collectionData = await collectionRes.json();
            
            if (collectionData && collectionData.parts) {
              franchiseMovies = collectionData.parts
                .filter(movie => movie.id !== parseInt(id))
                .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
            }
          } catch (collErr) {
            console.error("Failed to load collection parts:", collErr);
          }
        }
        
        const [recRes, simRes] = await Promise.all([
          fetch(`${BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`)
        ]);
        
        const recData = await recRes.json();
        const simData = await simRes.json();
        
        const rawSuggestions = [...(recData.results || []), ...(simData.results || [])];
        
        const uniqueSuggestions = [];
        rawSuggestions.forEach(movie => {
          const isCurrentMovie = movie.id === parseInt(id);
          const isAlreadyInFranchise = franchiseMovies.some(m => m.id === movie.id);
          const isAlreadyAdded = uniqueSuggestions.some(m => m.id === movie.id);
          
          if (!isCurrentMovie && !isAlreadyInFranchise && !isAlreadyAdded) {
            uniqueSuggestions.push(movie);
          }
        });

        const finalSidebarItems = [...franchiseMovies];
        const paddingNeeded = 6 - finalSidebarItems.length;
        
        if (paddingNeeded > 0 && uniqueSuggestions.length > 0) {
          finalSidebarItems.push(...uniqueSuggestions.slice(0, paddingNeeded));
        }
        
        const remainingOffset = Math.max(0, paddingNeeded);
        // LIMITED TO EXACTLY 39 ITEMS
        const finalBottomItems = uniqueSuggestions.slice(remainingOffset, remainingOffset + 32);

        setSidebarMovies(finalSidebarItems);
        setBottomSimilarMovies(finalBottomItems);

      } catch (err) {
        console.error("Failed to load movie data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  useEffect(() => {
    setHasClickedPlayer(false);
  }, [activeServerId, id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentStreamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayerClick = () => {
    window.open('https://environmenttalentrabble.com/niwvwhsdrt?key=6ae3e88a79f88c62bed220b8faec0bf0', '_blank');
    setHasClickedPlayer(true);
  };

  if (isLoading || !movieDetails) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-red-600 border-zinc-800 rounded-full animate-spin"></div>
          <span className="text-sm font-bold tracking-widest uppercase text-gray-400">Loading Movie Stream...</span>
        </div>
      </div>
    );
  }

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pb-16">
      
      <Navbar contentType="movie" setContentType={() => {}} filterType="default" setFilterType={() => {}} />

      <main className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col gap-10 mb-2">
        
        <AdComponent 
          adKey="505a6081e767b51fdf7cd7a743de887b" 
          width={728} 
          height={90} 
          wrapperClassName="mb-6" 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl group">
              {!hasClickedPlayer && (
                <div 
                  className="absolute inset-0 z-10 cursor-pointer" 
                  onClick={handlePlayerClick} 
                  title="Click to Play" 
                />
              )}
              <iframe 
                src={activeServer.url} 
                className="w-full h-full absolute inset-0" 
                allowFullScreen 
                scrolling="no" 
                frameBorder="0" 
              />
            </div>

            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-md p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center justify-between sm:justify-start flex-shrink-0">
                <span className="text-[11px] sm:text-xs font-black text-gray-400 uppercase tracking-wider">
                  <i className="fa-solid fa-server text-red-500 mr-1.5"></i> Select Server:
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5 w-full sm:w-auto">
                {servers.map((srv, index) => {
                  const isHidden = index >= 3 && !showAllServers;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => setActiveServerId(srv.id)}
                      className={`text-[11px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all border cursor-pointer focus:outline-none truncate text-center ${
                        isHidden ? 'hidden' : 'block'
                      } ${
                        activeServerId === srv.id
                          ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                          : 'bg-zinc-800 border-white/5 text-gray-300 hover:bg-zinc-700/60 hover:text-white'
                      }`}
                    >
                      {srv.name}
                    </button>
                  );
                })}

                {servers.length > 3 && (
                  <button
                    onClick={() => setShowAllServers(!showAllServers)}
                    className="text-[11px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-zinc-900/80 border border-dashed border-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1 focus:outline-none cursor-pointer"
                  >
                    <span>{showAllServers ? 'Less' : `+${servers.length - 3} More`}</span>
                    <i className={`fa-solid ${showAllServers ? 'fa-chevron-up' : 'fa-chevron-down'} text-[9px]`}></i>
                  </button>
                )}
              </div>
            </div>

            <div className="p-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white select-text">
                  {movieDetails.title}
                </h1>
                
                <button 
                  onClick={() => setIsDownloadModalOpen(true)} 
                  className="inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all shadow-md shadow-red-600/10 flex-shrink-0 cursor-pointer"
                >
                  <i className="fa-solid fa-download text-[10px] md:text-xs"></i>
                  <span>Download</span>
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-400 mb-4">
                <span className="text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                  <i className="fa-solid fa-star text-[11px]"></i>
                  {movieDetails.vote_average?.toFixed(1)}
                </span>
                <span>•</span>
                <span className="font-medium text-gray-200">{formatRuntime(movieDetails.runtime)}</span>
                <span>•</span>
                <span className="text-gray-300">{movieDetails.release_date?.substring(0, 4)}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  {movieDetails.genres?.slice(0, 3).map(g => (
                    <span key={g.id} className="bg-zinc-800 text-gray-300 px-2 py-0.5 rounded text-[11px] border border-white/5">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                {movieDetails.overview || "No movie record summaries found inside our system databanks."}
              </p>

              <AdComponent 
                adKey="0219cd05b1d4804869fc178ab5c3dce2" 
                width={320} 
                height={50} 
                wrapperClassName="mt-5 rounded-lg shadow-lg" 
              />
            </div>
          </div>

          <div className="lg:col-span-1 relative min-h-[450px] lg:min-h-0">
            <div className="lg:absolute lg:inset-0 bg-zinc-900/30 border border-white/5 backdrop-blur-md rounded-xl p-5 flex flex-col">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 flex-shrink-0">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  {movieDetails.belongs_to_collection ? 'Full Saga / Collection' : 'Quick Recommendations'}
                </span>
                <span className="text-[11px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                  {movieDetails.belongs_to_collection ? 'Saga' : 'Hot'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto premium-panel-scrollbar pr-1 flex flex-col gap-3">
                {sidebarMovies.length > 0 ? (
                  sidebarMovies.map((movie) => (
                    <a
                      key={movie.id}
                      href={`/watch/movie/${movie.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/watch/movie/${movie.id}`;
                      }}
                      className="w-full flex items-start gap-3 p-2 rounded-lg bg-zinc-900/40 border border-transparent hover:border-white/5 hover:bg-zinc-800/40 transition-all group/side cursor-pointer"
                    >
                      <div className="w-16 aspect-[2/3] bg-zinc-950 rounded overflow-hidden flex-shrink-0 shadow border border-white/5">
                        {movie.poster_path ? (
                          <img src={`${IMAGE_BASE_URL}/w185${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[9px] text-zinc-600 text-center p-1">No Pic</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <h4 className="text-xs font-bold line-clamp-1 text-gray-200 group-hover/side:text-red-400 transition-colors">
                          {movie.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                          <span className="text-amber-400 font-bold">★ {movie.vote_average?.toFixed(1)}</span>
                          <span>•</span>
                          <span>{movie.release_date?.substring(0, 4)}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1.5 leading-normal">
                          {movie.overview || "No summary listed."}
                        </p>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center text-xs text-gray-500 py-8">No matching records found.</div>
                )}
              </div>

            </div>
          </div>
        </div>

        <hr className="border-white/5 my-2" />

        <AdComponent 
          adKey="d31895d04994bfe43ad4113bd0488409" 
          width={300} 
          height={250} 
          wrapperClassName="lg:hidden mb-4 rounded-lg shadow-lg" 
        />

        {/* SECTION MORE MOVIES - UP TO 39 CLEAN METADATA ITEMS */}
        <div className="w-full">
          <h3 className="text-lg md:text-xl font-black tracking-wide uppercase mb-6 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-sm"></span> More Movies Like This
          </h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
            {bottomSimilarMovies.map((movie) => (
              <a 
                href={`/watch/movie/${movie.id}`} 
                key={movie.id}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/watch/movie/${movie.id}`;
                }}
                className="group flex flex-col bg-zinc-900/20 border border-white/5 rounded-lg overflow-hidden transition-all hover:scale-[1.03] hover:border-white/10 hover:shadow-xl cursor-pointer"
              >
                <div className="relative aspect-[2/3] w-full bg-zinc-950">
                  {movie.poster_path ? (
                    <img src={`${IMAGE_BASE_URL}/w342${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/60 text-center p-4 border-b border-white/5">
                      <i className="fa-solid fa-clapperboard text-2xl text-zinc-600 mb-2"></i>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 line-clamp-3 px-1">{movie.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow">Watch Now</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-zinc-900/60 backdrop-blur-sm min-w-0">
                  <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white transition-colors">{movie.title}</h4>
                  
                  <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-gray-400 mt-1.5 w-full">
                    <span className="text-amber-400 font-bold flex items-center gap-0.5 flex-shrink-0">
                      <i className="fa-solid fa-star text-[9px] sm:text-[10px]"></i>
                      {movie.vote_average?.toFixed(1) || '0.0'}
                    </span>
                    
                    <span className="bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex-shrink-0 border border-white/5">
                      MOVIE
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL DE TÉLÉCHARGEMENT */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsDownloadModalOpen(false)}
          />
          
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <i className="fa-solid fa-cloud-arrow-down text-red-500 text-xl"></i>
                <div>
                  <h3 className="font-extrabold text-base">Download Dashboard</h3>
                  <p className="text-[11px] text-gray-400 font-medium">{movieDetails.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Option 1: Open Video Hub (Click Download Inside Player)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href={`https://multiembed.mov/?video_id=${id}&tmdb=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700/80 border border-white/5 p-3 rounded-xl text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all text-gray-200 hover:text-white"
                >
                  <span className="text-red-400 font-black">MultiEmbed Server</span>
                  <span className="text-[10px] text-gray-400 font-normal">Has internal DL Cloud</span>
                </a>
                <a 
                  href={`https://embed.su/embed/movie/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700/80 border border-white/5 p-3 rounded-xl text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all text-gray-200 hover:text-white"
                >
                  <span className="text-amber-400 font-black">SuperEmbed Server</span>
                  <span className="text-[10px] text-gray-400 font-normal">Fast segment fetching</span>
                </a>
              </div>
            </div>

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

      <AdComponent 
        adKey="2d00d5f1f381c5bf760e84da1f51d68c" 
        width={468} 
        height={60} 
        wrapperClassName="my-8 rounded-lg shadow-lg" 
      />

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