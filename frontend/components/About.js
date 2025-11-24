export default function About() {
  return (
    <section id="about" className="py-24 px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text Section */}
        <div className="p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            About the Exhibition
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 mb-6">
            The Colombo International Bookfair brings together publishers, authors, and readers every year.
            Reserve your space and be part of the country's largest literary event. With thousands of visitors
            and hundreds of exhibitors, this is the perfect platform to showcase your books and connect with
            the literary community.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
          >
            Reserve Your Stall
          </button>
        </div>

        {/* Image Section */}
        <div className="flex items-center justify-center relative">
          <div className="w-full h-72 md:h-96 relative rounded-xl overflow-hidden shadow-xl">
            <img src="/images/bookfair-about.jpg" alt="Colombo Bookfair" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
