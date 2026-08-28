'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './Navbar';
import Footer from './Footer';
import { createSlug } from '../lib/slug';

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

export default function WatchMovieClient({
    id,
    movieDetails,
    sidebarMovies,
    bottomSimilarMovies,
    locale
}) {
    const [activeServerId, setActiveServerId] = useState('server1');
    const [hasClickedPlayer, setHasClickedPlayer] = useState(false);
    const [isIframeLoading, setIsIframeLoading] = useState(true);

    const servers = [
        { id: 'server1', name: 'VidLink Red', url: `https://vidlink.pro/movie/${id}?primaryColor=E50914&autoplay=true` },
        { id: 'server2', name: 'AutoEmbed', url: `https://autoembed.co/movie/tmdb/${id}` },
        { id: 'server3', name: 'MultiEmbed', url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
        { id: 'server4', name: 'VidSrc Me', url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
        { id: 'server5', name: '2Embed', url: `https://www.2embed.cc/embed/${id}` },
        { id: 'server6', name: 'VidSrc PM', url: `https://vidsrc.pm/embed/movie?tmdb=${id}` },
    ];

    const activeServer = servers.find(s => s.id === activeServerId) || servers[0];

    const handleServerChange = (serverId) => {
        if (serverId !== activeServerId) {
            setActiveServerId(serverId);
            setIsIframeLoading(true);
            setHasClickedPlayer(false);
        }
    };

    const handleServerError = () => {
        const currentIndex = servers.findIndex(s => s.id === activeServerId);
        const nextIndex = (currentIndex + 1) % servers.length;
        if (nextIndex !== currentIndex) {
            setActiveServerId(servers[nextIndex].id);
            setIsIframeLoading(true);
        }
    };

    const handlePlayerClick = () => {
        window.open('https://bashsecret.com/b8t3p6w5?key=2d00a052eeae5f75fb5df01132aae507', '_blank');
        setHasClickedPlayer(true);
    };

    // Translations
    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const selectServerText = isAr ? 'اختر السيرفر:' : isFr ? 'Sélectionner le Serveur:' : 'Select Server:';
    const showMoreText = isAr ? 'أكثر' : isFr ? 'Plus' : 'More';
    const showLessText = isAr ? 'أقل' : isFr ? 'Moins' : 'Less';

    const movieText = isAr ? 'فيلم' : isFr ? 'FILM' : 'MOVIE';
    const defaultOverview = isAr
        ? 'لم يتم العثور على ملخصات لهذا الفيلم في قواعد بيانات النظام لدينا.'
        : isFr
            ? 'Aucun résumé de film trouvé dans nos bases de données système.'
            : 'No movie record summaries found inside our system databanks.';

    const sagaSectionTitle = movieDetails.belongs_to_collection
        ? (isAr ? 'الملحمة الكاملة / المجموعة' : isFr ? 'Saga Complète / Collection' : 'Full Saga / Collection')
        : (isAr ? 'توصيات سريعة' : isFr ? 'Recommandations Rapides' : 'Quick Recommendations');

    const sagaLabel = movieDetails.belongs_to_collection
        ? (isAr ? 'ملحمة' : isFr ? 'Saga' : 'Saga')
        : (isAr ? 'شائع' : isFr ? 'Populaire' : 'Hot');

    const noSidebarText = isAr ? 'لم يتم العثور على سجلات مطابقة.' : isFr ? 'Aucun enregistrement correspondant trouvé.' : 'No matching records found.';
    const moreMoviesTitle = isAr ? 'أفلام مشابهة لهذا' : isFr ? 'Plus de films comme celui-ci' : 'More Movies Like This';
    const watchNowBtnText = isAr ? 'شاهد الآن' : isFr ? 'Regarder' : 'Watch Now';

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pb-16">

            <Navbar contentType="movie" filterType="default" locale={locale} />

            <main className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col gap-10 mb-2">

                <AdComponent
                    adKey="e1df92cdb6f2e478f4ab97be681e48db"
                    width={728}
                    height={90}
                    wrapperClassName="mb-6"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                    <div className="lg:col-span-2 flex flex-col gap-6">

                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl group">

                            {/* Loading Indicator Overlay */}
                            {isIframeLoading && (
                                <div className="absolute inset-0 z-20 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                                    <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                                        {isAr ? 'جاري تحميل السيرفر...' : isFr ? 'Chargement du serveur...' : 'Loading Server...'}
                                    </span>
                                </div>
                            )}

                            {/* Smartlink Ad Overlay (Invisible) */}
                            {!hasClickedPlayer && !isIframeLoading && (
                                <div
                                    className="absolute inset-0 z-10 cursor-pointer"
                                    onClick={handlePlayerClick}
                                />
                            )}

                            <iframe
                                key={activeServer.url}
                                src={activeServer.url}
                                className="w-full h-full absolute inset-0"
                                allowFullScreen
                                scrolling="no"
                                frameBorder="0"
                                title="Movie Player"
                                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                onLoad={() => setIsIframeLoading(false)}
                                onError={handleServerError}
                            />
                        </div>

                        <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-md p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center justify-between sm:justify-start flex-shrink-0">
                                <span className="text-[11px] sm:text-xs font-black text-gray-400 uppercase tracking-wider">
                                    <i className="fa-solid fa-server text-red-500 mr-1.5"></i> {selectServerText}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 w-full sm:flex-1">
                                {servers.map((srv) => (
                                    <button
                                        key={srv.id}
                                        onClick={() => handleServerChange(srv.id)}
                                        className={`text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 rounded-lg transition-all border cursor-pointer focus:outline-none text-center ${activeServerId === srv.id
                                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                                            : 'bg-zinc-800 border-white/5 text-gray-300 hover:bg-zinc-700/60 hover:text-white'
                                            }`}
                                    >
                                        {srv.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-1">

                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4 w-full">
                                <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white select-text break-words">
                                    {movieDetails.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm flex-shrink-0 ml-auto">
                                    <span className="text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 backdrop-blur-sm">
                                        <i className="fa-solid fa-star text-[11px] sm:text-xs"></i>
                                        {movieDetails.vote_average?.toFixed(1)}
                                    </span>

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
                                {movieDetails.overview || defaultOverview}
                            </p>

                            <AdComponent
                                adKey="b7ca2ffee5ca2841019c2a47c86661ea"
                                width={300}
                                height={250}
                                wrapperClassName="mt-5 rounded-lg shadow-lg"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 relative min-h-[450px] lg:min-h-0">
                        <div className="lg:absolute lg:inset-0 bg-zinc-900/30 border border-white/5 backdrop-blur-md rounded-xl p-5 flex flex-col">

                            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 flex-shrink-0">
                                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    {sagaSectionTitle}
                                </span>
                                <span className="text-[11px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                                    {sagaLabel}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto premium-panel-scrollbar pr-1 flex flex-col gap-3">
                                {sidebarMovies.length > 0 ? (
                                    sidebarMovies.map((movie) => (
                                        <Link
                                            key={movie.id}
                                            href={`/${locale}/movie/${createSlug(movie.title, movie.id, 'movie')}`}
                                            className="w-full flex items-start gap-3 p-2 rounded-lg bg-zinc-900/40 border border-transparent hover:border-white/5 hover:bg-zinc-800/40 transition-all group/side cursor-pointer"
                                        >
                                            <div className="w-16 aspect-[2/3] bg-zinc-950 rounded overflow-hidden flex-shrink-0 shadow border border-white/5 relative">
                                                {movie.poster_path ? (
                                                    <Image src={`${IMAGE_BASE_URL}/w185${movie.poster_path}`} alt={movie.title || 'Movie poster'} width={64} height={96} className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[9px] text-zinc-600 text-center p-1">No Pic</div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1 pt-0.5">
                                                <h3 className="text-xs font-bold line-clamp-1 text-gray-200 group-hover/side:text-red-400 transition-colors">
                                                    {movie.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                                    <span className="text-amber-400 font-bold">★ {movie.vote_average?.toFixed(1)}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1.5 leading-normal">
                                                    {movie.overview || (isAr ? 'لا يوجد ملخص متاح.' : isFr ? 'Aucun résumé disponible.' : 'No summary listed.')}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center text-xs text-gray-500 py-8">{noSidebarText}</div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                <hr className="border-white/5 my-2" />

                <AdComponent
                    adKey="b7ca2ffee5ca2841019c2a47c86661ea"
                    width={300}
                    height={250}
                    wrapperClassName="lg:hidden mb-4 rounded-lg shadow-lg"
                />

                {/* SECTION MORE MOVIES */}
                <div className="w-full">
                    <h2 className="text-lg md:text-xl font-black tracking-wide uppercase mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-red-600 rounded-sm"></span> {moreMoviesTitle}
                    </h2>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                        {bottomSimilarMovies.map((movie) => (
                            <Link
                                href={`/${locale}/movie/${createSlug(movie.title, movie.id, 'movie')}`}
                                key={movie.id}
                                className="group flex flex-col bg-zinc-900/20 border border-white/5 rounded-lg overflow-hidden transition-all hover:scale-[1.03] hover:border-white/10 hover:shadow-xl cursor-pointer"
                            >
                                <div className="relative aspect-[2/3] w-full bg-zinc-950">
                                    {movie.poster_path ? (
                                        <Image src={`${IMAGE_BASE_URL}/w342${movie.poster_path}`} alt={movie.title || 'Movie poster'} width={200} height={300} sizes="(max-width: 640px) 110px, 200px" className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/60 text-center p-4 border-b border-white/5">
                                            <i className="fa-solid fa-clapperboard text-2xl text-zinc-600 mb-2"></i>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 line-clamp-3 px-1">{movie.title}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                        <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow">{watchNowBtnText}</span>
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-zinc-900/60 backdrop-blur-sm min-w-0">
                                    <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white transition-colors">{movie.title}</h3>

                                    <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-gray-400 mt-1.5 w-full">
                                        <span className="text-amber-400 font-bold flex items-center gap-0.5 flex-shrink-0">
                                            <i className="fa-solid fa-star text-[9px] sm:text-[10px]"></i>
                                            {movie.vote_average?.toFixed(1) || '0.0'}
                                        </span>

                                        <span className="bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex-shrink-0 border border-white/5">
                                            {movieText}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </main>

            <AdComponent
                adKey="f866905c400a7c1de0726eee8e077f75"
                width={468}
                height={60}
                wrapperClassName="my-8 rounded-lg shadow-lg"
            />

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
        .premium-panel-scrollbar::-webkit-scrollbar { width: 5px; }
        .premium-panel-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
        .premium-panel-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .premium-panel-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.4); }
      `}} />
        </div>
    );
}
