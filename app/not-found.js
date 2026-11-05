import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-4 text-center selection:bg-amber-500 selection:text-black">
      <div className="relative mb-6">
        <h1 className="text-8xl sm:text-9xl font-black text-white/5 tracking-widest select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl sm:text-5xl font-black text-amber-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            404
          </span>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-sm sm:text-base text-gray-400 max-w-md mb-8 leading-relaxed">
        The movie, show, or page you are looking for doesn&apos;t exist or may have been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/20"
        >
          Back to Home
        </Link>
        <Link
          href="/en/movies"
          className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 border border-white/10"
        >
          Explore Movies
        </Link>
        <Link
          href="/en/tv"
          className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 border border-white/10"
        >
          Explore TV Shows
        </Link>
      </div>
    </div>
  );
}

