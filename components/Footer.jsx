'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'faq' | 'terms' | 'privacy' | 'dmca' | null

  const closeModal = () => setActiveModal(null);

  const faqItems = [
    {
      q: "What exactly is Zizex?",
      a: "Zizex is an advanced, high-performance media discovery platform engineered to help cinephiles browse, track, and locate content across global streaming architectures. We synthesize metadata to deliver a fluid browsing experience."
    },
    {
      q: "Can I stream or watch movies directly on Zizex?",
      a: "No. Zizex is strictly a metadata aggregator, discovery engine, and cataloging tool. We do not host, stream, or redistribute any copyrighted digital media files. Instead, we direct you to official legal streaming platforms."
    },
    {
      q: "Where does the movie and TV data come from?",
      a: "Our entire structural ecosystem is driven dynamically by the public TMDB API. This ensures real-time updates for trending global charts, dynamic synopsis architectures, cast directories, and high-resolution cover artwork."
    },
    {
      q: "Is Zizex free to use?",
      a: "Yes. Zizex is a non-commercial, open web application built for optimization, personal portfolio demonstration, and community media discovery."
    }
  ];

  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 pt-12 pb-8 md:pt-16 mt-20 relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Main Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10 mb-12 md:mb-16">
          
          {/* Brand & Description */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link href="/" className="font-black text-3xl tracking-wide text-white focus:outline-none w-max">
              <span className="text-red-600">Ziz</span><span className="text-white">ex</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              Stream your favorite movies and TV shows for free in HD on Zizex. The ultimate destination for movie lovers.
            </p>
          </div>

          {/* Explore Links - HIDDEN ON MOBILE, SHOWS ON TABLET/DESKTOP */}
          <div className="hidden md:flex flex-col gap-4 col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Explore</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link href={`/${locale}`} className="hover:text-red-500 transition-colors duration-200">Home</Link></li>
              <li><Link href={`/${locale}/movies`} className="hover:text-red-500 transition-colors duration-200">Movies</Link></li>
              <li><Link href={`/${locale}/tv`} className="hover:text-red-500 transition-colors duration-200">TV Shows</Link></li>
              <li><Link href={`/${locale}/top-rated`} className="hover:text-red-500 transition-colors duration-200">Top Rated</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1 flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Company</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li>
                <button 
                  onClick={() => setActiveModal('about')} 
                  className="hover:text-red-500 transition-colors duration-200 text-left focus:outline-none cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('faq')} 
                  className="hover:text-red-500 transition-colors duration-200 text-left focus:outline-none cursor-pointer"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('contact')} 
                  className="hover:text-red-500 transition-colors duration-200 text-left focus:outline-none cursor-pointer"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-1 flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Legal</h4>
            <ul className="space-y-3 text-sm text-zinc-500 flex flex-col items-start">
              <li>
                <button 
                  onClick={() => setActiveModal('terms')} 
                  className="hover:text-red-500 transition-colors duration-200 text-left focus:outline-none cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('privacy')} 
                  className="hover:text-red-500 transition-colors duration-200 text-left focus:outline-none cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('dmca')} 
                  className="hover:text-red-500 transition-colors duration-200 text-left focus:outline-none cursor-pointer"
                >
                  DMCA
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/60 pt-8 flex flex-col lg:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="text-xs text-zinc-500 text-center lg:text-left">
            <p className="font-medium text-zinc-400">
              &copy; {new Date().getFullYear()} Zizex. All rights reserved.
            </p>
          </div>
          
          <div className="text-xs text-zinc-500 text-center lg:text-right max-w-md leading-relaxed">
            <p>
              This product uses the{' '}
              <a 
                href="https://www.themoviedb.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-300 font-semibold hover:text-red-500 transition-colors"
              >
                TMDB API
              </a>{' '}
              but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>

      </div>

      {/* Embedded Modal Manager */}
      {activeModal && (
        <div 
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[85vh]"
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            {/* CONTENT: ABOUT US */}
            {activeModal === 'about' && (
              <>
                <div className="mb-6 pr-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    About <span className="text-red-600">Ziz</span><span className="text-white">ex</span>
                  </h3>
                  <div className="h-[2px] w-12 bg-red-600 mt-2.5 rounded"></div>
                </div>
                <div className="space-y-5 text-sm text-zinc-400 leading-relaxed">
                  <p>
                    Welcome to <strong className="text-zinc-100">Zizex</strong>, an advanced data-driven media tracking index and exploration architecture built explicitly for digital cinema enthusiasts.
                  </p>
                  <p>
                    Our mission is to eliminate the systematic friction of discovering content across highly fragmented digital networks. By parsing scalable public data infrastructure arrays, Zizex provides responsive filtering, comprehensive cast mapping, real-time community media discovery, and historical television tracking matrices inside a unified, high-end dashboard.
                  </p>
                  <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-900 italic">
                    Disclaimer: This deployment operates entirely on client-side routing and external dynamic pipelines. No copyrighted stream components or storage paradigms exist within our internal cluster schemas.
                  </p>
                </div>
              </>
            )}

            {/* CONTENT: FAQ */}
            {activeModal === 'faq' && (
              <>
                <div className="mb-8 pr-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Frequently Asked Questions
                  </h3>
                  <div className="h-[2px] w-12 bg-red-600 mt-2.5 rounded"></div>
                </div>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <details 
                      key={index} 
                      className="group border border-zinc-900 rounded-xl bg-zinc-900/20 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex items-center justify-between p-4 cursor-pointer select-none text-sm font-medium text-zinc-200 hover:bg-zinc-900/50 hover:text-white transition-all list-none">
                        <span className="pr-4">{item.q}</span>
                        <i className="fa-solid fa-chevron-down text-xs text-zinc-500 group-open:rotate-180 transition-transform duration-300 flex-shrink-0"></i>
                      </summary>
                      <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed bg-zinc-950/40 border-t border-zinc-900/40">
                        <p>{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </>
            )}

            {/* CONTENT: TERMS OF SERVICE */}
            {activeModal === 'terms' && (
              <>
                <div className="mb-6 pr-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Terms of Service
                  </h3>
                  <div className="h-[2px] w-12 bg-red-600 mt-2.5 rounded"></div>
                </div>
                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                  <p className="text-xs text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <p>
                    By accessing and using <strong className="text-zinc-100">Zizex</strong>, you automatically agree to abide by these Terms of Service. This platform functions purely as an open search directory and dynamic user interface layout.
                  </p>
                  <h4 className="text-white font-medium text-base pt-2">1. Use of Service</h4>
                  <p>
                    You agree to use this application only for legal, personal, and informational purposes. Automated data extraction, scraping, or heavy denial-of-service tasks targeted at our client interfaces or our underlying third-party API providers are strictly prohibited.
                  </p>
                  <h4 className="text-white font-medium text-base pt-2">2. Limitation of Liability</h4>
                  <p>
                    Zizex aggregates external metadata and imagery dynamically. We do not warrant or guarantee the complete absolute accuracy, timestamp completeness, or persistent online availability of data fields fetched via public communication wrappers.
                  </p>
                </div>
              </>
            )}

            {/* CONTENT: PRIVACY POLICY */}
            {activeModal === 'privacy' && (
              <>
                <div className="mb-6 pr-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Privacy Policy
                  </h3>
                  <div className="h-[2px] w-12 bg-red-600 mt-2.5 rounded"></div>
                </div>
                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                  <p className="text-xs text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <p>
                    At <strong className="text-zinc-100">Zizex</strong>, we respect user privacy. This privacy policy highlights our commitment to data transparency.
                  </p>
                  <h4 className="text-white font-medium text-base pt-2">Data Collection & Cookies</h4>
                  <p>
                    Zizex does not require profile configurations, billing information, or backend record-keeping. We do not collect, track, store, or trade any personal user analytics. 
                  </p>
                  <p>
                    We may utilize minimal client-side browser storage (such as LocalStorage or basic session tokens) simply to retain interface configurations and user visual settings. Third-party data services (like TMDB) handle network queries under their own distinct analytical policies.
                  </p>
                </div>
              </>
            )}

            {/* CONTENT: DMCA */}
            {activeModal === 'dmca' && (
              <>
                <div className="mb-6 pr-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    DMCA & Copyright Compliance
                  </h3>
                  <div className="h-[2px] w-12 bg-red-600 mt-2.5 rounded"></div>
                </div>
                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                  <p>
                    <strong className="text-zinc-100">Zizex</strong> takes copyright security and DMCA guidelines very seriously. 
                  </p>
                  <h4 className="text-white font-medium text-base pt-2">No Hosting Statement</h4>
                  <p>
                    This application operates strictly as an interactive visual interface. We do not host, store, stream, upload, or possess any video files, media files, or multimedia records on our servers or cloud storage objects.
                  </p>
                  <h4 className="text-white font-medium text-base pt-2">Data Inquiries</h4>
                  <p>
                    All localized titles, descriptions, synthetic data logs, and graphic assets displayed here are rendered directly via the public TMDB API architecture. If you wish to request a content takedown, please address structural asset modifications directly to the source provider at <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">themoviedb.org</a>.
                  </p>
                </div>
              </>
            )}

            {/* CONTENT: CONTACT SUPPORT */}
            {activeModal === 'contact' && (
              <>
                <div className="mb-6 pr-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Contact <span className="text-red-600">Ziz</span>Hub Support
                  </h3>
                  <div className="h-[2px] w-12 bg-red-600 mt-2.5 rounded"></div>
                </div>
                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                  <p>
                    Have questions, suggestions, or technical feedback? We are here to help!
                  </p>
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-2">
                    <p className="text-white font-medium flex items-center gap-2">
                      <i className="fa-solid fa-envelope text-red-500"></i> Email Support
                    </p>
                    <p className="text-zinc-400 text-xs">
                      Send us an email anytime at <a href="mailto:a.soufiane.dev@gmail.com" className="text-red-400 underline">a.soufiane.dev@gmail.com</a> or reach out through our official community channels.
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 pt-2">
                    Our team typically responds to inquiry tickets within 24–48 hours.
                  </p>
                </div>
              </>
            )}

            {/* Modal Closer Trigger Button */}
            <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all focus:outline-none cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}