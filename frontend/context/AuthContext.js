import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check of login status
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    setIsLoading(true);
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!(user && token));
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData, token) => {
    setIsLoading(true);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, checkLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}