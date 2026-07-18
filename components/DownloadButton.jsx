'use client';

import { useState } from 'react';
import { supabase } from '@supabase'; // Verify this path matches your Supabase client setup

export default function DownloadButton({ 
  filePath = "videoplayback.mp4", 
  fileName = "zShow-Trailer.mp4" 
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDownload = async () => {
    try {
      setIsDownloading(false);
      setIsDownloading(true);

      // 1. Download the binary chunk blob directly from your public bucket
      const { data, error } = await supabase.storage
        .from('media-assets')
        .download(filePath);

      if (error) throw error;

      // 2. Turn the raw binary data into a temporary browser object URL
      const blobUrl = URL.createObjectURL(data);
      
      // 3. Programmatically inject a hidden anchor tag to force download prompt
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      // 4. Clean up the DOM layout immediately to keep performance optimal
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Critical: Download pipeline failed:', error.message);
      alert('Unable to process the file stream. Please try again or check your network connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 active:scale-98 focus:outline-none select-none"
    >
      {isDownloading ? (
        <>
          {/* Animated SVG Premium Loading Spinner */}
          <svg 
            className="animate-spin h-4 w-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <span className="tracking-wide font-medium">Streaming File...</span>
        </>
      ) : (
        <>
          {/* FontAwesome Download Icon */}
          <i className="fa-solid fa-arrow-down text-sm transition-transform duration-300 group-hover:translate-y-[1px]"></i>
          <span className="tracking-wide">Download Trailer</span>
        </>
      )}
    </button>
  );
}