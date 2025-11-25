export default function HowItWorks() {
  const steps = [
    {
      icon: "/images/register-icon.png",
      title: "Register your business",
      text: "Create an account and provide your business details to get started.",
    },
    {
      icon: "/images/select-stall-icon.png",
      title: "Select your preferred stall",
      text: "Browse the interactive map and choose the perfect location for your stall.",
    },
    {
      icon: "/images/qr-pass-icon.png",
      title: "Get your confirmation & QR pass",
      text: "Receive instant confirmation and a QR code for easy event access.",
    },
  ];

  return (
    <section id="reserve" className="py-24 px-8 bg-white text-center relative">
      <div className="absolute inset-0 bg-blue-100/10 -z-10"></div> {/* subtle blue mask */}
      <h2 className="text-4xl font-bold text-gray-900 mb-12">How It Works</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {steps.map((step, index) => (
          <div
            key={index}
            className="p-10 bg-gradient-to-br from-white to-blue-50 rounded-2xl text-center border border-gray-200 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer"
          >
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-blue-500 rounded-full">
              <img
                src={step.icon}
                alt={step.title}
                className="w-12 h-12"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
            <p className="text-base leading-relaxed text-gray-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
