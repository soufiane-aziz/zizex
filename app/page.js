"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// --- 1. Reusable Scroll Animation Component ---
function RevealOnScroll({ children, delay = 0, disable = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (disable) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [disable]);

  if (disable) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
      }`}
    >
      {children}
    </div>
  );
}

// --- 2. Dynamic Category Row Component ---
function CategoryRow({ title, movies, loadMore, isExpanded, onExpandToggle }) {
  const rowRef = useRef(null);
  const expandedSentinelRef = useRef(null);
  
  const [localMovies, setLocalMovies] = useState(movies);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  useEffect(() => {
    setLocalMovies(movies);
    setPage(1);
    setHasMore(true);
    setIsFetching(false);
    if (rowRef.current) {
      rowRef.current.scrollLeft = 0;
    }
  }, [movies]);

  const fetchNextPage = async () => {
    if (isFetching || !hasMore || !loadMore) return;
    setIsFetching(true);
    try {
      const nextPage = page + 1;
      const freshItems = await loadMore(nextPage);
      
      if (freshItems && freshItems.length > 0) {
        setLocalMovies((prev) => {
          const currentIds = new Set(prev.map((m) => m.id));
          const filteredDuplicates = freshItems.filter((m) => !currentIds.has(m.id));
          return [...prev, ...filteredDuplicates];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed fetching next sequential data block:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!isExpanded || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (expandedSentinelRef.current) {
      observer.observe(expandedSentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isExpanded, page, hasMore, isFetching]);

  const handleScrollState = async () => {
    const row = rowRef.current;
    if (!row) return;

    setShowLeftArrow(row.scrollLeft > 10);

    const { scrollLeft, clientWidth, scrollWidth } = row;
    if (scrollLeft + clientWidth >= scrollWidth - 800) {
      await fetchNextPage();
    }
  };

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'right' ? scrollLeft + clientWidth - 100 : Math.max(0, scrollLeft - clientWidth + 100);
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!localMovies || localMovies.length === 0) return null;

  const renderMovieCard = (movie, index) => {
    const isTv = movie.media_type === 'tv' || movie.first_air_date || movie.name;
    const mediaRoute = isTv ? 'tv' : 'movie';

    return (
      <div key={`${movie.media_type || 'item'}-${movie.id}-${index}`} className="snap-center w-full">
        <Link href={`/watch/${mediaRoute}/${movie.id}`}>
          <div className="relative rounded-lg overflow-hidden aspect-[2/3] transform transition-all duration-300 ease-out hover:-translate-y-1 sm:hover:-translate-y-2.5 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] sm:hover:shadow-[0_15px_30px_rgba(245,158,11,0.25)] group/card cursor-pointer border border-transparent hover:border-amber-500/60 bg-[#121212]">
            
            <img 
              src={movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : "https://placehold.co/400x600/000000/ffffff?text=No+Image"} 
              alt={movie.title || movie.name} 
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-amber-600/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            <div className="absolute inset-0 p-3 flex flex-col justify-start pointer-events-none">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-500 backdrop-blur-md rounded-full flex items-center justify-center mb-auto self-end opacity-0 group-hover/card:opacity-100 transform scale-75 group-hover/card:scale-100 transition-all duration-300 shadow-xl">
                 <i className="fa-solid fa-play text-black ml-0.5 text-[10px] sm:text-xs"></i>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 flex flex-col justify-end z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <h4 className="font-bold text-white text-[11px] sm:text-sm md:text-base line-clamp-1 drop-shadow-md leading-tight mb-1 sm:mb-2">
                {movie.title || movie.name}
              </h4>
              <div className="flex justify-between items-center text-[9px] sm:text-[11px] md:text-xs font-semibold text-gray-300">
                <span className="flex items-center gap-1 text-amber-400 drop-shadow">
                  <i className="fa-solid fa-star text-[8px] sm:text-[10px] md:text-xs"></i> 
                  {movie.vote_average?.toFixed(1)}
                </span>
                <span className="uppercase tracking-wide bg-white/20 px-1.5 py-0.5 rounded text-white/90">
                  {isTv ? 'TV' : 'Movie'}
                </span>
              </div>
            </div>

          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className={`w-full relative z-10 ${isExpanded ? 'min-h-screen' : 'mb-10 sm:mb-14'}`}>
      
      {/* ROW HEADER BLOCK */}
      <div className={`flex justify-between items-center transition-all duration-300 ${
        isExpanded 
          ? 'fixed top-0 left-0 right-0 w-full bg-[#050505]/95 backdrop-blur-md py-4 sm:py-5 px-4 sm:px-8 border-b border-white/10 z-[100] shadow-2xl' 
          : 'mb-4 sm:mb-6 relative z-20 px-2 sm:px-0'
      }`}>
        <h3 className={`font-black flex items-center gap-2 sm:gap-4 tracking-wider uppercase text-gray-100 transition-all duration-300 ${
          isExpanded ? 'text-lg sm:text-3xl' : 'text-xl sm:text-2xl'
        }`}>
          <span className="w-1 sm:w-1.5 h-4 sm:h-6 rounded-sm bg-amber-500"></span>
          {title}
        </h3>
        
        <button 
          onClick={() => onExpandToggle(!isExpanded)}
          className={`group/btn flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-black tracking-wide uppercase transition-all duration-200 cursor-pointer ${
            isExpanded 
              ? 'px-3 sm:px-5 py-2 sm:py-2.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black shadow-md' 
              : 'text-amber-500 hover:text-amber-400'
          }`}
        >
          <span>{isExpanded ? 'Close' : 'View All'}</span>
          <i className={`text-[11px] sm:text-xs transform transition-transform duration-200 ${
            isExpanded 
              ? 'fa-solid fa-xmark text-sm group-hover/btn:rotate-90' 
              : 'fa-solid fa-chevron-right group-hover/btn:translate-x-1.5'
          }`}></i>
        </button>
      </div>
      
      {!isExpanded ? (
        <div className="group relative z-10">
          <button 
            onClick={() => scroll('left')} 
            className={`absolute left-1 sm:left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/85 border border-white/10 text-white flex items-center justify-center transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md cursor-pointer ${
              showLeftArrow ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <i className="fa-solid fa-chevron-left text-xs sm:text-sm md:text-base"></i>
          </button>

          <div 
            ref={rowRef} 
            onScroll={handleScrollState}
            className="flex overflow-x-auto gap-2.5 sm:gap-3.5 md:gap-5 pb-6 sm:pb-8 pt-2 sm:pt-4 hide-scroll-bar snap-x snap-mandatory px-2 sm:px-0 scroll-smooth"
          >
            {localMovies.map((movie, index) => (
              <div key={movie.id} className="min-w-[115px] sm:min-w-[145px] md:min-w-[210px] lg:min-w-[240px]">
                {renderMovieCard(movie, index)}
              </div>
            ))}
            
            {isFetching && (
              <div className="min-w-[115px] sm:min-w-[145px] md:min-w-[210px] lg:min-w-[240px] flex items-center justify-center aspect-[2/3]">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <button 
            onClick={() => scroll('right')} 
            className="absolute right-1 sm:right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/85 border border-white/10 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md cursor-pointer"
          >
            <i className="fa-solid fa-chevron-right text-xs sm:text-sm md:text-base"></i>
          </button>
        </div>
      ) : (
        <div className="w-full pb-24 pt-20 sm:pt-28 animate-[fadeIn_0.25s_ease-out] relative z-10">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 md:gap-5 px-2 sm:px-4">
            {localMovies.map((movie, index) => renderMovieCard(movie, index))}
          </div>

          <div ref={expandedSentinelRef} className="w-full h-40 flex items-center justify-center mt-12">
            {hasMore ? (
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <p className="text-xs sm:text-sm font-bold tracking-widest text-gray-500 uppercase bg-white/5 px-6 py-2.5 rounded-full border border-white/5 shadow-inner">
                You've reached the end of the collection
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 3. PRODUCTION BALANCED AD COMPONENT ---
const AdComponent = ({ adKey, width, height, wrapperClassName }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = `${width}`;
    iframe.height = `${height}`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.background = 'transparent';
    iframe.scrolling = 'no';

    containerRef.current.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }</style>
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
      `);
      iframeDoc.close();
    }
  }, [adKey, width, height]);

  return (
    <div className={`w-full flex justify-center items-center overflow-hidden ${wrapperClassName}`}>
      <div 
        ref={containerRef} 
        style={{ width: '100%', maxWidth: `${width}px`, minHeight: `${height}px` }} 
        className="clear-both flex justify-center items-center overflow-x-auto overflow-y-hidden origin-center transform scale-[0.85] sm:scale-95 md:scale-100" 
      />
    </div>
  );
};

// --- 4. Main Master Content Component ---
function HomeContent() {
  const [heroMovies, setHeroMovies] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const [contentType, setContentType] = useState('all'); 
  const [filterType, setFilterType] = useState('default'); 

  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const filterParam = searchParams.get('filter');

  useEffect(() => {
    setContentType(typeParam || 'all');
    setFilterType(filterParam || 'default');
    setExpandedCategoryId(null); 
  }, [typeParam, filterParam]);

  useEffect(() => {
    let isCurrent = true; 

    // UNIFIED GENRE MAP: Now split into separate rows!
    const UNIFIED_GENRES = [
      { name: "Action", movieIds: "28", tvId: "10759" },
      { name: "Adventure", movieIds: "12", tvId: "10759" },
      { name: "Animation", movieIds: "16", tvId: "16" },
      { name: "Comedy", movieIds: "35", tvId: "35" },
      { name: "Crime", movieIds: "80", tvId: "80" },
      { name: "Documentary", movieIds: "99", tvId: "99" },
      { name: "Drama", movieIds: "18", tvId: "18" },
      { name: "Family", movieIds: "10751", tvId: "10751" },
      { name: "Fantasy", movieIds: "14", tvId: "10765" },
      { name: "Mystery", movieIds: "9648", tvId: "9648" },
      { name: "Science Fiction", movieIds: "878", tvId: "10765" }
    ];

    const fetchEverythingDynamic = async () => {
      setIsLoading(true);
      try {
        let primaryDataResults = [];
        let primaryLoadMore = null;

        // --- 1. ENFORCE 50/50 SPLIT FOR THE MAIN/HERO ROW ---
        if (contentType === 'all') {
          const [movieRes, tvRes] = await Promise.all([
            fetch(filterType === 'top_rated' ? `${BASE_URL}/movie/top_rated?api_key=${API_KEY}` : `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`),
            fetch(filterType === 'top_rated' ? `${BASE_URL}/tv/top_rated?api_key=${API_KEY}` : `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`)
          ]);
          
          const mData = await movieRes.json();
          const tData = await tvRes.json();
          
          const mResults = mData.results?.map(m => ({...m, media_type: 'movie'})) || [];
          const tResults = tData.results?.map(t => ({...t, media_type: 'tv'})) || [];
          
          const maxLen = Math.max(mResults.length, tResults.length);
          for (let i = 0; i < maxLen; i++) {
            if (mResults[i]) primaryDataResults.push(mResults[i]);
            if (tResults[i]) primaryDataResults.push(tResults[i]);
          }

          primaryLoadMore = async (nextPage) => {
            const [mPageRes, tPageRes] = await Promise.all([
              fetch(filterType === 'top_rated' ? `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${nextPage}` : `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${nextPage}`),
              fetch(filterType === 'top_rated' ? `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${nextPage}` : `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${nextPage}`)
            ]);
            const mPageData = await mPageRes.json();
            const tPageData = await tPageRes.json();
            
            const mPageResults = mPageData.results?.map(m => ({...m, media_type: 'movie'})) || [];
            const tPageResults = tPageData.results?.map(t => ({...t, media_type: 'tv'})) || [];
            
            const blendedPage = [];
            const pageMaxLen = Math.max(mPageResults.length, tPageResults.length);
            for (let i = 0; i < pageMaxLen; i++) {
              if (mPageResults[i]) blendedPage.push(mPageResults[i]);
              if (tPageResults[i]) blendedPage.push(tPageResults[i]);
            }
            return blendedPage;
          };
        } else {
          // Movie or TV only filter
          const url = filterType === 'top_rated' 
            ? `${BASE_URL}/${contentType}/top_rated?api_key=${API_KEY}` 
            : `${BASE_URL}/trending/${contentType}/week?api_key=${API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          primaryDataResults = data.results?.map(item => ({ ...item, media_type: contentType })) || [];
          
          primaryLoadMore = async (nextPage) => {
            const pUrl = filterType === 'top_rated' 
              ? `${BASE_URL}/${contentType}/top_rated?api_key=${API_KEY}&page=${nextPage}` 
              : `${BASE_URL}/trending/${contentType}/week?api_key=${API_KEY}&page=${nextPage}`;
            const pRes = await fetch(pUrl);
            const pData = await pRes.json();
            return pData.results?.map(item => ({ ...item, media_type: contentType })) || [];
          };
        }
        
        if (!isCurrent) return;

        const heroSelection = primaryDataResults.slice(0, 10) || [];
        const primaryRowData = primaryDataResults.slice(10) || [];
        const masterRows = [];

        if (primaryRowData.length > 0) {
          let rowTitle = filterType === 'top_rated' ? "Top Rated Hits" : "Trending Now";
          if (contentType !== 'all') {
             rowTitle = filterType === 'top_rated' 
               ? (contentType === 'movie' ? "Top Rated Movies" : "Top Rated TV")
               : (contentType === 'movie' ? "Trending Movies" : "Trending TV");
          }
          masterRows.push({
            id: 'primary-dynamic-row',
            name: rowTitle,
            movies: primaryRowData,
            loadMore: primaryLoadMore
          });
        }

        // --- 2. ENFORCE 50/50 SPLIT FOR ALL GENRE ROWS ---
        if (contentType === 'all') {
          // Use the mapped UNIFIED_GENRES to ensure movies and TV match perfectly in every row
          const blendedGenresResult = await Promise.all(
            UNIFIED_GENRES.map(async (genre) => {
              try {
                let movieItems = [];
                let tvItems = [];

                // Fetch Movie half
                let mUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre.movieIds}`;
                if (filterType === 'top_rated') mUrl += `&sort_by=vote_average.desc&vote_count.gte=200`;
                const mRes = await fetch(mUrl);
                const mData = await mRes.json();
                movieItems = mData.results?.map(item => ({ ...item, media_type: 'movie' })) || [];

                // Fetch TV half
                let tUrl = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genre.tvId}`;
                if (filterType === 'top_rated') tUrl += `&sort_by=vote_average.desc&vote_count.gte=200`;
                const tRes = await fetch(tUrl);
                const tData = await tRes.json();
                tvItems = tData.results?.map(item => ({ ...item, media_type: 'tv' })) || [];

                // Interleave exactly 1 for 1
                const blendedList = [];
                const maxLen = Math.max(movieItems.length, tvItems.length);
                for (let i = 0; i < maxLen; i++) {
                  if (movieItems[i]) blendedList.push(movieItems[i]);
                  if (tvItems[i]) blendedList.push(tvItems[i]);
                }

                return {
                  id: `blended-${genre.name.toLowerCase().replace(/\s+/g, '-')}`,
                  name: filterType === 'top_rated' ? `Top Rated ${genre.name}` : genre.name,
                  movies: blendedList,
                  loadMore: async (nextPage) => {
                    let pageMItems = [];
                    let pageTItems = [];
                    
                    let pmUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre.movieIds}&page=${nextPage}`;
                    if (filterType === 'top_rated') pmUrl += `&sort_by=vote_average.desc&vote_count.gte=200`;
                    const pmRes = await fetch(pmUrl);
                    const pmData = await pmRes.json();
                    pageMItems = pmData.results?.map(item => ({ ...item, media_type: 'movie' })) || [];
                    
                    let ptUrl = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genre.tvId}&page=${nextPage}`;
                    if (filterType === 'top_rated') ptUrl += `&sort_by=vote_average.desc&vote_count.gte=200`;
                    const ptRes = await fetch(ptUrl);
                    const ptData = await ptRes.json();
                    pageTItems = ptData.results?.map(item => ({ ...item, media_type: 'tv' })) || [];
                    
                    const bList = [];
                    const maxL = Math.max(pageMItems.length, pageTItems.length);
                    for (let i = 0; i < maxL; i++) {
                      if (pageMItems[i]) bList.push(pageMItems[i]);
                      if (pageTItems[i]) bList.push(pageTItems[i]);
                    }
                    return bList;
                  }
                };
              } catch (err) {
                return { id: `blended-${genre.name}`, name: genre.name, movies: [], loadMore: null };
              }
            })
          );

          blendedGenresResult.forEach((genreRow) => {
            if (genreRow.movies.length > 0) {
              masterRows.push(genreRow);
            }
          });

        } else {
          // Standard fetching if the user explicitly clicked "Movies" or "TV" in the Nav
          const genreListRes = await fetch(`${BASE_URL}/genre/${contentType}/list?api_key=${API_KEY}`);
          const genreListData = await genreListRes.json();
          
          if (!isCurrent) return;

          const dynamicGenresResult = await Promise.all(
            (genreListData.genres || []).map(async (genre) => {
              try {
                let discoverUrl = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&with_genres=${genre.id}`;
                if (filterType === 'top_rated') discoverUrl += `&sort_by=vote_average.desc&vote_count.gte=350`;

                const res = await fetch(discoverUrl);
                const data = await res.json();
                return {
                  id: `${contentType}-${genre.id}`,
                  name: genre.name,
                  movies: data.results?.map(item => ({ ...item, media_type: contentType })) || [],
                  loadMore: async (nextPage) => {
                    let url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&with_genres=${genre.id}&page=${nextPage}`;
                    if (filterType === 'top_rated') url += `&sort_by=vote_average.desc&vote_count.gte=350`;
                    const r = await fetch(url);
                    const d = await r.json();
                    return d.results?.map(item => ({ ...item, media_type: contentType })) || [];
                  }
                };
              } catch (err) {
                return { id: `${contentType}-${genre.id}`, name: genre.name, movies: [], loadMore: null };
              }
            })
          );

          dynamicGenresResult.forEach((genreRow) => {
            if (genreRow.movies.length > 0) {
              masterRows.push({
                id: genreRow.id,
                name: filterType === 'top_rated' ? `Top Rated ${genreRow.name}` : genreRow.name,
                movies: genreRow.movies,
                loadMore: genreRow.loadMore
              });
            }
          });
        }

        setHeroMovies(heroSelection);
        setAllCategories(masterRows);
      } catch (error) {
        console.error("Critical dashboard population failure:", error);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    fetchEverythingDynamic();

    return () => {
      isCurrent = false; 
    };
  }, [contentType, filterType]); 

  useEffect(() => {
    if (heroMovies.length === 0) return;
    setActiveHeroIndex(0); 
  }, [heroMovies]);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 7000); 
    return () => clearInterval(interval);
  }, [heroMovies]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#050505]">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeHero = heroMovies[activeHeroIndex];
  const isHeroTv = activeHero?.media_type === 'tv' || activeHero?.first_air_date;
  const heroMediaRoute = isHeroTv ? 'tv' : 'movie';

  const categoriesToRender = expandedCategoryId 
    ? allCategories.filter(cat => cat.id === expandedCategoryId)
    : allCategories;

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden font-sans selection:bg-red-700 selection:text-white">
      
      {!expandedCategoryId && (
        <Navbar 
          contentType={contentType} 
          setContentType={setContentType} 
          filterType={filterType} 
          setFilterType={setFilterType} 
        />
      )}
      
      {heroMovies.length > 0 && !expandedCategoryId && (
        <section className="relative w-full h-[95vh] bg-black overflow-hidden group">
          {heroMovies.map((movie, index) => (
            <div 
              key={movie.id} 
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-transparent z-10"></div>
              
              <img 
                src={`${IMAGE_BASE_URL}/original${movie.backdrop_path}`} 
                alt={movie.title || movie.name} 
                className={`w-full h-full object-cover transform transition-transform duration-[10000ms] ease-out ${index === activeHeroIndex ? 'scale-110' : 'scale-100'} object-top sm:object-center`}
              />
            </div>
          ))}

          <div className="relative z-20 flex flex-col justify-end h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-24 w-full pb-14 sm:pb-16 pt-24">
            <div className="max-w-xs sm:max-w-lg md:max-w-2xl landscape:max-w-2xl text-left">
              <h1 
                key={`title-${activeHeroIndex}`}
                className="text-3xl sm:text-5xl md:text-7xl font-black mb-1.5 sm:mb-2 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight opacity-0 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] landscape:text-4xl landscape:sm:text-5xl"
              >
                {activeHero.title || activeHero.name}
              </h1>

              <div 
                key={`meta-${activeHeroIndex}`}
                className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-gray-200 mb-3.5 sm:mb-4 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards]"
              >
                <span className="flex items-center gap-1 sm:gap-1.5 text-amber-400 bg-black/60 px-2.5 py-1 rounded shadow-md sm:px-3 sm:py-1.5">
                  <i className="fa-solid fa-star"></i>
                  {activeHero.vote_average?.toFixed(1)} <span className="hidden sm:inline">Rating</span>
                </span>
                
                <span className="uppercase tracking-wider font-extrabold text-xs border border-white/30 px-2.5 py-1 rounded text-white bg-black/60 shadow-md">
                  {isHeroTv ? 'TV' : 'Movie'}
                </span>
              </div>

              <div className="opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]">
                <Link 
                  href={`/watch/${heroMediaRoute}/${activeHero.id}`} 
                  className="group relative inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-10 py-3 sm:py-4 bg-red-600 rounded-sm font-bold text-sm sm:text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 animate-pulse-glow text-white cursor-pointer shadow-xl"
                >
                  <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-laser-sheen"></div>
                  <i className="fa-solid fa-play text-white group-hover:scale-110 transition-transform relative z-10 text-xs sm:text-base"></i>
                  <span className="tracking-wide relative z-10 font-extrabold">Watch Now</span>
                </Link>
              </div>
            </div>
          </div>

          <button onClick={() => setActiveHeroIndex((p) => (p === 0 ? heroMovies.length - 1 : p - 1))} className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer">
            <i className="fa-solid fa-chevron-left text-sm sm:text-xl md:text-2xl"></i>
          </button>
          <button onClick={() => setActiveHeroIndex((p) => (p + 1) % heroMovies.length)} className="absolute right-2 sm:right-4 md:left-auto md:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer">
            <i className="fa-solid fa-chevron-right text-sm sm:text-xl md:text-2xl"></i>
          </button>

          <div className="absolute bottom-6 sm:bottom-10 md:bottom-10 left-0 right-0 sm:left-8 md:left-24 sm:right-auto z-30 flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 items-center max-w-full px-4">
            {heroMovies.map((_, index) => (
              <div key={index} className="relative flex items-center justify-center">
                {index === activeHeroIndex && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                )}
                <button
                  onClick={() => setActiveHeroIndex(index)}
                  className={`relative z-10 transition-all duration-500 rounded-full cursor-pointer ${
                    index === activeHeroIndex ? 'w-5 h-1.5 sm:w-7 sm:h-2 bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]' : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {!expandedCategoryId && (
        <>
          <AdComponent adKey="505a6081e767b51fdf7cd7a743de887b" width={728} height={90} wrapperClassName="mt-6 sm:mt-12 mb-2 px-2 sm:px-4 hidden sm:flex" />
          <AdComponent adKey="505a6081e767b51fdf7cd7a743de887b" width={320} height={50} wrapperClassName="mt-6 mb-2 px-2 flex sm:hidden" />
        </>
      )}

      <main className={`w-full max-w-[1600px] mx-auto relative z-20 ${
        expandedCategoryId 
          ? 'px-0 pt-0 pb-8' 
          : 'px-2 sm:px-4 md:px-12 lg:px-16 py-4 sm:py-8 flex flex-col gap-2 sm:gap-4'
      }`}>
        {categoriesToRender.map((category, index) => (
          <div key={category.id} id={`row-${category.id}`}>
            <RevealOnScroll 
              delay={expandedCategoryId ? 0 : Math.min(index * 50, 300)}
              disable={expandedCategoryId === category.id}
            >
              <CategoryRow 
                title={category.name} 
                movies={category.movies} 
                loadMore={category.loadMore}
                isExpanded={expandedCategoryId === category.id}
                onExpandToggle={(expanded) => {
                  if (expanded) {
                    setExpandedCategoryId(category.id);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  } else {
                    setExpandedCategoryId(null);
                    setTimeout(() => {
                      const rowElement = document.getElementById(`row-${category.id}`);
                      if (rowElement) {
                        const yPosition = rowElement.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: yPosition, behavior: 'instant' });
                      }
                    }, 50);
                  }
                }}
              />
            </RevealOnScroll>
            
            {!expandedCategoryId && index === 2 && (
              <RevealOnScroll delay={Math.min((index + 1) * 50, 300)}>
                <AdComponent adKey="2d00d5f1f381c5bf760e84da1f51d68c" width={468} height={60} wrapperClassName="mb-10 sm:mb-14 mx-2 sm:mx-4 bg-black/20 rounded-lg py-3 sm:py-4 border border-white/5 shadow-2xl hidden sm:flex" />
                <AdComponent adKey="2d00d5f1f381c5bf760e84da1f51d68c" width={300} height={50} wrapperClassName="mb-8 mx-2 bg-black/20 rounded-lg py-2 border border-white/5 shadow-2xl flex sm:hidden" />
              </RevealOnScroll>
            )}

            {!expandedCategoryId && index === 5 && (
              <RevealOnScroll delay={Math.min((index + 1) * 50, 300)}>
                <AdComponent adKey="0219cd05b1d4804869fc178ab5c3dce2" width={320} height={50} wrapperClassName="mb-10 sm:mb-14 mx-2 sm:mx-4 bg-black/20 rounded-lg py-3 sm:py-4 border border-white/5 shadow-2xl" />
              </RevealOnScroll>
            )}
          </div>
        ))}
      </main>

      {!expandedCategoryId && (
        <RevealOnScroll delay={300}>
          <AdComponent adKey="d31895d04994bfe43ad4113bd0488409" width={300} height={250} wrapperClassName="mb-8 sm:mb-12 px-2 sm:px-4 flex justify-center" />
        </RevealOnScroll>
      )}

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes laserSheen {
          0% { transform: translateX(-200%) skewX(-20deg); }
          40%, 100% { transform: translateX(350%) skewX(-20deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(220, 38, 38, 0.35); }
          50% { box-shadow: 0 0 25px rgba(220, 38, 38, 0.75); }
        }
        @media (min-width: 768px) {
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 15px rgba(220, 38, 38, 0.35); }
            50% { box-shadow: 0 0 32px rgba(220, 38, 38, 0.75); }
          }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-laser-sheen { animation: laserSheen 3.5s infinite ease-in-out; }
        .animate-pulse-glow { animation: pulseGlow 2.5s infinite ease-in-out; }
      `}} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#050505]">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}