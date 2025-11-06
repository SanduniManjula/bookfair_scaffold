import { useEffect } from "react";

export default function GlobalStyles() {
  useEffect(() => {
    // Add smooth scroll to HTML
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
      a[href^="#"] {
        transition: color 0.3s ease;
      }
      a[href^="#"]:hover {
        color: #2563eb !important;
      }
      button {
        transition: all 0.3s ease;
      }
      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
      }
      button:active {
        transform: translateY(0);
      }
      .step-card {
        transition: all 0.3s ease;
      }
      .step-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
      }
      @media (max-width: 768px) {
        .hero-heading {
          font-size: 2rem !important;
        }
        .hero-subtext {
          font-size: 1rem !important;
        }
        .about-container {
          grid-template-columns: 1fr !important;
        }
        .steps-container {
          grid-template-columns: 1fr !important;
        }
        .nav-container {
          flex-direction: column;
          gap: 1rem;
          padding: 0 1rem !important;
        }
        .menu-items {
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem !important;
        }
        .section-title {
          font-size: 2rem !important;
        }
        .cta-banner-title {
          font-size: 1.8rem !important;
        }
      }
      @media (max-width: 480px) {
        .hero-heading {
          font-size: 1.5rem !important;
        }
        .hero-subtext {
          font-size: 0.9rem !important;
        }
        .hero-buttons {
          flex-direction: column;
          width: 100%;
        }
        .hero-buttons button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return null;
}

