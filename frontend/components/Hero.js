import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();

  return (
    <section id="home" style={styles.hero}>
      <div style={styles.heroOverlay}></div>
      <div style={styles.heroContent}>
        <h1 className="hero-heading" style={styles.heroHeading}>
          Reserve Your Stall at the Colombo International Bookfair 2025
        </h1>
        <p className="hero-subtext" style={styles.heroSubtext}>
          Join Sri Lanka's largest book exhibition and showcase your collection to thousands of readers.
        </p>
        <div className="hero-buttons" style={styles.heroButtons}>
          <button 
            onClick={() => router.push('/register')} 
            style={styles.ctaPrimary}
          >
            Reserve Now →
          </button>
          <button 
            onClick={() => router.push('/map')} 
            style={styles.ctaSecondary}
          >
            View Available Stalls
          </button>
        </div>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cpattern id=\"grid\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"%3E%3Cpath d=\"M 100 0 L 0 0 0 100\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"1\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/%3E%3C/svg%3E')",
    padding: "2rem",
    marginTop: "80px",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(2px)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "900px",
    textAlign: "center",
    color: "white",
  },
  heroHeading: {
    fontSize: "3.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    lineHeight: "1.2",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  },
  heroSubtext: {
    fontSize: "1.3rem",
    marginBottom: "2.5rem",
    lineHeight: "1.6",
    opacity: 0.95,
  },
  heroButtons: {
    display: "flex",
    gap: "1.5rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaPrimary: {
    padding: "1rem 2.5rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  ctaSecondary: {
    padding: "1rem 2.5rem",
    backgroundColor: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
};

