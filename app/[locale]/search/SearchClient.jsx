'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import AdBanner from '../../../components/AdBanner';
import { createSlug } from '../../../lib/slug';

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function SearchClient({ initialQuery, locale }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, movie, tv

  const isAr = locale === 'ar';
  const isFr = locale === 'fr';

  // Search logic
  const performSearch = async (searchQuery, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tmdb?endpoint=/search/multi&query=${encodeURIComponent(searchQuery)}&page=${pageNum}`);
      if (res.ok) {
        const data = await res.json();
        const validItems = (data.results || []).filter(
          item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path)
        );
        if (pageNum === 1) {
          setResults(validItems);
        } else {
          setResults(prev => [...prev, ...validItems]);
        }
        setTotalPages(Math.min(data.total_pages || 1, 20));
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setPage(1);
      performSearch(initialQuery, 1);
    }
  }, [initialQuery]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      performSearch(query, nextPage);
    }
  };

  const filteredResults = results.filter(item => {
    if (filterType === 'movie') return item.media_type === 'movie';
    if (filterType === 'tv') return item.media_type === 'tv';
    return true;
  });

  const headingText = isAr ? 'نتائج البحث عن' : isFr ? 'Résultats de recherche pour' : 'Search results for';
  const searchPlaceholder = isAr ? 'ابحث عن فيلم أو مسلسل...' : isFr ? 'Rechercher un film ou une série...' : 'Search for movies, TV shows...';
  const allText = isAr ? 'الكل' : isFr ? 'Tous' : 'All';
  const moviesText = isAr ? 'أفلام' : isFr ? 'Films' : 'Movies';
  const tvText = isAr ? 'مسلسلات' : isFr ? 'Séries' : 'TV Shows';
  const noResultsText = isAr ? 'لم نتمكن من العثور على أي نتائج.' : isFr ? 'Aucun résultat trouvé.' : 'No results found.';
  const loadMoreText = isAr ? 'عرض المزيد' : isFr ? 'Afficher plus' : 'Load More';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar contentType="search" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 pb-16 w-full">
        {/* Search header & input */}
        <div className="mb-8 max-w-3xl mx-auto text-center">
          <form onSubmit={handleFormSubmit} className="relative flex items-center mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#121214] border border-white/10 rounded-full px-5 py-3.5 pl-12 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
            <button
              type="submit"
              className="absolute left-4 text-gray-400 hover:text-amber-500 transition-colors"
              aria-label="Submit Search"
            >
              <i className="fa-solid fa-magnifying-glass text-base"></i>
            </button>
          </form>

          {/* Filter tabs */}
          {results.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterType === 'all'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                  }`}
              >
                {allText}
              </button>
              <button
                onClick={() => setFilterType('movie')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterType === 'movie'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                  }`}
              >
                {moviesText}
              </button>
              <button
                onClick={() => setFilterType('tv')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterType === 'tv'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                  }`}
              >
                {tvText}
              </button>
            </div>
          )}
        </div>

        {/* Results title */}
        {initialQuery && (
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
            <h1 className="text-lg sm:text-xl font-black text-gray-200">
              {headingText} <span className="text-amber-400 font-bold">&ldquo;{initialQuery}&rdquo;</span>
            </h1>
            <span className="text-xs font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded">
              {filteredResults.length} {isAr ? 'عنصر' : 'items'}
            </span>
          </div>
        )}

        {/* Results Grid */}
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {filteredResults.map((item, index) => {
              const isTv = item.media_type === 'tv' || (!item.media_type && !!item.first_air_date);
              const slug = createSlug(item.title || item.name, item.id, isTv ? 'tv' : 'movie');
              const targetUrl = isTv
                ? `/${locale}/tv/${slug}/season-1/episode-1`
                : `/${locale}/movie/${slug}`;

              return (
                <div key={`${item.id}-${index}`} className="group relative">
                  <Link href={targetUrl} prefetch={false}>
                    <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#141418] border border-transparent hover:border-amber-500/60 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_10px_25px_rgba(245,158,11,0.2)]">
                      <Image
                        src={
                          item.poster_path
                            ? `${IMAGE_BASE_URL}/w342${item.poster_path}`
                            : item.backdrop_path
                              ? `${IMAGE_BASE_URL}/w300${item.backdrop_path}`
                              : '/no-poster.png'
                        }
                        alt={item.title || item.name || 'Poster'}
                        width={342}
                        height={513}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading={index < 8 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end z-10">
                        <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 mb-1">
                          {item.title || item.name}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-gray-300">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <i className="fa-solid fa-star text-[9px]"></i>
                            {item.vote_average ? item.vote_average.toFixed(1) : '—'}
                          </span>
                          <span className="uppercase tracking-wider font-extrabold bg-white/10 px-1.5 py-0.5 rounded text-gray-200">
                            {isTv ? 'TV' : 'Movie'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : !isLoading && initialQuery ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-400">
              <i className="fa-solid fa-film text-2xl"></i>
            </div>
            <p className="text-base text-gray-300 font-semibold mb-2">{noResultsText}</p>
            <p className="text-xs text-gray-500 max-w-sm">
              {isAr
                ? 'جرب البحث بكلمات مختلفة أو تحقق من صحة الحروف.'
                : isFr
                  ? 'Essayez des mots-clés différents ou vérifiez l\'orthographe.'
                  : 'Try different keywords or check for spelling errors.'}
            </p>
          </div>
        ) : null}

        {/* Load more button */}
        {page < totalPages && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : loadMoreText}
            </button>
          </div>
        )}

        {/* Ad slot */}
        <div className="mt-16 flex justify-center">
          <AdBanner type="banner300" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

