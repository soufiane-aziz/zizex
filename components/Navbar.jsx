'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createSlug } from '../lib/slug';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function Navbar({ locale }) {
  const [isSearchInputVisible, setIsSearchInputVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive active state from URL
  const urlType = searchParams.get('type') || 'all';
  const urlFilter = searchParams.get('filter') || 'default';

  // Detect locale from pathname if not passed as prop
  const resolvedLocale = locale || pathname.split('/')[1] || 'en';
  const homeBase = `/${resolvedLocale}`;

  // Check if we're on the home page (has no sub-paths after locale)
  const pathParts = pathname.split('/').filter(Boolean);
  const isOnHomePage = pathParts.length === 1; // e.g. /en

  // On home page: persist current filter to localStorage
  // On watch pages: read from localStorage to keep highlight
  const [activeType, setActiveType] = useState('all');
  const [activeFilter, setActiveFilter] = useState('default');

  useEffect(() => {
    if (isOnHomePage) {
      // Save the current state whenever we're on the home page
      localStorage.setItem('zshow_nav_type', urlType);
      localStorage.setItem('zshow_nav_filter', urlFilter);
      setActiveType(urlType);
      setActiveFilter(urlFilter);
    } else {
      // On watch pages, restore the last known home filter
      const savedType = localStorage.getItem('zshow_nav_type') || 'all';
      const savedFilter = localStorage.getItem('zshow_nav_filter') || 'default';
      setActiveType(savedType);
      setActiveFilter(savedFilter);
    }
  }, [isOnHomePage, urlType, urlFilter]);

  // Always navigate via URL (works for both home and watch pages)
  const handleNavigation = (type, filter) => {
    let url = homeBase;
    const params = [];
    if (type !== 'all') params.push(`type=${type}`);
    if (filter !== 'default') params.push(`filter=${filter}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    router.push(url);

    setSearchQuery('');
    setSuggestions([]);
    setIsSearchInputVisible(false);
    setIsMobileMenuOpen(false);
  };

  // Focus automatique sur le champ de saisie à l'ouverture
  useEffect(() => {
    if (isSearchInputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchInputVisible]);

  // Clic à l'extérieur pour fermer les éléments ouverts
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
        if (searchQuery.trim() === '') setIsSearchInputVisible(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  // Récupération des suggestions de recherche TMDB
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
        console.error("Erreur suggestions:", err);
      }
    };

    const delayDebounceFn = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Gestion de l'état de la recherche (Loupe / Fermer)
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
    const slug = createSlug(item.title || item.name, item.id, isTvShow ? 'tv' : 'movie');
    const dynamicHref = isTvShow
      ? `/${resolvedLocale}/tv/${slug}/season-1/episode-1`
      : `/${resolvedLocale}/movie/${slug}`;

    setSuggestions([]);
    setSearchQuery('');
    setIsSearchInputVisible(false);
    router.push(dynamicHref);
  };

  const isHomeActive = activeType === 'all' && activeFilter === 'default';
  const isMoviesActive = activeType === 'movie' && activeFilter === 'default';
  const isTvActive = activeType === 'tv' && activeFilter === 'default';
  const isTopRatedActive = activeFilter === 'top_rated';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-md">

      {/* 1. ZONE GAUCHE : LOGO */}
      <div
        className={`flex items-center justify-start transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap
        ${isSearchInputVisible ? 'w-0 opacity-0 overflow-hidden sm:flex-1 sm:opacity-100 sm:pointer-events-auto' : 'flex-1'}`}
      >
        <button
          onClick={() => handleNavigation('all', 'default')}
          className="text-3xl md:text-4xl font-black tracking-wide cursor-pointer focus:outline-none"
        >
          <span className="text-red-600">z</span>
          <span className="text-white">Show</span>
        </button>
      </div>

      {/* 2. ZONE CENTRALE : MENU PC & TABLETTE (PARFAITEMENT CENTRÉ) */}
      <div className="hidden sm:flex flex-1 items-center justify-center gap-6 md:gap-8 lg:gap-10 text-xs md:text-sm tracking-wide uppercase shrink-0 mx-4">
        <button onClick={() => handleNavigation('all', 'default')} className={`transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none ${isHomeActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'}`}>
          Home
        </button>
        <button onClick={() => handleNavigation('movie', 'default')} className={`transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none ${isMoviesActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'}`}>
          Movies
        </button>
        <button onClick={() => handleNavigation('tv', 'default')} className={`transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none ${isTvActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'}`}>
          TV
        </button>
        {/* Modifié ici pour envoyer 'all' (Films + Séries combinés) */}
        <button onClick={() => handleNavigation('all', 'top_rated')} className={`transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none ${isTopRatedActive ? 'text-red-600 font-extrabold' : 'text-gray-300 font-medium'}`}>
          Top Rated
        </button>
      </div>

      {/* 3. ZONE DROITE : RECHERCHE & BURGER MOBILE */}
      <div className={`flex items-center justify-end gap-0 sm:gap-3 transition-all duration-300 ease-in-out ${isSearchInputVisible ? 'w-full flex-1' : 'flex-1'}`}>

        {/* Module Barre de recherche */}
        <div
          ref={dropdownRef}
          className={`relative flex items-center transition-all duration-300 ease-in-out ${isSearchInputVisible
            ? 'bg-black/80 px-4 py-1.5 rounded-full border border-white/10 shadow-inner w-full sm:w-60 md:w-72 lg:w-80'
            : 'w-10 h-10 bg-transparent justify-center border-transparent'
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

          {/* Liste des Suggestions */}
          {isSearchInputVisible && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-0 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-b-xl shadow-2xl overflow-hidden z-50 transform origin-top transition-all duration-200">
              <div className="p-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                Suggestions Match
              </div>
              <div className="flex flex-col max-h-[50vh] overflow-y-auto premium-nav-scrollbar">
                {suggestions.map((item) => {
                  const isTvShow = item.media_type === 'tv' || (!item.media_type && !!item.first_air_date);
                  const dynamicHref = isTvShow
                    ? `/${resolvedLocale}/tv/${item.id}/season-1/episode-1`
                    : `/${resolvedLocale}/movie/${item.id}`;

                  return (
                    <Link
                      key={item.id}
                      href={dynamicHref}
                      onClick={() => { setSuggestions([]); setSearchQuery(''); setIsSearchInputVisible(false); }}
                      className="flex items-center gap-3 p-3 transition-all hover:bg-white/[0.08] border-b border-white/5 group/item"
                    >
                      <Image
                        src={`${IMAGE_BASE_URL}/w92${item.poster_path || item.backdrop_path}`}
                        alt={item.title || item.name || "Poster"}
                        width={36}
                        height={52}
                        className="w-9 h-13 object-cover rounded shadow-md bg-zinc-900 flex-shrink-0"
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

        {/* Menu Burger (Mobile) */}
        <div
          ref={mobileMenuRef}
          className={`relative flex items-center justify-center transition-all duration-300 ease-in-out sm:hidden ${isSearchInputVisible
            ? 'w-0 opacity-0 overflow-hidden pointer-events-none'
            : 'w-10 h-10 opacity-100 overflow-visible'
            }`}
        >
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsSearchInputVisible(false);
            }}
            className="transition-colors duration-300 hover:text-red-600 cursor-pointer focus:outline-none flex items-center justify-center text-white text-xl p-1 whitespace-nowrap"
            aria-label="Toggle Mobile Menu"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>

          {/* Dropdown Menu Mobile Déroulant */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-full mt-4 w-48 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1.5 flex flex-col text-sm uppercase tracking-wider font-semibold animate-[fadeIn_0.2s_ease-out]">
              <button onClick={() => handleNavigation('all', 'default')} className={`px-5 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.08] hover:text-red-600 ${isHomeActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-4 bg-white/[0.03]' : 'text-gray-300'}`}>
                Home
              </button>
              <button onClick={() => handleNavigation('movie', 'default')} className={`px-5 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.08] hover:text-red-600 ${isMoviesActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-4 bg-white/[0.03]' : 'text-gray-300'}`}>
                Movies
              </button>
              <button onClick={() => handleNavigation('tv', 'default')} className={`px-5 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.08] hover:text-red-600 ${isTvActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-4 bg-white/[0.03]' : 'text-gray-300'}`}>
                TV
              </button>
              {/* Modifié également ici sur mobile pour envoyer 'all' */}
              <button onClick={() => handleNavigation('all', 'top_rated')} className={`px-5 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.08] hover:text-red-600 ${isTopRatedActive ? 'text-red-600 font-extrabold border-l-2 border-red-600 pl-4 bg-white/[0.03]' : 'text-gray-300'}`}>
                Top Rated
              </button>
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .premium-nav-scrollbar::-webkit-scrollbar { width: 5px; }
        .premium-nav-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .premium-nav-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .premium-nav-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.8); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

    </nav>
  );
}