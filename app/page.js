"use client";
import React, { useState, useEffect, useRef, Suspense, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// --- 1. Reusable Scroll Animation Component ---
function RevealOnScroll({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
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
  }, []);

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
function CategoryRow({ title, movies }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative w-full mb-14">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-4 tracking-wider uppercase text-gray-100">
        <span className="w-1.5 h-6 rounded-sm bg-amber-500"></span>
        {title}
      </h3>
      
      <div className="group relative">
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-40 w-12 h-12 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md cursor-pointer"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <div 
          ref={rowRef} 
          className="flex overflow-x-auto gap-4 md:gap-5 pb-8 pt-4 hide-scroll-bar snap-x snap-mandatory"
        >
          {movies.map((movie) => {
            const isTv = movie.media_type === 'tv' || movie.first_air_date || movie.name;
            const mediaRoute = isTv ? 'tv' : 'movie';

            return (
              <div key={`${movie.media_type || 'item'}-${movie.id}`} className="min-w-[160px] md:min-w-[220px] lg:min-w-[240px] snap-center">
                <Link href={`/watch/${mediaRoute}/${movie.id}`}>
                  <div className="relative rounded-lg overflow-hidden aspect-[2/3] transform transition-all duration-300 ease-out hover:-translate-y-2.5 hover:shadow-[0_15px_30px_rgba(245,158,11,0.25)] group/card cursor-pointer border border-transparent hover:border-amber-500/60">
                    
                    <img 
                      src={movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : "https://placehold.co/400x600/000000/ffffff?text=No+Image"} 
                      alt={movie.title || movie.name} 
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-600/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    <div className="absolute inset-0 p-5 flex flex-col justify-start pointer-events-none">
                      <div className="w-10 h-10 bg-amber-500 backdrop-blur-md rounded-full flex items-center justify-center mb-auto self-end opacity-0 group-hover/card:opacity-100 transform scale-75 group-hover/card:scale-100 transition-all duration-300 shadow-xl">
                         <i className="fa-solid fa-play text-black ml-0.5 text-xs"></i>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex flex-col justify-end z-20">
                      <h4 className="font-bold text-white text-sm md:text-base line-clamp-1 drop-shadow-md leading-tight mb-2">
                        {movie.title || movie.name}
                      </h4>
                      <div className="flex justify-between items-center text-[11px] md:text-xs font-semibold text-gray-300">
                        <span className="flex items-center gap-1 text-amber-400 drop-shadow">
                          <i className="fa-solid fa-star"></i> 
                          {movie.vote_average?.toFixed(1)}
                        </span>
                        {/* MODIFICATION ICI : 'Series' devient 'TV' */}
                        <span className="uppercase tracking-wide">
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

        <button 
          onClick={() => scroll('right')} 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-40 w-12 h-12 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md cursor-pointer"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

// --- 3. PRODUCTION BALANCED AD COMPONENT FOR NEXT.JS/VERCEL ---
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
    <div className={`w-full flex justify-center items-center ${wrapperClassName}`}>
      <div 
        ref={containerRef} 
        style={{ width: `${width}px`, minHeight: `${height}px` }} 
        className="clear-both overflow-hidden flex justify-center items-center" 
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

  const [contentType, setContentType] = useState('all'); 
  const [filterType, setFilterType] = useState('default'); 

  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const filterParam = searchParams.get('filter');

  useEffect(() => {
    setContentType(typeParam || 'all');
    setFilterType(filterParam || 'default');
  }, [typeParam, filterParam]);

  useEffect(() => {
    let isCurrent = true; 

    const fetchEverythingDynamic = async () => {
      setIsLoading(true);
      try {
        let primaryUrl = "";
        if (filterType === 'top_rated') {
          const type = contentType === 'all' ? 'movie' : contentType;
          primaryUrl = `${BASE_URL}/${type}/top_rated?api_key=${API_KEY}`;
        } else {
          const type = contentType === 'all' ? 'all' : contentType;
          primaryUrl = `${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`;
        }

        const primaryRes = await fetch(primaryUrl);
        const primaryData = await primaryRes.json();
        
        if (!isCurrent) return;

        const heroSelection = primaryData.results?.slice(0, 5) || [];
        const primaryRowData = primaryData.results?.slice(5) || [];

        const masterRows = [];

        if (primaryRowData.length > 0) {
          let rowTitle = "Trending Now";
          if (filterType === 'top_rated') {
            {/* MODIFICATION ICI : "Top Rated Series" devient "Top Rated TV" */}
            rowTitle = contentType === 'all' ? "Top Rated Hits" : contentType === 'movie' ? "Top Rated Movies" : "Top Rated TV";
          }
          masterRows.push({
            id: 'primary-dynamic-row',
            name: rowTitle,
            movies: primaryRowData
          });
        }

        if (contentType === 'all') {
          const [movieGenresRes, tvGenresRes] = await Promise.all([
            fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`)
          ]);
          const movieGenresData = await movieGenresRes.json();
          const tvGenresData = await tvGenresRes.json();

          if (!isCurrent) return;

          const genreMap = {};

          movieGenresData.genres?.forEach(g => {
            genreMap[g.name] = { name: g.name, movieId: g.id, tvId: null };
          });

          tvGenresData.genres?.forEach(g => {
            if (genreMap[g.name]) {
              genreMap[g.name].tvId = g.id;
            } else {
              genreMap[g.name] = { name: g.name, movieId: null, tvId: g.id };
            }
          });

          const blendedGenresResult = await Promise.all(
            Object.values(genreMap).map(async (genre) => {
              try {
                let movieItems = [];
                let tvItems = [];

                if (genre.movieId) {
                  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre.movieId}`;
                  if (filterType === 'top_rated') url += `&sort_by=vote_average.desc&vote_count.gte=200`;
                  const res = await fetch(url);
                  const data = await res.json();
                  movieItems = data.results?.map(item => ({ ...item, media_type: 'movie' })) || [];
                }

                if (genre.tvId) {
                  let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genre.tvId}`;
                  if (filterType === 'top_rated') url += `&sort_by=vote_average.desc&vote_count.gte=200`;
                  const res = await fetch(url);
                  const data = await res.json();
                  tvItems = data.results?.map(item => ({ ...item, media_type: 'tv' })) || [];
                }

                const blendedList = [];
                const maxLen = Math.max(movieItems.length, tvItems.length);
                for (let i = 0; i < maxLen; i++) {
                  if (movieItems[i]) blendedList.push(movieItems[i]);
                  if (tvItems[i]) blendedList.push(tvItems[i]);
                }

                return {
                  id: `blended-${genre.name.toLowerCase().replace(/\s+/g, '-')}`,
                  name: filterType === 'top_rated' ? `Top Rated ${genre.name}` : genre.name,
                  movies: blendedList
                };
              } catch (err) {
                return { id: `blended-${genre.name}`, name: genre.name, movies: [] };
              }
            })
          );

          blendedGenresResult.forEach((genreRow) => {
            if (genreRow.movies.length > 0) {
              masterRows.push(genreRow);
            }
          });

        } else {
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
                  movies: data.results?.map(item => ({ ...item, media_type: contentType })) || []
                };
              } catch (err) {
                return { id: `${contentType}-${genre.id}`, name: genre.name, movies: [] };
              }
            })
          );

          dynamicGenresResult.forEach((genreRow) => {
            if (genreRow.movies.length > 0) {
              masterRows.push({
                id: genreRow.id,
                name: filterType === 'top_rated' ? `Top Rated ${genreRow.name}` : genreRow.name,
                movies: genreRow.movies
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
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeHero = heroMovies[activeHeroIndex];
  const isHeroTv = activeHero?.media_type === 'tv' || activeHero?.first_air_date;
  const heroMediaRoute = isHeroTv ? 'tv' : 'movie';

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden font-sans selection:bg-red-700 selection:text-white">
      <Navbar 
        contentType={contentType} 
        setContentType={setContentType} 
        filterType={filterType} 
        setFilterType={setFilterType} 
      />
      
      {/* --- HERO BANNER --- */}
      {heroMovies.length > 0 && (
        <section className="relative w-full h-[85vh] md:h-[95vh] bg-black overflow-hidden group">
          {heroMovies.map((movie, index) => (
            <div 
              key={movie.id} 
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 md:via-[#050505]/60 to-transparent z-10"></div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/50 to-transparent z-10"></div>
              
              <img 
                src={`${IMAGE_BASE_URL}/original${movie.backdrop_path}`} 
                alt={movie.title || movie.name} 
                className={`w-full h-full object-cover transform transition-transform duration-[10000ms] ease-out ${index === activeHeroIndex ? 'scale-110' : 'scale-100'}`}
              />
            </div>
          ))}

          <div className="relative z-20 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 md:px-24 w-full pt-20">
            <div className="max-w-2xl">
              <h1 
                key={`title-${activeHeroIndex}`}
                className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 text-white drop-shadow-xl leading-tight opacity-0 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards]"
              >
                {activeHero.title || activeHero.name}
              </h1>

              <div 
                key={`meta-${activeHeroIndex}`}
                className="flex items-center gap-4 text-sm font-medium text-gray-300 mb-8 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards]"
              >
                <span className="flex items-center gap-1.5 text-amber-400 drop-shadow-md">
                  <i className="fa-solid fa-star"></i>
                  {activeHero.vote_average?.toFixed(1)} Rating
                </span>
                
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                
                {/* MODIFICATION ICI : 'Series' devient 'TV' */}
                <span className="uppercase border border-gray-600 px-2 py-0.5 rounded text-xs font-bold tracking-wider text-white bg-white/[0.02]">
                  {isHeroTv ? 'TV' : 'Movie'}
                </span>
              </div>

              <div className="opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]">
                <Link 
                  href={`/watch/${heroMediaRoute}/${activeHero.id}`} 
                  className="group relative inline-flex items-center gap-4 px-10 py-4 bg-red-600 rounded-sm font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 animate-pulse-glow text-white cursor-pointer"
                >
                  <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-laser-sheen"></div>
                  <i className="fa-solid fa-play text-white group-hover:scale-110 transition-transform relative z-10"></i>
                  <span className="tracking-wide relative z-10 font-extrabold">Watch Now</span>
                </Link>
              </div>
            </div>
          </div>

          <button onClick={() => setActiveHeroIndex((p) => (p === 0 ? heroMovies.length - 1 : p - 1))} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 cursor-pointer">
            <i className="fa-solid fa-chevron-left text-xl md:text-2xl"></i>
          </button>
          <button onClick={() => setActiveHeroIndex((p) => (p + 1) % heroMovies.length)} className="absolute right-4 md:left-auto md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 cursor-pointer">
            <i className="fa-solid fa-chevron-right text-xl md:text-2xl"></i>
          </button>

          <div className="absolute bottom-10 left-6 md:left-24 z-30 flex gap-3 items-center">
            {heroMovies.map((_, index) => (
              <div key={index} className="relative flex items-center justify-center">
                {index === activeHeroIndex && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                )}
                <button
                  onClick={() => setActiveHeroIndex(index)}
                  className={`relative z-10 transition-all duration-500 rounded-full cursor-pointer ${
                    index === activeHeroIndex ? 'w-8 h-2 bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]' : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- AD COMPONENT 1 --- */}
      <AdComponent 
        adKey="505a6081e767b51fdf7cd7a743de887b" 
        width={728} 
        height={90} 
        wrapperClassName="mt-12 mb-2 px-4" 
      />

      {/* --- ALL GENERATED CATEGORIES LIST --- */}
      <main className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-8 flex flex-col gap-4 relative z-20">
        {allCategories.map((category, index) => (
          <Fragment key={category.id}>
            <RevealOnScroll delay={Math.min(index * 50, 300)}>
              <CategoryRow 
                title={category.name} 
                movies={category.movies} 
              />
            </RevealOnScroll>
            
            {/* --- AD COMPONENT 2 --- */}
            {index === 2 && (
              <RevealOnScroll delay={Math.min((index + 1) * 50, 300)}>
                <AdComponent 
                  adKey="2d00d5f1f381c5bf760e84da1f51d68c" 
                  width={468} 
                  height={60} 
                  wrapperClassName="mb-14 px-4 bg-black/20 rounded-lg py-4 border border-white/5 shadow-2xl" 
                />
              </RevealOnScroll>
            )}

            {/* --- AD COMPONENT 3 --- */}
            {index === 5 && (
              <RevealOnScroll delay={Math.min((index + 1) * 50, 300)}>
                <AdComponent 
                  adKey="0219cd05b1d4804869fc178ab5c3dce2" 
                  width={320} 
                  height={50} 
                  wrapperClassName="mb-14 px-4 bg-black/20 rounded-lg py-4 border border-white/5 shadow-2xl" 
                />
              </RevealOnScroll>
            )}
          </Fragment>
        ))}
      </main>

      {/* --- AD COMPONENT 4 --- */}
      <RevealOnScroll delay={300}>
        <AdComponent 
          adKey="d31895d04994bfe43ad4113bd0488409" 
          width={300} 
          height={250} 
          wrapperClassName="mb-12 px-4 flex justify-center" 
        />
      </RevealOnScroll>

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes laserSheen {
          0% { transform: translateX(-200%) skewX(-20deg); }
          40%, 100% { transform: translateX(350%) skewX(-20deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(220, 38, 38, 0.35); }
          50% { box-shadow: 0 0 32px rgba(220, 38, 38, 0.75); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}