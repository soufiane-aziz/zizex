// Homepage Skeleton — professional shimmer effect, matches real page structure
export default function HomeLoading() {
    return (
        <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden">

            {/* Hero Skeleton — full screen, matches h-screen sm:h-[95vh] */}
            <div className="relative w-full h-screen sm:h-[95vh] overflow-hidden">
                {/* Base shimmer background */}
                <div className="absolute inset-0 skeleton" />
                {/* Gradient overlays matching real hero */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-transparent z-10 pointer-events-none" />

                {/* Hero content placeholder — bottom-left */}
                <div className="relative z-20 flex flex-col justify-end h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-24 w-full pb-14 sm:pb-16 pt-24">
                    <div className="max-w-xs sm:max-w-lg md:max-w-2xl flex flex-col gap-3 sm:gap-4">
                        {/* Genre badge */}
                        <div className="skeleton w-24 h-5 rounded-full opacity-60" />
                        {/* Title block */}
                        <div className="skeleton w-64 sm:w-96 md:w-[480px] h-10 sm:h-14 md:h-20 rounded-xl opacity-70" />
                        {/* Meta row: rating + type badge */}
                        <div className="flex gap-3 items-center">
                            <div className="skeleton w-20 h-7 rounded-md opacity-50" />
                            <div className="skeleton w-16 h-7 rounded-md opacity-50" />
                        </div>
                        {/* Watch Now button */}
                        <div className="skeleton w-40 h-12 sm:h-14 rounded-sm opacity-40 mt-1 bg-red-950" />
                    </div>
                </div>

                {/* Dot indicators — left-aligned matching real hero */}
                <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-8 md:left-24 z-30 flex gap-1.5 sm:gap-2 items-center">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="skeleton rounded-full opacity-60"
                            style={{ width: i === 0 ? '28px' : '8px', height: '8px' }}
                        />
                    ))}
                </div>
            </div>

            {/* Ad bar skeleton */}
            <div className="hidden sm:block mx-4 sm:mx-8 md:mx-16 mt-10 mb-2 skeleton h-[90px] rounded-xl opacity-40" />

            {/* Category Rows */}
            <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-12 lg:px-16 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6">
                {[...Array(5)].map((_, rowIdx) => (
                    <div key={rowIdx} className="flex flex-col gap-3 py-2">
                        {/* Row title */}
                        <div className="skeleton w-40 sm:w-52 h-5 sm:h-6 rounded-lg opacity-60" />
                        {/* Card row */}
                        <div className="flex gap-2 sm:gap-3 overflow-hidden">
                            {[...Array(9)].map((_, i) => (
                                <div
                                    key={i}
                                    className="skeleton flex-shrink-0 rounded-xl opacity-70"
                                    style={{
                                        width: 'clamp(100px, 13vw, 175px)',
                                        aspectRatio: '2/3',
                                        animationDelay: `${i * 80}ms`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
