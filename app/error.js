'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-4 text-center selection:bg-amber-500 selection:text-black">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center mb-6">
        <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
        Something went wrong
      </h1>
      <p className="text-sm sm:text-base text-gray-400 max-w-md mb-8 leading-relaxed">
        An unexpected error occurred while loading this page. You can try refreshing or returning home.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 border border-white/10"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

