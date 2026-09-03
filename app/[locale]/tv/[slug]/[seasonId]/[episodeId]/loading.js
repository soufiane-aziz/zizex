// TV Episode Watch Page Skeleton — professional shimmer, no navbar skeleton
export default function TVEpisodeLoading() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pb-16">

            <main className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col gap-6 mb-2">

                {/* Ad bar */}
                <div className="hidden sm:block skeleton w-full h-[90px] rounded-xl opacity-40" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Server Selection */}
                        <div className="bg-zinc-900/40 border border-white/5 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="skeleton w-28 h-4 rounded-full opacity-50 flex-shrink-0" />
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="skeleton h-9 rounded-lg opacity-60"
                                        style={{ animationDelay: `${i * 60}ms` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Video Player — 16:9 */}
                        <div className="skeleton w-full h-[calc(56.25vw+10px)] sm:h-auto sm:aspect-video rounded-xl opacity-80" />

                        {/* Metadata */}
                        <div className="p-1 flex flex-col gap-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="skeleton w-56 sm:w-80 h-9 md:h-12 rounded-xl opacity-70" />
                                <div className="flex gap-2">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="skeleton w-16 h-7 rounded-lg opacity-50" />
                                    ))}
                                </div>
                            </div>
                            {/* Genre chips */}
                            <div className="flex gap-2 flex-wrap">
                                {[5, 7, 6, 8].map((w, i) => (
                                    <div key={i} className="skeleton h-6 rounded-full opacity-40" style={{ width: `${w * 10}px` }} />
                                ))}
                            </div>
                            {/* Overview */}
                            <div className="flex flex-col gap-2 mt-1">
                                <div className="skeleton w-full h-3 rounded-full opacity-40" />
                                <div className="skeleton w-5/6 h-3 rounded-full opacity-40" style={{ animationDelay: '80ms' }} />
                                <div className="skeleton w-2/3 h-3 rounded-full opacity-40" style={{ animationDelay: '160ms' }} />
                            </div>
                        </div>

                        {/* Season & Episode Selector */}
                        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex flex-col gap-4">
                            {/* Season row */}
                            <div className="flex items-center gap-3">
                                <div className="skeleton w-20 h-4 rounded-full opacity-50" />
                                <div className="skeleton w-36 h-9 rounded-lg opacity-60" />
                            </div>
                            {/* Episode number grid */}
                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="skeleton aspect-square rounded-lg opacity-60"
                                        style={{ animationDelay: `${(i % 10) * 40}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="flex flex-col gap-4">
                        <div className="skeleton w-36 h-5 rounded-lg opacity-60" />
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-center" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="skeleton w-16 h-24 rounded-lg flex-shrink-0 opacity-70" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="skeleton w-full h-4 rounded-full opacity-60" />
                                    <div className="skeleton w-3/4 h-3 rounded-full opacity-40" />
                                    <div className="skeleton w-1/2 h-3 rounded-full opacity-30" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Grid */}
                <div className="flex flex-col gap-4">
                    <div className="skeleton w-52 h-5 rounded-lg opacity-60" />
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {[...Array(16)].map((_, i) => (
                            <div
                                key={i}
                                className="skeleton aspect-[2/3] rounded-xl opacity-70"
                                style={{ animationDelay: `${(i % 8) * 50}ms` }}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
