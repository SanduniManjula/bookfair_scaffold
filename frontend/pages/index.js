import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import HowItWorks from "../components/HowItWorks";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";
import { useSmoothScroll } from "../hooks/useSmoothScroll";

export default function Home() {
  useSmoothScroll();

  return (
    <div className="m-0 p-0 font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  );
}
