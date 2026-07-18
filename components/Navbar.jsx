'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function Navbar({ contentType, setContentType, filterType, setFilterType }) {
  const [isSearchInputVisible, setIsSearchInputVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  // Navigation des onglets principaux
  const handleNavigation = (type, filter) => {
    if (isHomePage) {
      setContentType(type);
      setFilterType(filter);
    } else {
      if (type === 'all' && filter === 'default') {
        router.push('/');
      } else if (filter === 'top_rated') {
        const queryType = type !== 'all' ? `type=${type}&` : '';
        router.push(`/?${queryType}filter=top_rated`);
      } else {
        router.push(`/?type=${type}`);
      }
    }

    setSearchQuery('');
    setSuggestions([]);
    setIsSearchInputVisible(false);
  };

  useEffect(() => {
    if (isSearchInputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchInputVisible]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch des suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const searchEndpoint = contentType === 'all' ? 'multi' : contentType;
        const res = await fetch(
          `${BASE_URL}/search/${searchEndpoint}?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        
        const queryLower = searchQuery.trim().toLowerCase();
        
        const validResults = (data.results || [])
          .filter(item => item.poster_path || item.backdrop_path)
          .filter(item => {
            const titleToDisplay = item.title || item.name;
            if (!titleToDisplay) return false;
            return titleToDisplay.toLowerCase().startsWith(queryLower);
          });

        setSuggestions(validResults.slice(0, 6)); 
      } catch (err) {
        console.error("Suggestions retrieval breakdown:", err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, contentType]);

  // Déclencheur d'action sur le bouton Loupe / Fermer
  const handleSearchAction = () => {
    if (!isSearchInputVisible) {
      setIsSearchInputVisible(true);
    } else {
      if (searchQuery) {
        // S'il y a du texte et qu'on clique sur la loupe/croix, on valide le premier résultat disponible
        if (suggestions.length > 0) {
          redirectToItem(suggestions[0]);
        }
      } else {
        setIsSearchInputVisible(false);
      }
    }
  };

  // GESTION DU PRESSION SUR ENTRÉE (Évite le 404 et force la redirection)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      redirectToItem(suggestions[0]);
    }
  };

  // CENTRALISATION DU ROUTAGE DYNAMIQUE (Pour éviter les erreurs d'URL)
  const redirectToItem = (item) => {
    const isTvShow = item.media_type === 'tv' || contentType === 'tv' || (!item.media_type && item.first_air_date);
    const dynamicHref = isTvShow ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`;
    
    setSuggestions([]);
    setSearchQuery('');
    setIsSearchInputVisible(false);
    router.push(dynamicHref);
  };

  const isHomeActive = contentType === 'all' && filterType === 'default';
  const isMoviesActive = contentType === 'movie' && filterType === 'default';
  const isTvActive = contentType === 'tv' && filterType === 'default';
  const isTopRatedActive = filterType === 'top_rated';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
      
      {/* Logo */}
      <button 
        onClick={() => handleNavigation('all', 'default')} 
        className="text-3xl md:text-4xl font-black tracking-wide cursor-pointer focus:outline-none"
      >
        <span className="text-red-600">z</span>
        <span className="text-white">Show</span>
      </button>

      {/* Liens principaux */}
      <div className="flex items-center gap-6 md:gap-8 text-sm tracking-wide uppercase">
        <button 
          onClick={() => handleNavigation('all', 'default')} 
          className={`transition-all duration-300 hover:text-red-600 cursor-pointer ${
            isHomeActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'
          }`}
        >
          Home
        </button>

        <button 
          onClick={() => handleNavigation('movie', 'default')} 
          className={`transition-all duration-300 hover:text-red-600 cursor-pointer ${
            isMoviesActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'
          }`}
        >
          Movies
        </button>

        <button 
          onClick={() => handleNavigation('tv', 'default')} 
          className={`transition-all duration-300 hover:text-red-600 cursor-pointer ${
            isTvActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'
          }`}
        >
          TV
        </button>

        <button 
          onClick={() => handleNavigation(contentType, 'top_rated')} 
          className={`transition-all duration-300 hover:text-red-600 cursor-pointer ${
            isTopRatedActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'
          }`}
        >
          Top Rated
        </button>
      </div>

      {/* Barre de recherche intégrée */}
      <div className="flex items-center gap-5 md:gap-6 text-white text-lg md:text-xl">
        
        <div ref={dropdownRef} className={`relative flex items-center transition-all duration-300 ${isSearchInputVisible ? 'bg-black/60 px-4 py-1.5 rounded-full border border-white/10 shadow-inner' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown} // Ajout de l'écouteur de touche
            placeholder="Titles, genres..."
            className={`bg-transparent outline-none text-white text-sm transition-all duration-300 placeholder:text-gray-500
              ${isSearchInputVisible ? 'w-44 sm:w-60 md:w-72 opacity-100 pr-2' : 'w-0 opacity-0 pointer-events-none'}`
            }
          />
          
          <button 
            onClick={handleSearchAction}
            className="transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none flex items-center justify-center text-white"
            aria-label="Search Toggle"
          >
            <i className={`fa-solid ${isSearchInputVisible ? 'fa-xmark' : 'fa-magnifying-glass'}`}></i>
          </button>

          {/* Dropdown flottant */}
          {isSearchInputVisible && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-b-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 transform origin-top transition-all duration-200">
              <div className="p-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                Suggestions Match
              </div>
              <div className="flex flex-col max-h-[380px] overflow-y-auto premium-nav-scrollbar">
                {suggestions.map((item) => {
                  const isTvShow = item.media_type === 'tv' || contentType === 'tv' || (!item.media_type && item.first_air_date);
                  const dynamicHref = isTvShow ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`;

                  return (
                    <Link 
                      key={item.id} 
                      href={dynamicHref}
                      onClick={() => { setSuggestions([]); setSearchQuery(''); setIsSearchInputVisible(false); }}
                      className="flex items-center gap-3 p-3 transition-all hover:bg-white/[0.06] border-b border-white/5 group/item"
                    >
                      <img 
                        src={`${IMAGE_BASE_URL}/w92${item.poster_path || item.backdrop_path}`} 
                        alt={item.title || item.name} 
                        className="w-9 h-13 object-cover rounded shadow bg-zinc-950 flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-200 group-hover/item:text-white line-clamp-1 transition-colors">
                          {item.title || item.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span className="text-amber-400 flex items-center gap-0.5 font-medium">
                            <i className="fa-solid fa-star text-[10px]"></i>
                            {item.vote_average?.toFixed(1) || '0.0'}
                          </span>
                          <span>•</span>
                          <span className="capitalize text-[11px] px-1.5 py-0.5 bg-zinc-800 rounded border border-white/5 text-gray-300">
                            {isTvShow ? 'TV' : 'Movie'}
                          </span>
                          { (item.release_date || item.first_air_date) && (
                            <>
                              <span>•</span>
                              <span>{(item.release_date || item.first_air_date)?.substring(0, 4)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .premium-nav-scrollbar::-webkit-scrollbar { width: 6px; }
        .premium-nav-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
        .premium-nav-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        .premium-nav-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.5); }
      `}} />

    </nav>
  );
}