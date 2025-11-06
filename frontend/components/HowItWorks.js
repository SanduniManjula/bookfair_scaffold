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
    <section id="reserve" className="py-24 px-8 bg-white text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-12">How It Works</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {steps.map((step, index) => (
          <div key={index} className="step-card p-10 bg-gray-50 rounded-xl text-center transition-all border border-gray-200 cursor-pointer">
            <div className="text-5xl mb-6">{step.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
            <p className="text-base leading-relaxed text-gray-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
