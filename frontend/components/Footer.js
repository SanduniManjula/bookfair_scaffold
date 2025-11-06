export default function Footer() {
  return (
    <footer id="contact" style={styles.footer}>
      <div style={styles.footerContainer}>
        <div style={styles.footerLinks}>
          <a href="#home" style={styles.footerLink}>Home</a>
          <span style={styles.footerSeparator}>|</span>
          <a href="#about" style={styles.footerLink}>About</a>
          <span style={styles.footerSeparator}>|</span>
          <a href="#contact" style={styles.footerLink}>Contact</a>
          <span style={styles.footerSeparator}>|</span>
          <a href="#" style={styles.footerLink}>Terms</a>
        </div>
        <div style={styles.footerInfo}>
          <p style={styles.copyright}>
            Copyright © 2025 Colombo Bookfair
          </p>
          <p style={styles.organizer}>
            Organizer: Sri Lanka Book Publishers' Association
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: "3rem 2rem",
  },
  footerContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
  },
  footerLinks: {
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "color 0.3s",
  },
  footerSeparator: {
    color: "#6b7280",
  },
  footerInfo: {
    marginTop: "2rem",
  },
  copyright: {
    marginBottom: "0.5rem",
    color: "#9ca3af",
    fontSize: "0.9rem",
  },
  organizer: {
    color: "#9ca3af",
    fontSize: "0.9rem",
  },
};

