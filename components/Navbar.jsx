'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function Navbar({ contentType, setContentType, filterType, setFilterType }) {
  const [isSearchInputVisible, setIsSearchInputVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
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
    setIsMobileMenuOpen(false);
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
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
        const res = await fetch(
          `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        
        const queryLower = searchQuery.trim().toLowerCase();
        
        const validResults = (data.results || [])
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
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
  }, [searchQuery]);

  const handleSearchAction = () => {
    if (!isSearchInputVisible) {
      setIsSearchInputVisible(true);
      setIsMobileMenuOpen(false);
    } else {
      setIsSearchInputVisible(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      redirectToItem(suggestions[0]);
    }
  };

  const redirectToItem = (item) => {
    const isTvShow = item.media_type === 'tv' || (!item.media_type && !!item.first_air_date);
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
    // Note: removed `justify-between` from the main nav tag to manage alignment via the 3 child divs
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 md:px-12 py-4 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
      
      {/* 1. Zone Gauche: Logo (flex-1 pushes the center to the middle) */}
      <div className="flex flex-1 items-center justify-start">
        <button 
          onClick={() => handleNavigation('all', 'default')} 
          className={`text-3xl md:text-4xl font-black tracking-wide cursor-pointer focus:outline-none transition-all duration-300 ease-in-out ${
            isSearchInputVisible ? 'opacity-0 w-0 overflow-hidden pointer-events-none sm:opacity-100 sm:w-auto sm:pointer-events-auto' : 'opacity-100 w-auto'
          }`}
        >
          <span className="text-red-600">z</span>
          <span className="text-white">Show</span>
        </button>
      </div>

      {/* 2. Zone Centrale: Liens Desktop (centered naturally) */}
      <div className="hidden md:flex items-center justify-center gap-6 md:gap-8 text-sm tracking-wide uppercase shrink-0 mt-1">
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

      {/* 3. Zone Droite: Actions (flex-1 pushes against the center to keep it balanced) */}
      <div className="flex flex-1 items-center justify-end gap-4 sm:gap-5 md:gap-6 text-white text-lg md:text-xl">
        
        {/* Module de recherche */}
        <div 
          ref={dropdownRef} 
          className={`relative flex items-center transition-all duration-300 ease-in-out ${
            isSearchInputVisible 
              ? 'bg-black/60 px-4 py-1.5 rounded-full border border-white/10 shadow-inner w-full sm:w-60 md:w-72' 
              : 'w-10 h-10 bg-transparent px-0 py-0 border-transparent justify-center'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Titles, genres..."
            className={`bg-transparent outline-none text-white text-sm transition-all duration-300 ease-in-out placeholder:text-gray-500
              ${isSearchInputVisible ? 'w-full opacity-100 pr-2' : 'w-0 opacity-0 pointer-events-none'}`}
          />
          
          <button 
            onClick={handleSearchAction}
            className="transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none flex items-center justify-center text-white shrink-0"
            aria-label="Search Toggle"
          >
            <i className={`fa-solid ${isSearchInputVisible ? 'fa-xmark' : 'fa-magnifying-glass'}`}></i>
          </button>

          {/* Dropdown flottant des suggestions */}
          {isSearchInputVisible && suggestions.length > 0 && (
            <div className="absolute top-full right-0 sm:left-0 mt-3 w-64 sm:w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 transform origin-top transition-all duration-200">
              <div className="p-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                Suggestions Match
              </div>
              <div className="flex flex-col max-h-[300px] sm:max-h-[380px] overflow-y-auto premium-nav-scrollbar">
                {suggestions.map((item) => {
                  const isTvShow = item.media_type === 'tv' || (!item.media_type && !!item.first_air_date);
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
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="text-amber-400 flex items-center gap-0.5 font-medium">
                            <i className="fa-solid fa-star text-[10px]"></i>
                            {item.vote_average?.toFixed(1) || '0.0'}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="capitalize text-[10px] sm:text-[11px] px-1.5 py-0.5 bg-zinc-800 rounded border border-white/5 text-gray-300 w-max">
                            {isTvShow ? 'TV' : 'Movie'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Menu burger */}
        <div 
          ref={mobileMenuRef} 
          className={`relative transition-all duration-300 ease-in-out ${
            isSearchInputVisible ? 'opacity-0 w-0 overflow-hidden pointer-events-none sm:block md:hidden' : 'block md:hidden'
          }`}
        >
          <button 
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsSearchInputVisible(false);
            }}
            className="transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none flex items-center justify-center text-white text-xl p-1"
            aria-label="Toggle Mobile Menu"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>

          {/* Liste déroulante du menu mobile */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-full mt-4 w-48 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 py-1 flex flex-col text-xs sm:text-sm uppercase tracking-wider font-semibold animate-[fadeIn_0.2s_ease-out]">
              <button 
                onClick={() => handleNavigation('all', 'default')} 
                className={`px-4 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.06] hover:text-red-600 ${
                  isHomeActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-3 bg-white/[0.02]' : 'text-gray-300'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('movie', 'default')} 
                className={`px-4 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.06] hover:text-red-600 ${
                  isMoviesActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-3 bg-white/[0.02]' : 'text-gray-300'
                }`}
              >
                Movies
              </button>
              <button 
                onClick={() => handleNavigation('tv', 'default')} 
                className={`px-4 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.06] hover:text-red-600 ${
                  isTvActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-3 bg-white/[0.02]' : 'text-gray-300'
                }`}
              >
                TV
              </button>
              <button 
                onClick={() => handleNavigation(contentType, 'top_rated')} 
                className={`px-4 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.06] hover:text-red-600 ${
                  isTopRatedActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-3 bg-white/[0.02]' : 'text-gray-300'
                }`}
              >
                Top Rated
              </button>
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .premium-nav-scrollbar::-webkit-scrollbar { width: 6px; }
        .premium-nav-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
        .premium-nav-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        .premium-nav-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.5); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

    </nav>
  );
}