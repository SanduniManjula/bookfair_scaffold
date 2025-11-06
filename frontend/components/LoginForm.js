import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Try parsing JSON safely
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      // Handle errors
      if (!res.ok || data.error) {
        throw new Error(data.error || "Login failed. Please check credentials.");
      }

      // Save user and token to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Success - redirect to home
      router.push("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 mt-20 bg-gradient-to-br from-gray-50 via-blue-100 to-gray-200">
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Log in to manage your stall reservations and profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-3 text-base border border-gray-300 rounded-lg transition-all font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-3 text-base border border-gray-300 rounded-lg transition-all font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a 
              href="#" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement forgot password functionality
                alert("Forgot password feature coming soon!");
              }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-500 animate-fadeIn">
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-4 text-lg font-semibold rounded-lg transition-all ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-600 font-medium hover:text-blue-700">
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

