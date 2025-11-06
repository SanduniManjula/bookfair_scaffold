import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import HowItWorks from "../components/HowItWorks";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";
import GlobalStyles from "../components/GlobalStyles";
import { useSmoothScroll } from "../hooks/useSmoothScroll";

export default function Home() {
  useSmoothScroll();

  return (
    <div style={styles.page}>
      <GlobalStyles />
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  );
}

const styles = {
  page: {
    margin: 0,
    padding: 0,
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    overflowX: "hidden",
  },
};
