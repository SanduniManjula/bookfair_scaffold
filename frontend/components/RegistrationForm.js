import { useState } from "react";
import { useRouter } from "next/router";

export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!form.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!form.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for backend
      // Backend User model expects: username (maps to business_name), email, password, genres (optional)
      // Store additional fields in genres as JSON for now
      const additionalInfo = {
        contactPerson: form.contactPerson,
        phone: form.phone,
        address: form.address,
      };

      const registrationData = {
        username: form.businessName, // username maps to business_name column in DB
        email: form.email,
        password: form.password,
        genres: JSON.stringify(additionalInfo), // Store contactPerson, phone, address as JSON in genres field
      };

      const res = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Registration failed");
      }

      // Show success message
      setSuccess(true);
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 mt-20 bg-gradient-to-br from-gray-50 via-blue-100 to-gray-200">
        <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-lg text-gray-600 mb-2">
            Please check your email to confirm your account.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-blue-100 to-gray-200">
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-2xl w-full z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Register your publishing business to reserve stalls at the Colombo International Bookfair.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Business Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              className={`px-4 py-3 text-base border rounded-lg transition-all font-sans ${
                errors.businessName 
                  ? "border-red-500 border-2" 
                  : "border-gray-300"
              }`}
              placeholder="Enter your business name"
            />
            {errors.businessName && (
              <span className="text-sm text-red-500 mt-1">{errors.businessName}</span>
            )}
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              className={`px-4 py-3 text-base border rounded-lg transition-all font-sans ${
                errors.contactPerson 
                  ? "border-red-500 border-2" 
                  : "border-gray-300"
              }`}
              placeholder="Enter contact person name"
            />
            {errors.contactPerson && (
              <span className="text-sm text-red-500 mt-1">{errors.contactPerson}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`px-4 py-3 text-base border rounded-lg transition-all font-sans ${
                errors.email 
                  ? "border-red-500 border-2" 
                  : "border-gray-300"
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span className="text-sm text-red-500 mt-1">{errors.email}</span>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`px-4 py-3 text-base border rounded-lg transition-all font-sans ${
                errors.phone 
                  ? "border-red-500 border-2" 
                  : "border-gray-300"
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <span className="text-sm text-red-500 mt-1">{errors.phone}</span>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="3"
              className={`px-4 py-3 text-base border rounded-lg transition-all font-sans resize-y min-h-[80px] ${
                errors.address 
                  ? "border-red-500 border-2" 
                  : "border-gray-300"
              }`}
              placeholder="Enter your business address"
            />
            {errors.address && (
              <span className="text-sm text-red-500 mt-1">{errors.address}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`px-4 py-3 text-base border rounded-lg transition-all font-sans ${
                errors.password 
                  ? "border-red-500 border-2" 
                  : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="text-sm text-red-500 mt-1">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`px-4 py-3 text-base border rounded-lg transition-all font-sans ${
                errors.confirmPassword 
                  ? "border-red-500 border-2" 
                  : "border-gray-300"
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className="text-sm text-red-500 mt-1">{errors.confirmPassword}</span>
            )}
          </div>

          {/* General Error */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-500">
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-4 text-lg font-semibold rounded-lg transition-all mt-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 font-medium hover:text-blue-700">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
