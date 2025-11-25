import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    if (router.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push(`/#${targetId}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <span className="text-2xl"></span>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Colombo Bookfair
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={(e) => handleSmoothScroll(e, 'home')}
              className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              Home
            </button>
            <button
              onClick={(e) => handleSmoothScroll(e, 'about')}
              className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              About
            </button>
            <button
              onClick={() => router.push('/map')}
              className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              View Stalls
            </button>
            <button
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              Contact
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button 
              onClick={() => router.push('/login')} 
              className="px-5 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/register')} 
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fadeIn">
            <div className="flex flex-col space-y-1">
              <button
                onClick={(e) => handleSmoothScroll(e, 'home')}
                className="px-4 py-3 text-left text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Home
              </button>
              <button
                onClick={(e) => handleSmoothScroll(e, 'about')}
                className="px-4 py-3 text-left text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                About
              </button>
              <button
                onClick={() => {
                  router.push('/map');
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 text-left text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View Stalls
              </button>
              <button
                onClick={(e) => handleSmoothScroll(e, 'contact')}
                className="px-4 py-3 text-left text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Contact
              </button>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button 
                  onClick={() => {
                    router.push('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    router.push('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
