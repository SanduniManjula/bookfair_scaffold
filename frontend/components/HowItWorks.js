export default function HowItWorks() {
  const steps = [
    {
      icon: "1️⃣",
      title: "Register your business",
      text: "Create an account and provide your business details to get started.",
    },
    {
      icon: "2️⃣",
      title: "Select your preferred stall",
      text: "Browse the interactive map and choose the perfect location for your stall.",
    },
    {
      icon: "3️⃣",
      title: "Get your confirmation & QR pass",
      text: "Receive instant confirmation and a QR code for easy event access.",
    },
  ];

  return (
    <section id="reserve" style={styles.howItWorks}>
      <h2 className="section-title" style={styles.sectionTitle}>How It Works</h2>
      <div className="steps-container" style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={index} className="step-card" style={styles.stepCard}>
            <div style={styles.stepIcon}>{step.icon}</div>
            <h3 style={styles.stepTitle}>{step.title}</h3>
            <p style={styles.stepText}>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  howItWorks: {
    padding: "6rem 2rem",
    backgroundColor: "white",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "3rem",
  },
  stepsContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "2.5rem",
  },
  stepCard: {
    padding: "2.5rem",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    textAlign: "center",
    transition: "transform 0.3s, box-shadow 0.3s",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
  },
  stepIcon: {
    fontSize: "3rem",
    marginBottom: "1.5rem",
  },
  stepTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "1rem",
  },
  stepText: {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#6b7280",
  },
};

