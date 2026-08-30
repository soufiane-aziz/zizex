'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './Navbar';
import Footer from './Footer';
import { createSlug } from '../lib/slug';

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// --- SKELETON LOADERS ---
function CardSkeleton() {
    return (
        <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-neutral-900 border border-neutral-800/60 animate-pulse flex flex-col justify-end p-3 sm:p-4">
            <div className="w-5/6 h-3.5 sm:h-4 bg-neutral-800/70 rounded mb-2"></div>
            <div className="flex justify-between items-center w-full">
                <div className="w-1/4 h-2.5 sm:h-3 bg-neutral-800/70 rounded"></div>
                <div className="w-1/5 h-3.5 sm:h-4 bg-neutral-800/70 rounded"></div>
            </div>
        </div>
    );
}

// --- Scroll Animation ---
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
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                }`}
        >
            {children}
        </div>
    );
}

// --- Category Row Component ---
function CategoryRow({ title, movies, loadMore, isExpanded, onExpandToggle, locale }) {
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

    const handleScrollState = () => {
        const row = rowRef.current;
        if (!row) return;

        setShowLeftArrow(row.scrollLeft > 10);

        const { scrollLeft, clientWidth, scrollWidth } = row;
        if (scrollLeft + clientWidth >= scrollWidth - 800) {
            fetchNextPage();
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
        const slug = createSlug(movie.title || movie.name, movie.id, isTv ? 'tv' : 'movie');
        const targetUrl = isTv
            ? `/${locale}/tv/${slug}/season-1/episode-1`
            : `/${locale}/movie/${slug}`;

        return (
            <div key={`${movie.media_type || 'item'}-${movie.id}-${index}`} className="snap-center w-full">
                <Link href={targetUrl}>
                    <div className="relative rounded-lg overflow-hidden aspect-[2/3] transform transition-all duration-300 ease-out hover:-translate-y-1 sm:hover:-translate-y-2.5 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] sm:hover:shadow-[0_15px_30px_rgba(245,158,11,0.25)] group/card cursor-pointer border border-transparent hover:border-amber-500/60 bg-[#121212]">

                        <Image
                            src={movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : "/icon-512.png"}
                            alt={movie.title || movie.name || 'Poster'}
                            width={500}
                            height={750}
                            sizes="(max-width: 640px) 120px, (max-width: 768px) 160px, (max-width: 1024px) 210px, 240px"
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
                            <h3 className="font-bold text-white text-[11px] sm:text-sm md:text-base line-clamp-1 drop-shadow-md leading-tight mb-1 sm:mb-2">
                                {movie.title || movie.name}
                            </h3>
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

    // Translations for buttons
    const isAr = locale === 'ar';
    const closeText = isAr ? 'إغلاق' : locale === 'fr' ? 'Fermer' : 'Close';
    const viewAllText = isAr ? 'عرض الكل' : locale === 'fr' ? 'Voir tout' : 'View All';
    const endMessageText = isAr ? 'لقد وصلت إلى نهاية المجموعة' : locale === 'fr' ? 'Vous avez atteint la fin de la collection' : "You've reached the end of the collection";

    return (
        <div className={`w-full relative z-10 ${isExpanded ? 'min-h-screen' : 'mb-10 sm:mb-14'}`}>

            {/* ROW HEADER BLOCK */}
            <div className={`flex justify-between items-center transition-all duration-300 ${isExpanded
                ? 'fixed top-0 left-0 right-0 w-full bg-[#050505]/95 backdrop-blur-md py-4 sm:py-5 px-4 sm:px-8 border-b border-white/10 z-[100] shadow-2xl'
                : 'mb-4 sm:mb-6 relative z-20 px-2 sm:px-0'
                }`}>
                <h2 className={`font-black flex items-center gap-2 sm:gap-4 tracking-wider uppercase text-gray-100 transition-all duration-300 ${isExpanded ? 'text-lg sm:text-3xl' : 'text-xl sm:text-2xl'
                    }`}>
                    <span className="w-1 sm:w-1.5 h-4 sm:h-6 rounded-sm bg-amber-500"></span>
                    {title}
                </h2>

                <button
                    onClick={() => onExpandToggle(!isExpanded)}
                    className={`group/btn flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-black tracking-wide uppercase transition-all duration-200 cursor-pointer ${isExpanded
                        ? 'px-3 sm:px-5 py-2 sm:py-2.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black shadow-md'
                        : 'text-amber-500 hover:text-amber-400'
                        }`}
                >
                    <span>{isExpanded ? closeText : viewAllText}</span>
                    <i className={`text-[11px] sm:text-xs transform transition-transform duration-200 ${isExpanded
                        ? 'fa-solid fa-xmark text-sm group-hover/btn:rotate-90'
                        : `fa-solid ${isAr ? 'fa-chevron-left' : 'fa-chevron-right'} group-hover/btn:translate-x-1.5`
                        }`}></i>
                </button>
            </div>

            {!isExpanded ? (
                <div className="group relative z-10">
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute left-1 sm:left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/85 border border-white/10 text-white flex items-center justify-center transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md cursor-pointer ${showLeftArrow ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                            }`}
                    >
                        <i className={`fa-solid ${isAr ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs sm:text-sm md:text-base`}></i>
                    </button>

                    <div
                        ref={rowRef}
                        onScroll={handleScrollState}
                        className="flex overflow-x-auto gap-2.5 sm:gap-3.5 md:gap-5 pb-6 sm:pb-8 pt-2 sm:pt-4 hide-scroll-bar snap-x snap-mandatory px-2 sm:px-0 scroll-smooth"
                    >
                        {localMovies.map((movie, index) => (
                            <div key={`${movie.id}-${index}`} className="min-w-[115px] sm:min-w-[145px] md:min-w-[210px] lg:min-w-[240px]">
                                {renderMovieCard(movie, index)}
                            </div>
                        ))}

                        {/* INLINE ROW LOADING SKELETON */}
                        {isFetching && (
                            <div className="min-w-[115px] sm:min-w-[145px] md:min-w-[210px] lg:min-w-[240px] flex-shrink-0">
                                <CardSkeleton />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-1 sm:right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/85 border border-white/10 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md cursor-pointer"
                    >
                        <i className={`fa-solid ${isAr ? 'fa-chevron-left' : 'fa-chevron-right'} text-xs sm:text-sm md:text-base`}></i>
                    </button>
                </div>
            ) : (
                <div className="w-full pb-24 pt-20 sm:pt-28 animate-[fadeIn_0.25s_ease-out] relative z-10">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 md:gap-5 px-2 sm:px-4">
                        {localMovies.map((movie, index) => renderMovieCard(movie, index))}
                    </div>

                    {/* VIEW ALL GRID PAGINATION LOADING SKELETONS */}
                    <div ref={expandedSentinelRef} className="w-full mt-12">
                        {hasMore ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 md:gap-5 px-2 sm:px-4">
                                {[...Array(8)].map((_, i) => (
                                    <CardSkeleton key={`expanded-loading-${i}`} />
                                ))}
                            </div>
                        ) : (
                            <div className="w-full h-40 flex items-center justify-center">
                                <p className="text-xs sm:text-sm font-bold tracking-widest text-gray-500 uppercase bg-white/5 px-6 py-2.5 rounded-full border border-white/5 shadow-inner">
                                    {endMessageText}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Production balanced ads ---
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
        <script type="text/javascript" src="https://bashsecret.com/${adKey}/invoke.js"></script>
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
                title="Advertisement"
                style={{ display: 'block', maxWidth: '100%', border: 'none', background: 'transparent' }}
            ></iframe>
        </div>
    );
};

// --- Main Client wrapper ---
export default function HomeClient({
    initialHeroMovies,
    initialCategories,
    contentType,
    filterType,
    locale
}) {
    const [heroMovies, setHeroMovies] = useState(initialHeroMovies);
    const [allCategories, setAllCategories] = useState(initialCategories);
    const [activeHeroIndex, setActiveHeroIndex] = useState(0);
    const [expandedCategoryId, setExpandedCategoryId] = useState(null);

    useEffect(() => {
        setHeroMovies(initialHeroMovies);
        setAllCategories(initialCategories);
        setExpandedCategoryId(null);
    }, [initialHeroMovies, initialCategories, contentType, filterType]);

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

    const activeHero = heroMovies[activeHeroIndex];
    const isHeroTv = activeHero?.media_type === 'tv' || activeHero?.first_air_date;
    const isAr = locale === 'ar';
    const watchNowText = isAr ? 'شاهد الآن' : locale === 'fr' ? 'Regarder' : 'Watch Now';
    const ratingText = isAr ? 'تقييم' : locale === 'fr' ? 'Note' : 'Rating';

    // Build a per-category loadMore function from the category metadata embedded in the id
    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
    const BASE_URL = 'https://api.themoviedb.org/3';

    function createLoadMore(category) {
        return async (page) => {
            try {
                const { id, movieGenreId, tvGenreId, contentType: cType, genreId } = category;
                const lang = `&language=${tmdbLang}`;
                const sortBy = filterType === 'top_rated' ? '&sort_by=vote_average.desc&vote_count.gte=200' : '';

                // Blended genre rows: use embedded movieGenreId / tvGenreId
                if (id.startsWith('blended-') && movieGenreId && tvGenreId) {
                    const [mRes, tRes] = await Promise.all([
                        fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${movieGenreId}&page=${page}${sortBy}${lang}`),
                        fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${tvGenreId}&page=${page}${sortBy}${lang}`)
                    ]);
                    const [mData, tData] = await Promise.all([mRes.json(), tRes.json()]);
                    const movies = (mData.results || []).map(m => ({ ...m, media_type: 'movie' }));
                    const tvs = (tData.results || []).map(t => ({ ...t, media_type: 'tv' }));
                    const blended = [];
                    const max = Math.max(movies.length, tvs.length);
                    for (let i = 0; i < max; i++) {
                        if (movies[i]) blended.push(movies[i]);
                        if (tvs[i]) blended.push(tvs[i]);
                    }
                    return blended;
                }

                // Single content-type genre rows: use embedded contentType + genreId
                if (cType && genreId) {
                    const res = await fetch(`${BASE_URL}/discover/${cType}?api_key=${API_KEY}&with_genres=${genreId}&page=${page}${sortBy}${lang}`);
                    const data = await res.json();
                    return (data.results || []).map(item => ({ ...item, media_type: cType }));
                }

                // Primary dynamic row: trending or top-rated blended
                if (id === 'primary-dynamic-row') {
                    const isTop = filterType === 'top_rated';
                    const mPath = isTop ? 'movie/top_rated' : 'trending/movie/week';
                    const tPath = isTop ? 'tv/top_rated' : 'trending/tv/week';
                    const [mRes, tRes] = await Promise.all([
                        fetch(`${BASE_URL}/${mPath}?api_key=${API_KEY}&page=${page}${lang}`),
                        fetch(`${BASE_URL}/${tPath}?api_key=${API_KEY}&page=${page}${lang}`)
                    ]);
                    const [mData, tData] = await Promise.all([mRes.json(), tRes.json()]);
                    const mR = (mData.results || []).map(m => ({ ...m, media_type: 'movie' }));
                    const tR = (tData.results || []).map(t => ({ ...t, media_type: 'tv' }));
                    const blended = [];
                    const max = Math.max(mR.length, tR.length);
                    for (let i = 0; i < max; i++) {
                        if (mR[i]) blended.push(mR[i]);
                        if (tR[i]) blended.push(tR[i]);
                    }
                    return blended;
                }

                return [];
            } catch (e) {
                console.error('loadMore failed:', e);
                return [];
            }
        };
    }

    const categoriesToRender = expandedCategoryId
        ? allCategories.filter(cat => cat.id === expandedCategoryId)
        : allCategories;

    return (
        <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden font-sans selection:bg-red-700 selection:text-white">

            {!expandedCategoryId && (
                <Navbar
                    locale={locale}
                />
            )}

            {heroMovies.length > 0 && !expandedCategoryId && (
                <section className="relative w-full h-[95vh] sm:h-screen bg-black overflow-hidden group">
                    {heroMovies.map((movie, index) => (
                        <div
                            key={movie.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-transparent z-10"></div>

                            <Image
                                src={movie.backdrop_path ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}` : movie.poster_path ? `${IMAGE_BASE_URL}/original${movie.poster_path}` : '/icon-512.png'}
                                alt={movie.title || movie.name || 'Hero backdrop'}
                                fill
                                priority={index === 0}
                                sizes="100vw"
                                quality={90}
                                className={`w-full h-full object-cover transform transition-transform duration-[10000ms] ease-out ${index === activeHeroIndex ? 'scale-110' : 'scale-100'} object-top sm:object-center`}
                            />
                        </div>
                    ))}

                    <div className="relative z-20 flex flex-col justify-end h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-24 w-full pb-14 sm:pb-16 pt-24">
                        <div className={`max-w-xs sm:max-w-lg md:max-w-2xl landscape:max-w-2xl ${isAr ? 'text-right' : 'text-left'}`}>
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
                                    {activeHero.vote_average?.toFixed(1)} <span className="hidden sm:inline">{ratingText}</span>
                                </span>

                                <span className="uppercase tracking-wider font-extrabold text-xs border border-white/30 px-2.5 py-1 rounded text-white bg-black/60 shadow-md">
                                    {isHeroTv ? 'TV' : 'Movie'}
                                </span>
                            </div>

                            <div className="opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]">
                                <Link
                                    href={isHeroTv 
                                        ? `/${locale}/tv/${createSlug(activeHero.name || activeHero.title, activeHero.id, 'tv')}/season-1/episode-1` 
                                        : `/${locale}/movie/${createSlug(activeHero.title || activeHero.name, activeHero.id, 'movie')}`}
                                    className="group relative inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-10 py-3 sm:py-4 bg-red-600 rounded-sm font-bold text-sm sm:text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 animate-pulse-glow text-white cursor-pointer shadow-xl"
                                >
                                    <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-laser-sheen"></div>
                                    <i className="fa-solid fa-play text-white group-hover:scale-110 transition-transform relative z-10 text-xs sm:text-base"></i>
                                    <span className="tracking-wide relative z-10 font-extrabold">{watchNowText}</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setActiveHeroIndex((p) => (p === 0 ? heroMovies.length - 1 : p - 1))} className={`absolute top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer ${isAr ? 'right-2 sm:right-4 md:right-8' : 'left-2 sm:left-4 md:left-8'}`}>
                        <i className={`fa-solid ${isAr ? 'fa-chevron-right' : 'fa-chevron-left'} text-sm sm:text-xl md:text-2xl`}></i>
                    </button>
                    <button onClick={() => setActiveHeroIndex((p) => (p + 1) % heroMovies.length)} className={`absolute top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer ${isAr ? 'left-2 sm:left-4 md:left-8' : 'right-2 sm:right-4 md:right-8'}`}>
                        <i className={`fa-solid ${isAr ? 'fa-chevron-left' : 'fa-chevron-right'} text-sm sm:text-xl md:text-2xl`}></i>
                    </button>

                    <div className={`absolute bottom-6 sm:bottom-10 md:bottom-10 left-0 right-0 z-30 flex flex-wrap justify-center gap-1.5 sm:gap-2 items-center max-w-full px-4 ${isAr ? 'sm:right-8 md:right-24 sm:left-auto' : 'sm:left-8 md:left-24 sm:right-auto'}`}>
                        {heroMovies.map((_, index) => (
                            <div key={index} className="relative flex items-center justify-center">
                                {index === activeHeroIndex && (
                                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                                )}
                                <button
                                    onClick={() => setActiveHeroIndex(index)}
                                    className={`relative z-10 transition-all duration-500 rounded-full cursor-pointer ${index === activeHeroIndex ? 'w-5 h-1.5 sm:w-7 sm:h-2 bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]' : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 hover:bg-gray-400'
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
                    <AdComponent adKey="e1df92cdb6f2e478f4ab97be681e48db" width={728} height={90} wrapperClassName="mt-6 sm:mt-12 mb-2 px-2 sm:px-4 hidden sm:flex" />
                    <AdComponent adKey="e1df92cdb6f2e478f4ab97be681e48db" width={320} height={50} wrapperClassName="mt-6 mb-2 px-2 flex sm:hidden" />
                </>
            )}

            <main className={`w-full max-w-[1600px] mx-auto relative z-20 ${expandedCategoryId
                ? 'px-0 pt-0 pb-8'
                : 'px-2 sm:px-4 md:px-12 lg:px-16 py-4 sm:py-8 flex flex-col gap-2 sm:gap-4'
                }`}>
                {categoriesToRender.map((category, index) => (
                    <React.Fragment key={category.id}>
                        <div id={`row-${category.id}`}>
                            <RevealOnScroll
                                delay={expandedCategoryId ? 0 : Math.min(index * 50, 300)}
                                disable={expandedCategoryId === category.id}
                            >
                                <CategoryRow
                                    title={category.name}
                                    movies={category.movies}
                                    loadMore={createLoadMore(category)}
                                    isExpanded={expandedCategoryId === category.id}
                                    locale={locale}
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
                        </div>
                        {/* --- ADDED AD COMPONENT 2 (After 3rd row / Index 2) --- */}
                        {index === 2 && !expandedCategoryId && (
                            <RevealOnScroll delay={Math.min((index + 1) * 50, 300)}>
                                <AdComponent
                                    adKey="b7ca2ffee5ca2841019c2a47c86661ea"
                                    width={300}
                                    height={250}
                                    wrapperClassName="mb-14 px-4 bg-black/20 rounded-lg py-4 border border-white/5 shadow-2xl"
                                />
                            </RevealOnScroll>
                        )}
                        {/* --- ADDED AD COMPONENT 3 (After 6th row / Index 5) --- */}
                        {index === 5 && !expandedCategoryId && (
                            <RevealOnScroll delay={Math.min((index + 1) * 50, 300)}>
                                <AdComponent
                                    adKey="b7ca2ffee5ca2841019c2a47c86661ea"
                                    width={300}
                                    height={250}
                                    wrapperClassName="mb-14 px-4 bg-black/20 rounded-lg py-4 border border-white/5 shadow-2xl"
                                />
                            </RevealOnScroll>
                        )}
                    </React.Fragment>
                ))}
            </main>

            {/* --- ADDED AD COMPONENT 4 (Before Footer) --- */}
            <RevealOnScroll delay={300}>
                <AdComponent
                    adKey="f866905c400a7c1de0726eee8e077f75"
                    width={468}
                    height={60}
                    wrapperClassName="mb-12 px-4 flex justify-center"
                />
            </RevealOnScroll>

            <Footer />
        </div>
    );
}
