import { useRouter } from "next/router";

export default function CTABanner() {
  const router = useRouter();

  return (
    <section style={styles.ctaBanner}>
      <div style={styles.ctaBannerContent}>
        <h2 className="cta-banner-title" style={styles.ctaBannerTitle}>
          Ready to showcase your books at the biggest event of the year?
        </h2>
        <button 
          onClick={() => router.push('/register')} 
          style={styles.ctaBannerButton}
        >
          Get Started →
        </button>
      </div>
    </section>
  );
}

const styles = {
  ctaBanner: {
    padding: "5rem 2rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textAlign: "center",
  },
  ctaBannerContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  ctaBannerTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "white",
    marginBottom: "2rem",
    lineHeight: "1.3",
  },
  ctaBannerButton: {
    padding: "1.2rem 3rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.2rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
};

