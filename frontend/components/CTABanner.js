import { useRouter } from "next/router";

export default function CTABanner() {
  const router = useRouter();

  return (
    <section className="py-20 px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
          Ready to showcase your books at the biggest event of the year?
        </h2>
        <button 
          onClick={() => router.push('/register')} 
          className="px-12 py-5 bg-green-500 text-white border-none rounded-lg text-xl font-semibold cursor-pointer shadow-lg hover:bg-green-600 transition-all"
        >
          Get Started →
        </button>
      </div>
    </section>
  );
}
