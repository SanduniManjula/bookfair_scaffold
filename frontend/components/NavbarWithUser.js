import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function NavbarWithUser() {
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
            <a href="/" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Home</a>
            <a href="/#about" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">About</a>
            <a href="/map" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Reserve Stalls</a>
            <a href="/#contact" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {user.username || user.email}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <a
                      href="/home"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
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
            <a href="/" className="text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="/#about" className="text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="/map" className="text-blue-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>Reserve Stalls</a>
            <a href="/#contact" className="text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <a href="/home" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">Dashboard</a>
                  <button onClick={handleLogout} className="px-6 py-2 bg-red-500 text-white rounded-md text-sm font-medium">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => router.push('/login')} className="px-6 py-2 bg-transparent text-gray-700 border border-gray-700 rounded-md text-sm font-medium">Login</button>
                  <button onClick={() => router.push('/register')} className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">Register</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

