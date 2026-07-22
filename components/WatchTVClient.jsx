'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';

// COMPOSANT PUBLICITAIRE ISOLÉ
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
                title="Advertisement"
                style={{ display: 'block', maxWidth: '100%', border: 'none', background: 'transparent' }}
            ></iframe>
        </div>
    );
};

export default function WatchTVClient({
    id,
    showDetails,
    seasons,
    currentSeason,
    episodes,
    currentEpisode,
    similarShows,
    slug,
    locale
}) {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeServerId, setActiveServerId] = useState('server1');
    const [hasClickedPlayer, setHasClickedPlayer] = useState(false);
    const [isIframeLoading, setIsIframeLoading] = useState(true);

    useEffect(() => {
        setIsIframeLoading(true);
        setHasClickedPlayer(false);
    }, [currentSeason, currentEpisode]);

    const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

    const servers = [
        { id: 'server1', name: 'VidSrc Me', url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}` },
        { id: 'server2', name: '2Embed', url: `https://www.2embed.cc/embedtv/${id}&s=${currentSeason}&e=${currentEpisode}` },
        { id: 'server3', name: 'VidSrc CC', url: `https://vidsrc.cc/v2/embed/tv/${id}/${currentSeason}/${currentEpisode}` },
        { id: 'server4', name: 'Embed SU', url: `https://embed.su/embed/tv/${id}/${currentSeason}/${currentEpisode}` },
        { id: 'server5', name: 'AutoEmbed', url: `https://player.autoembed.co/tv/${id}/${currentSeason}/${currentEpisode}` },
        { id: 'server6', name: 'VidSrc To', url: `https://vidsrc.to/embed/tv/${id}/${currentSeason}/${currentEpisode}` },
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
        window.open('https://environmenttalentrabble.com/niwvwhsdrt?key=6ae3e88a79f88c62bed220b8faec0bf0', '_blank');
        setHasClickedPlayer(true);
    };

    const activeSeasonData = seasons.find(s => s.season_number === currentSeason);
    const currentSeasonName = activeSeasonData ? (activeSeasonData.name || `Season ${activeSeasonData.season_number}`) : `Season ${currentSeason}`;

    // Translated texts
    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const selectServerText = isAr ? 'اختر السيرفر:' : isFr ? 'Sélectionner le Serveur:' : 'Select Server:';
    const showMoreText = isAr ? 'أكثر' : isFr ? 'Plus' : 'More';
    const showLessText = isAr ? 'أقل' : isFr ? 'Moins' : 'Less';
    const tvText = isAr ? 'تلفزيون' : isFr ? 'TV' : 'TV';

    const defaultOverview = isAr
        ? 'لم يتم العثور على ملخصات لهذا المسلسل في قواعد بيانات النظام لدينا.'
        : isFr
            ? 'Aucun résumé trouvé dans nos bases de données système.'
            : 'No serialization record summaries found inside our system databanks.';

    const selectSeasonLabel = isAr ? 'اختر الموسم' : isFr ? 'Choisir la Saison' : 'Select Season Layout';
    const episodesIndexLabel = isAr ? 'قائمة الحلقات' : isFr ? 'Liste des Épisodes' : 'Episodes Index List';
    const itemsText = isAr ? 'حلقة' : isFr ? 'Hébergements' : 'Items';

    const noPreviewText = isAr ? 'لا يوجد معاينة' : isFr ? 'Pas d\'Aperçu' : 'No Preview';
    const noSummaryText = isAr ? 'لا يوجد ملخص متاح.' : isFr ? 'Pas de résumé disponible.' : 'No summary descriptions logged inside our servers for this entry.';

    const moreShowsTitle = isAr ? 'مسلسلات مشابهة لهذا' : isFr ? 'Plus de séries comme celle-ci' : 'More Shows Like This';
    const watchNowBtnText = isAr ? 'شاهد الآن' : isFr ? 'Regarder' : 'Watch Now';

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pb-16">

            <Navbar contentType="tv" filterType="default" locale={locale} />

            <main className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col gap-10 mb-2">

                {/* 1. PUB PRINCIPALE (728x90) */}
                <AdComponent
                    adKey="505a6081e767b51fdf7cd7a743de887b"
                    width={728}
                    height={90}
                    wrapperClassName="mb-6"
                />

                {/* LECTEUR + INFOS & ÉPISODES GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                    {/* COLONNE GAUCHE : Lecteur & Infos */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* LECTEUR VIDÉO */}
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
                                title="Video TV Player"
                                className="w-full h-full absolute inset-0"
                                allowFullScreen
                                scrolling="no"
                                frameBorder="0"
                                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                onLoad={() => setIsIframeLoading(false)}
                                onError={handleServerError}
                            />
                        </div>

                        {/* SÉLECTION DES SERVEURS */}
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

                        {/* Métadonnées & Description */}
                        <div className="p-1">

                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4 w-full">
                                <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white select-text break-words max-w-full">
                                    {showDetails.name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm flex-shrink-0">
                                    <span className="text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 backdrop-blur-sm">
                                        <i className="fa-solid fa-star text-[11px] sm:text-xs"></i>
                                        {showDetails.vote_average?.toFixed(1)}
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        {showDetails.genres?.slice(0, 2).map(g => (
                                            <span key={g.id} className="bg-zinc-800 text-gray-300 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs border border-white/5 whitespace-nowrap font-medium">
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                                {showDetails.overview || defaultOverview}
                            </p>

                            {/* 2. PUB SOUS LA DESCRIPTION (320x50) */}
                            <AdComponent
                                adKey="0219cd05b1d4804869fc178ab5c3dce2"
                                width={320}
                                height={50}
                                wrapperClassName="mt-5 rounded-lg shadow-lg"
                            />

                        </div>
                    </div>

                    {/* COLONNE DROITE : Index Saisons & Épisodes */}
                    <div className="lg:col-span-1 relative min-h-[480px] lg:min-h-0">
                        <div className="lg:absolute lg:inset-0 bg-zinc-900/30 border border-white/5 backdrop-blur-md rounded-xl p-5 flex flex-col">

                            {/* Menu Saisons */}
                            <div className="mb-4 relative flex-shrink-0">
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-400 mb-2">
                                    {selectSeasonLabel}
                                </label>

                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full bg-zinc-800 text-sm text-gray-200 border border-white/10 px-4 py-3 rounded-lg outline-none cursor-pointer focus:border-red-600 transition-all flex items-center justify-between font-bold"
                                >
                                    <span>{currentSeasonName}</span>
                                    <i className={`fa-solid fa-chevron-down transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-500' : 'text-gray-400'}`}></i>
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto premium-panel-scrollbar">
                                            {seasons.map((s) => {
                                                const isSelected = s.season_number === currentSeason;
                                                return (
                                                    <Link
                                                        key={s.id}
                                                        href={`/${locale}/tv/${slug}/season-${s.season_number}/episode-1`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors cursor-pointer flex items-center justify-between border-b border-white/5 last:border-b-0 ${isSelected ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                                                            }`}
                                                    >
                                                        <span>{s.name || `Season ${s.season_number}`}</span>
                                                        {isSelected && <i className="fa-solid fa-check text-xs text-white"></i>}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Titre Liste */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 flex-shrink-0">
                                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    {episodesIndexLabel}
                                </span>
                                <span className="text-[11px] font-bold text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                                    {episodes.length} {itemsText}
                                </span>
                            </div>

                            {/* Liste Épisodes */}
                            <div className="flex-1 overflow-y-auto premium-panel-scrollbar pr-1 flex flex-col gap-2">
                                {episodes.map((ep) => {
                                    const isSelected = ep.episode_number === currentEpisode;
                                    return (
                                        <Link
                                            key={ep.id}
                                            href={`/${locale}/tv/${slug}/season-${currentSeason}/episode-${ep.episode_number}`}
                                            className={`w-full flex items-start gap-3 py-[7px] px-2.5 rounded-lg text-left transition-all group/ep cursor-pointer border ${isSelected
                                                ? 'bg-red-600/10 border-red-600/40 text-white shadow-md'
                                                : 'bg-zinc-900/40 border-transparent text-gray-400 hover:bg-zinc-800/40 hover:text-white'
                                                }`}
                                        >
                                            <div className="relative w-24 aspect-[16/9] bg-zinc-950 rounded overflow-hidden flex-shrink-0 shadow border border-white/5">
                                                {ep.still_path ? (
                                                    <img src={`${IMAGE_BASE_URL}/w185${ep.still_path}`} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[10px] text-zinc-600">{noPreviewText}</div>
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-[9px] font-black tracking-tighter px-1.5 py-0.5 rounded text-gray-200">
                                                    EP {ep.episode_number}
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1 pt-0.5">
                                                <h4 className={`text-xs font-bold line-clamp-1 transition-colors ${isSelected ? 'text-red-400' : 'text-gray-200 group-hover/ep:text-white'}`}>
                                                    {ep.name || `Episode ${ep.episode_number}`}
                                                </h4>
                                                <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-normal pr-1">
                                                    {ep.overview || noSummaryText}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>

                <hr className="border-white/5 my-2" />

                {/* PUB 300x250 */}
                <AdComponent
                    adKey="d31895d04994bfe43ad4113bd0488409"
                    width={300}
                    height={250}
                    wrapperClassName="lg:hidden mb-4 rounded-lg shadow-lg"
                />

                {/* RECOMMANDATIONS */}
                <div className="w-full">
                    <h3 className="text-lg md:text-xl font-black tracking-wide uppercase mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-red-600 rounded-sm"></span> {moreShowsTitle}
                    </h3>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                        {similarShows.map((show) => (
                            <a
                                href={`/${locale}/tv/${show.id}/season-1/episode-1`}
                                key={show.id}
                                className="group flex flex-col bg-zinc-900/20 border border-white/5 rounded-lg overflow-hidden transition-all hover:scale-[1.03] hover:border-white/10 hover:shadow-xl cursor-pointer"
                            >
                                <div className="relative aspect-[2/3] w-full bg-zinc-950">
                                    {show.poster_path ? (
                                        <img src={`${IMAGE_BASE_URL}/w342${show.poster_path}`} alt={show.name} className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/60 text-center p-4 border-b border-white/5">
                                            <i className="fa-solid fa-clapperboard text-2xl text-zinc-600 mb-2"></i>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 line-clamp-3 px-1">{show.name}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                        <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow">{watchNowBtnText}</span>
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-zinc-900/60 backdrop-blur-sm min-w-0">
                                    <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white transition-colors">{show.name}</h4>

                                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 mt-1.5 w-full whitespace-nowrap overflow-hidden">
                                        <span className="text-amber-400 font-bold flex items-center gap-0.5 flex-shrink-0">
                                            <i className="fa-solid fa-star text-[9px] sm:text-[10px]"></i>
                                            {show.vote_average?.toFixed(1) || '0.0'}
                                        </span>
                                        <span className="bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex-shrink-0 border border-white/5">
                                            {tvText}
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
