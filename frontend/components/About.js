export default function About() {
  return (
    <section id="about" style={styles.about}>
      <div className="about-container" style={styles.aboutContainer}>
        <div style={styles.aboutContent}>
          <h2 className="section-title" style={styles.sectionTitle}>
            About the Exhibition
          </h2>
          <p style={styles.aboutText}>
            The Colombo International Bookfair brings together publishers, authors, and readers every year. 
            Reserve your space and be part of the country's largest literary event. With thousands of visitors 
            and hundreds of exhibitors, this is the perfect platform to showcase your books and connect with 
            the literary community.
          </p>
        </div>
        <div style={styles.aboutImage}>
          <div style={styles.placeholderImage}>
            📖📚✨
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  about: {
    padding: "6rem 2rem",
    backgroundColor: "#f9fafb",
  },
  aboutContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
  },
  aboutContent: {
    padding: "2rem",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "1.5rem",
  },
  aboutText: {
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#4b5563",
  },
  aboutImage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderImage: {
    width: "100%",
    height: "300px",
    backgroundColor: "#e5e7eb",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "4rem",
    color: "#9ca3af",
  },
};

