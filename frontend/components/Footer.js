export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12 px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8 flex justify-center items-center gap-4 flex-wrap">
          <a href="#home" className="text-gray-300 text-sm hover:text-white transition-colors">Home</a>
          <span className="text-gray-600">|</span>
          <a href="#about" className="text-gray-300 text-sm hover:text-white transition-colors">About</a>
          <span className="text-gray-600">|</span>
          <a href="#contact" className="text-gray-300 text-sm hover:text-white transition-colors">Contact</a>
          <span className="text-gray-600">|</span>
          <a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">Terms</a>
        </div>
        <div className="mt-8">
          <p className="mb-2 text-gray-400 text-sm">
            Copyright © 2025 Colombo Bookfair
          </p>
          <p className="text-gray-400 text-sm">
            Organizer: Sri Lanka Book Publishers' Association
          </p>
        </div>
      </div>
    </footer>
  );
}
