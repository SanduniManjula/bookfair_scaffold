import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav style={styles.navbar}>
      <div className="nav-container" style={styles.navContainer}>
        <div style={styles.logo} onClick={() => router.push('/')}>
          📚 Colombo Bookfair
        </div>
        <div className="menu-items" style={styles.menuItems}>
          <a href="#home" style={styles.menuLink}>Home</a>
          <a href="#about" style={styles.menuLink}>About</a>
          <a href="#reserve" style={styles.menuLink}>Reserve Stalls</a>
          <a href="#contact" style={styles.menuLink}>Contact</a>
        </div>
        <div style={styles.navButtons}>
          <button 
            onClick={() => router.push('/login')} 
            style={styles.loginButton}
          >
            Login
          </button>
          <button 
            onClick={() => router.push('/register')} 
            style={styles.registerButton}
          >
            Register
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    padding: "1rem 0",
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2rem",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    cursor: "pointer",
  },
  menuItems: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  },
  menuLink: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "color 0.3s",
  },
  navButtons: {
    display: "flex",
    gap: "1rem",
  },
  loginButton: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "transparent",
    color: "#333",
    border: "1px solid #333",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  registerButton: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.3s",
  },
};

