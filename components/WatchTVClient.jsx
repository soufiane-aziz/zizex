'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './Navbar';
import Footer from './Footer';
import { createSlug } from '../lib/slug';

// COMPOSANT PUBLICITAIRE ISOLÉ
const AdComponent = ({ adKey, width, height, wrapperClassName }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

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
            {isLoaded ? (
                <iframe
                    srcDoc={srcDoc}
                    width={width}
                    height={height}
                    frameBorder="0"
                    scrolling="no"
                    title="Advertisement"
                    loading="lazy"
                    style={{ display: 'block', maxWidth: '100%', border: 'none', background: 'transparent' }}
                ></iframe>
            ) : (
                <div style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }} />
            )}
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
    const [showServerNotice, setShowServerNotice] = useState(true);
    const [isScreenLocked, setIsScreenLocked] = useState(false);
    const [showUnlockButton, setShowUnlockButton] = useState(false);
    const [showSlowHint, setShowSlowHint] = useState(false);

    const playerContainerRef = useRef(null);
    const unlockTimerRef = useRef(null);
    const lastLockAdTimeRef = useRef(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowServerNotice(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const toggleScreenLock = (e) => {
        if (e) e.stopPropagation();

        if (!isScreenLocked) {
            // Trigger Smartlink ad on Lock (max once every 5 minutes)
            const now = Date.now();
            const FIVE_MINUTES = 5 * 60 * 1000;
            if (now - lastLockAdTimeRef.current >= FIVE_MINUTES) {
                window.open('https://bashsecret.com/b8t3p6w5?key=2d00a052eeae5f75fb5df01132aae507', '_blank');
                lastLockAdTimeRef.current = now;
                // Only open smartlink on ad click; do not lock screen yet
                return;
            }

            setIsScreenLocked(true);
            setShowUnlockButton(true);

            // Auto-trigger fullscreen if not already in fullscreen mode
            if (playerContainerRef.current && !document.fullscreenElement) {
                const el = playerContainerRef.current;
                if (el.requestFullscreen) {
                    el.requestFullscreen().catch(() => { });
                } else if (el.webkitRequestFullscreen) {
                    el.webkitRequestFullscreen();
                } else if (el.msRequestFullscreen) {
                    el.msRequestFullscreen();
                }
            }

            clearTimeout(unlockTimerRef.current);
            unlockTimerRef.current = setTimeout(() => {
                setShowUnlockButton(false);
            }, 3000);
        } else {
            setIsScreenLocked(false);
            setShowUnlockButton(false);
            clearTimeout(unlockTimerRef.current);

            // Exit container fullscreen on unlock if in fullscreen mode
            if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => { });
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
    };

    const handleLockedScreenTap = (e) => {
        e.stopPropagation();
        setShowUnlockButton(true);
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = setTimeout(() => {
            setShowUnlockButton(false);
        }, 3000);
    };

    useEffect(() => {
        setIsIframeLoading(true);
        setHasClickedPlayer(false);
        setActiveServerId('server1');
    }, [currentSeason, currentEpisode]);

    // Show loading overlay while the iframe loads.
    // Auto-switch to next server after 8s if vidsrc.pm (or any server) stalls.
    const autoSwitchTimerRef = useRef(null);
    const slowHintTimerRef = useRef(null);
    useEffect(() => {
        setIsIframeLoading(true);
        setShowSlowHint(false);
        clearTimeout(autoSwitchTimerRef.current);
        clearTimeout(slowHintTimerRef.current);
        // Show "slow connection" hint after 5s
        slowHintTimerRef.current = setTimeout(() => setShowSlowHint(true), 5000);
        // Auto-switch server after 8s
        autoSwitchTimerRef.current = setTimeout(() => {
            const currentIndex = servers.findIndex(s => s.id === activeServerId);
            const nextIndex = (currentIndex + 1) % servers.length;
            if (nextIndex !== currentIndex) {
                setActiveServerId(servers[nextIndex].id);
            } else {
                setIsIframeLoading(false);
            }
        }, 8000);
        return () => {
            clearTimeout(autoSwitchTimerRef.current);
            clearTimeout(slowHintTimerRef.current);
        };
    }, [activeServerId, currentSeason, currentEpisode]); // eslint-disable-line react-hooks/exhaustive-deps

    const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

    const servers = [
        { id: 'server1', name: 'VidSrc PM', url: `https://vidsrc.pm/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}` },
        { id: 'server2', name: 'AutoEmbed', url: `https://autoembed.co/tv/tmdb/${id}-${currentSeason}-${currentEpisode}` },
        { id: 'server3', name: 'MultiEmbed', url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${currentSeason}&e=${currentEpisode}` },
        { id: 'server4', name: 'VidSrc Me', url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}` },
        { id: 'server5', name: '2Embed', url: `https://www.2embed.cc/embedtv/${id}&s=${currentSeason}&e=${currentEpisode}` },
        { id: 'server6', name: 'VidLink Red', url: `https://vidlink.pro/tv/${id}/${currentSeason}/${currentEpisode}?primaryColor=E50914&autoplay=true` },
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

    const activeSeasonData = seasons.find(s => s.season_number === currentSeason);
    const currentSeasonName = activeSeasonData ? (activeSeasonData.name || `Season ${activeSeasonData.season_number}`) : `Season ${currentSeason}`;

    // Calculate Previous & Next episode navigation
    const currentEpisodeNum = Number(currentEpisode);
    const currentSeasonNum = Number(currentSeason);

    let prevSeasonNum = null;
    let prevEpisodeNum = null;
    let nextSeasonNum = null;
    let nextEpisodeNum = null;

    // PREVIOUS EPISODE LOGIC:
    if (currentEpisodeNum > 1) {
        prevSeasonNum = currentSeasonNum;
        prevEpisodeNum = currentEpisodeNum - 1;
    } else {
        const prevSeasonExists = Array.isArray(seasons) && seasons.some(s => s.season_number === currentSeasonNum - 1);
        if (prevSeasonExists) {
            prevSeasonNum = currentSeasonNum - 1;
            prevEpisodeNum = 1;
        } else {
            prevSeasonNum = null;
            prevEpisodeNum = null;
        }
    }

    // NEXT EPISODE LOGIC:
    const currentEpIndex = Array.isArray(episodes) ? episodes.findIndex(e => e.episode_number === currentEpisodeNum) : -1;
    const isLastEpInCurrentSeason = (currentEpIndex !== -1 && currentEpIndex === episodes.length - 1) ||
        (Array.isArray(episodes) && episodes.length > 0 && currentEpisodeNum === episodes[episodes.length - 1].episode_number);

    if (currentEpIndex !== -1 && currentEpIndex < episodes.length - 1) {
        nextSeasonNum = currentSeasonNum;
        nextEpisodeNum = episodes[currentEpIndex + 1].episode_number;
    } else if (!isLastEpInCurrentSeason && Array.isArray(episodes) && episodes.length > 0 && currentEpisodeNum < episodes[episodes.length - 1].episode_number) {
        nextSeasonNum = currentSeasonNum;
        nextEpisodeNum = currentEpisodeNum + 1;
    } else {
        const nextSeasonExists = Array.isArray(seasons) && seasons.some(s => s.season_number === currentSeasonNum + 1);
        if (nextSeasonExists) {
            nextSeasonNum = currentSeasonNum + 1;
            nextEpisodeNum = 1;
        } else {
            nextSeasonNum = null;
            nextEpisodeNum = null;
        }
    }

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

            <main className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col gap-6 mb-2">

                {/* 1. PUB PRINCIPALE (728x90) */}
                <AdComponent
                    adKey="e1df92cdb6f2e478f4ab97be681e48db"
                    width={728}
                    height={90}
                    wrapperClassName="mb-0 my-1"
                />

                {/* LECTEUR + INFOS & ÉPISODES GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                    {/* COLONNE GAUCHE : Lecteur & Infos */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Notice overlay above servers */}
                        {showServerNotice && (
                            <div className="flex items-center justify-center gap-2.5 sm:gap-3 bg-gradient-to-r from-amber-500/15 via-zinc-900/95 to-amber-500/15 border border-amber-500/30 text-white text-[11px] sm:text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-amber-500/10 backdrop-blur-xl pointer-events-none animate-bounce transition-all duration-300 mx-auto max-w-full w-full">
                                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0">
                                    <i className="fa-solid fa-circle-info text-xs animate-pulse"></i>
                                </div>
                                <span className="text-gray-200 leading-tight text-center">
                                    If a server doesn't work, please <span className="text-amber-400 font-extrabold underline decoration-amber-400/50 underline-offset-2">switch server</span> below!
                                </span>
                            </div>
                        )}

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

                        {/* LECTEUR VIDÉO + NAVIGATION ÉPISODES */}
                        <div className="flex flex-col gap-2">
                            <div ref={playerContainerRef} className="relative w-full h-[calc(56.25vw+10px)] sm:h-auto sm:aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl group">

                                {/* Lock Screen Toggle Button (unlocked state) */}
                                {!isIframeLoading && !isScreenLocked && (
                                    <button
                                        onClick={toggleScreenLock}
                                        title="Lock Screen & Go Fullscreen"
                                        className="absolute top-3 right-3 z-35 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950/80 hover:bg-red-600 text-white text-xs font-extrabold border border-white/15 shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                                    >
                                        <i className="fa-solid fa-lock text-xs text-red-400 group-hover:text-white"></i>
                                        <span className="text-[11px] font-bold">Lock Screen</span>
                                    </button>
                                )}

                                {/* Screen Lock Touch Shield (locked state) */}
                                {isScreenLocked && (
                                    <div
                                        className="absolute inset-0 z-50 bg-black/10 backdrop-blur-[0.5px] cursor-pointer select-none"
                                        onClick={handleLockedScreenTap}
                                    >
                                        {/* Top-Right Red Unlock Button when screen is tapped */}
                                        {showUnlockButton && (
                                            <button
                                                onClick={toggleScreenLock}
                                                title="Unlock Screen"
                                                className="absolute top-3 right-3 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-extrabold border border-red-400/50 shadow-[0_0_25px_rgba(229,9,20,0.7)] backdrop-blur-xl transition-all duration-200 cursor-pointer animate-pulse hover:scale-105 active:scale-95"
                                            >
                                                <i className="fa-solid fa-lock-open text-xs"></i>
                                                <span className="text-xs font-black uppercase tracking-wider">Unlock</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Loading Indicator Overlay — shows TV show backdrop as background */}
                                {isIframeLoading && (
                                    <div className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-none transition-opacity duration-300 overflow-hidden">
                                        {/* Blurred backdrop in background for instant visual feedback */}
                                        {showDetails?.backdrop_path && (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w780${showDetails.backdrop_path}`}
                                                alt=""
                                                aria-hidden="true"
                                                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-105"
                                            />
                                        )}
                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                                                {isAr ? 'جاري تحميل السيرفر...' : isFr ? 'Chargement du serveur...' : 'Loading Server...'}
                                            </span>
                                            {showSlowHint && (
                                                <span className="text-[11px] text-amber-400 font-semibold animate-pulse">
                                                    {isAr ? 'بطيء؟ جرّب سيرفراً آخر ↓' : isFr ? 'Lent? Essayez un autre serveur ↓' : 'Slow? Try another server below ↓'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Smartlink Ad Overlay (Invisible) */}
                                {!hasClickedPlayer && !isIframeLoading && !isScreenLocked && (
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
                                    loading="eager"
                                    fetchPriority="high"
                                    onLoad={() => {
                                        clearTimeout(autoSwitchTimerRef.current);
                                        setIsIframeLoading(false);
                                    }}
                                    onError={handleServerError}
                                />
                            </div>

                            {/* Episode Navigation Buttons (Previous / Next) */}
                            <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
                                {prevEpisodeNum ? (
                                    <Link
                                        href={`/${locale}/tv/${slug}/season-${prevSeasonNum}/episode-${prevEpisodeNum}`}
                                        className="flex-1 sm:flex-none max-w-[48%] sm:max-w-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-gray-300 hover:text-white border border-white/10 text-[11px] sm:text-sm font-bold backdrop-blur-md transition-all duration-200 shadow-md group"
                                    >
                                        <i className={`fa-solid ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'} text-[10px] sm:text-xs group-hover:-translate-x-1 transition-transform text-red-500 flex-shrink-0`}></i>
                                        <span className="whitespace-nowrap truncate">{isAr ? 'الحلقة السابقة' : isFr ? 'Épisode Précédent' : 'Previous Episode'}</span>
                                    </Link>
                                ) : (
                                    <div className="flex-1 sm:flex-none" />
                                )}

                                {nextEpisodeNum ? (
                                    <Link
                                        href={`/${locale}/tv/${slug}/season-${nextSeasonNum}/episode-${nextEpisodeNum}`}
                                        className="flex-1 sm:flex-none max-w-[48%] sm:max-w-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border border-red-500/40 text-[11px] sm:text-sm font-extrabold shadow-lg shadow-red-600/30 transition-all duration-200 transform hover:scale-105 active:scale-95 group ml-auto"
                                    >
                                        <span className="whitespace-nowrap truncate">{isAr ? 'الحلقة التالية' : isFr ? 'Épisode Suivant' : 'Next Episode'}</span>
                                        <i className={`fa-solid ${isAr ? 'fa-arrow-left' : 'fa-arrow-right'} text-[10px] sm:text-xs group-hover:translate-x-1 transition-transform flex-shrink-0`}></i>
                                    </Link>
                                ) : (
                                    <div className="flex-1 sm:flex-none" />
                                )}
                            </div>
                        </div>
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

                            {/* 2. PUB SOUS LA DESCRIPTION (300x250) */}
                            <AdComponent
                                adKey="b7ca2ffee5ca2841019c2a47c86661ea"
                                width={300}
                                height={250}
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
                                                    <Image src={`${IMAGE_BASE_URL}/w185${ep.still_path}`} alt={ep.name || 'Episode thumbnail'} width={96} height={54} className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[10px] text-zinc-600">{noPreviewText}</div>
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-[9px] font-black tracking-tighter px-1.5 py-0.5 rounded text-gray-200">
                                                    EP {ep.episode_number}
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1 pt-0.5">
                                                <h3 className={`text-xs font-bold line-clamp-1 transition-colors ${isSelected ? 'text-red-400' : 'text-gray-200 group-hover/ep:text-white'}`}>
                                                    {ep.name || `Episode ${ep.episode_number}`}
                                                </h3>
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
                    adKey="b7ca2ffee5ca2841019c2a47c86661ea"
                    width={300}
                    height={250}
                    wrapperClassName="lg:hidden mb-4 rounded-lg shadow-lg"
                />

                {/* RECOMMANDATIONS */}
                <div className="w-full">
                    <h2 className="text-lg md:text-xl font-black tracking-wide uppercase mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-red-600 rounded-sm"></span> {moreShowsTitle}
                    </h2>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                        {similarShows.map((show) => (
                            <Link
                                href={`/${locale}/tv/${createSlug(show.name, show.id, 'tv')}/season-1/episode-1`}
                                key={show.id}
                                className="group flex flex-col bg-zinc-900/20 border border-white/5 rounded-lg overflow-hidden transition-all hover:scale-[1.03] hover:border-white/10 hover:shadow-xl cursor-pointer"
                            >
                                <div className="relative aspect-[2/3] w-full bg-zinc-950">
                                    {show.poster_path ? (
                                        <Image src={`${IMAGE_BASE_URL}/w342${show.poster_path}`} alt={show.name || 'TV poster'} width={200} height={300} sizes="(max-width: 640px) 110px, 200px" className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <Image src="/no-poster.png" alt={show.name || 'No Poster Available'} width={200} height={300} sizes="(max-width: 640px) 110px, 200px" className="w-full h-full object-cover" loading="lazy" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                        <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow">{watchNowBtnText}</span>
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-zinc-900/60 backdrop-blur-sm min-w-0">
                                    <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white transition-colors">{show.name}</h3>

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
