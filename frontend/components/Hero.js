import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center p-8 mt-20 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bookfair-hero.jpg')" }}
    >
      {/* Blue overlay mask */}
      <div className="absolute inset-0 bg-blue-900/60"></div>

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl text-center text-white">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
          Reserve Your Stall at the Colombo International Bookfair 2025
        </h1>

        <p className="text-xl md:text-2xl mb-10 leading-relaxed opacity-95">
          Join Sri Lanka's largest book exhibition and showcase your collection to thousands of readers.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={() => router.push('/register')}
            className="px-10 py-4 bg-green-500 text-white border-none rounded-lg text-lg font-semibold cursor-pointer shadow-lg hover:bg-green-600 transition-all"
          >
            Reserve Now →
          </button>
          <button
            onClick={() => router.push('/map')}
            className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-lg text-lg font-semibold cursor-pointer hover:bg-white/10 transition-all"
          >
            View Available Stalls
          </button>
        </div>
      </div>
    </section>
  );
}
