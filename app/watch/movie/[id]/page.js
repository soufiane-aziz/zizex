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

  const servers = [
    { id: 'server1', name: 'MultiEmbed', url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
    { id: 'server2', name: 'SuperEmbed', url: `https://embed.su/embed/movie/${id}` },
    { id: 'server3', name: 'VidSrc Me', url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { id: 'server4', name: 'VidSrc To', url: `https://vidsrc.to/embed/movie/${id}` },
    { id: 'server5', name: 'AutoEmbed', url: `https://player.autoembed.co/movie/${id}` },
    { id: 'server6', name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/movie/${id}` },
  ];

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

  const handlePlayerClick = () => {
    window.open('https://environmenttalentrabble.com/niwvwhsdrt?key=6ae3e88a79f88c62bed220b8faec0bf0', '_blank');
    setHasClickedPlayer(true);
  };

  // --- SKELETON LOADING TEMPLATE SHOWN WHILE FETCHING ---
  if (isLoading || !movieDetails) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pb-16">
        <Navbar contentType="movie" setContentType={() => {}} filterType="default" setFilterType={() => {}} />

        <main className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col gap-10 mb-2">
          {/* Top Banner Ad Skeleton */}
          <div className="w-full flex justify-center items-center mb-6">
            <div className="w-[728px] h-[90px] bg-zinc-900/50 border border-white/5 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Left Content Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Player Skeleton */}
              <div className="w-full aspect-video bg-zinc-900/40 border border-white/5 rounded-xl animate-pulse" />

              {/* Server Control Bar Skeleton */}
              <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-md p-3 sm:p-4 rounded-xl flex items-center justify-between sm:justify-start gap-4">
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="flex gap-2.5 flex-wrap">
                  <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Text Meta Info Skeleton */}
              <div className="p-1">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-5 w-full">
                  <div className="h-8 w-2/3 max-w-[400px] bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="h-7 w-12 bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="h-7 w-16 bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="h-7 w-16 bg-zinc-800 rounded-lg animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="h-4 w-full bg-zinc-800/70 rounded animate-pulse" />
                  <div className="h-4 w-full bg-zinc-800/70 rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-zinc-800/70 rounded animate-pulse" />
                </div>

                {/* Bottom Player Ad Skeleton */}
                <div className="mt-6 w-[320px] h-[50px] bg-zinc-900/50 border border-white/5 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-1 relative min-h-[450px] lg:min-h-0">
              <div className="lg:absolute lg:inset-0 bg-zinc-900/30 border border-white/5 backdrop-blur-md rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-1">
                  <div className="h-4 w-36 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-5 w-10 bg-zinc-800 rounded animate-pulse" />
                </div>
                
                {/* 5 Stacked Side Mini Cards */}
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="w-full flex items-start gap-3 p-2 rounded-lg bg-zinc-900/20 border border-transparent">
                    <div className="w-16 aspect-[2/3] bg-zinc-800 rounded flex-shrink-0 animate-pulse" />
                    <div className="min-w-0 flex-1 space-y-2 pt-1">
                      <div className="h-3 w-3/4 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-2.5 w-1/4 bg-zinc-800/60 rounded animate-pulse" />
                      <div className="h-2 w-full bg-zinc-800/40 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-white/5 my-2" />

          {/* Lower Grid (More Movies Like This) Skeleton */}
          <div className="w-full">
            <div className="h-5 w-52 bg-zinc-800 rounded-md mb-6 animate-pulse" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="flex flex-col bg-zinc-900/20 border border-white/5 rounded-lg overflow-hidden">
                  <div className="aspect-[2/3] w-full bg-zinc-900/60 animate-pulse" />
                  <div className="p-2 sm:p-3 space-y-2">
                    <div className="h-3 w-4/5 bg-zinc-800 rounded animate-pulse" />
                    <div className="flex justify-between items-center pt-1">
                      <div className="h-2.5 w-8 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3.5 w-10 bg-zinc-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const activeServer = servers.find(s => s.id === activeServerId) || servers[0];

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
              
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4 w-full">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white select-text break-words">
                  {movieDetails.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm flex-shrink-0 ml-auto">
                  {/* Rating */}
                  <span className="text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 backdrop-blur-sm">
                    <i className="fa-solid fa-star text-[11px] sm:text-xs"></i>
                    {movieDetails.vote_average?.toFixed(1)}
                  </span>
                  
                  {/* Genres */}
                  <div className="flex items-center gap-1.5">
                    {movieDetails.genres?.slice(0, 2).map(g => (
                      <span key={g.id} className="bg-zinc-800 text-gray-300 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs border border-white/5 whitespace-nowrap font-medium">
                        {g.name}
                      </span>
                    ))}
                  </div>
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

        {/* SECTION MORE MOVIES */}
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