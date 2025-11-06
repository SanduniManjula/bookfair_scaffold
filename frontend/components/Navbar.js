import { useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md py-4">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          <div 
            className="text-xl md:text-2xl font-bold text-gray-900 cursor-pointer"
            onClick={() => router.push('/')}
          >
            📚 Colombo Bookfair
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Home</a>
            <a href="#about" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">About</a>
            <a href="#reserve" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Reserve Stalls</a>
            <a href="#contact" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex gap-4">
            <button 
              onClick={() => router.push('/login')} 
              className="px-6 py-2 bg-transparent text-gray-700 border border-gray-700 rounded-md cursor-pointer text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/register')} 
              className="px-6 py-2 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Register
            </button>
          </div>
          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4">
            <a href="#home" className="text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#about" className="text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#reserve" className="text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Reserve Stalls</a>
            <a href="#contact" className="text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => router.push('/login')} 
                className="px-6 py-2 bg-transparent text-gray-700 border border-gray-700 rounded-md cursor-pointer text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/register')} 
                className="px-6 py-2 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
