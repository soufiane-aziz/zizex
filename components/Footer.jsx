export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#060608] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">FAQ</a></li>
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">Supported Devices</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">Terms of Use</a></li>
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-crimson-500 transition-colors">Cookie Preferences</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-dark-card border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-crimson-600 hover:border-crimson-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"><i className="fa-brands fa-twitter"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-dark-card border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-crimson-600 hover:border-crimson-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"><i className="fa-brands fa-facebook-f"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-dark-card border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-crimson-600 hover:border-crimson-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"><i className="fa-brands fa-instagram"></i></a>
                </div>
            </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-crimson-600">z<span className="text-white">Shows</span></span>
            </div>
            <p className="text-sm text-gray-500">© 2026 zShows. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}