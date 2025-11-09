import '../styles/globals.css';
import NavbarWithUser from '../components/NavbarWithUser';
import Navbar from '../components/Navbar';
import { AuthProvider, useAuth } from '../context/AuthContext';

function AppContent({ Component, pageProps }) {
  const { isLoggedIn, isLoading } = useAuth();

  // Don't render any navbar during the loading state
  if (isLoading) {
    return (
      <div className="mt-24">
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? <NavbarWithUser /> : <Navbar />}
      <div className="mt-24">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

