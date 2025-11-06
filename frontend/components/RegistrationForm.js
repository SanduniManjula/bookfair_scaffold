import { useState, useEffect } from "react";
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

  // Add form-specific styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input:focus, textarea:focus {
        outline: none;
        border-color: #2563eb !important;
        border-width: 2px !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      a:hover {
        text-decoration: underline;
      }
      @media (max-width: 768px) {
        .form-card {
          padding: 2rem 1.5rem !important;
        }
        .form-title {
          font-size: 2rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Registration Successful!</h2>
          <p style={styles.successText}>
            Please check your email to confirm your account.
          </p>
          <p style={styles.successSubtext}>
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="form-card" style={styles.formCard}>
        <div style={styles.formHeader}>
          <h1 className="form-title" style={styles.title}>Create Your Account</h1>
          <p style={styles.subtitle}>
            Register your publishing business to reserve stalls at the Colombo International Bookfair.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Business Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Business Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.businessName ? styles.inputError : {}),
              }}
              placeholder="Enter your business name"
            />
            {errors.businessName && (
              <span style={styles.errorText}>{errors.businessName}</span>
            )}
          </div>

          {/* Contact Person */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Contact Person <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.contactPerson ? styles.inputError : {}),
              }}
              placeholder="Enter contact person name"
            />
            {errors.contactPerson && (
              <span style={styles.errorText}>{errors.contactPerson}</span>
            )}
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email Address <span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          {/* Phone Number */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Phone Number <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.phone ? styles.inputError : {}),
              }}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <span style={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          {/* Address */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Address <span style={styles.required}>*</span>
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="3"
              style={{
                ...styles.input,
                ...styles.textarea,
                ...(errors.address ? styles.inputError : {}),
              }}
              placeholder="Enter your business address"
            />
            {errors.address && (
              <span style={styles.errorText}>{errors.address}</span>
            )}
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Password <span style={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Confirm Password <span style={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {}),
              }}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span style={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* General Error */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              ...(isSubmitting ? styles.submitButtonDisabled : {}),
            }}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          {/* Login Link */}
          <div style={styles.loginLink}>
            <p style={styles.loginText}>
              Already have an account?{" "}
              <a href="/login" style={styles.loginAnchor}>
                Login
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Optional Right Side Graphic - Hidden on mobile */}
      <div style={styles.graphic}>
        <div style={styles.graphicContent}>
          <div style={styles.graphicIcon}>📚</div>
          <p style={styles.graphicText}>Join the largest book exhibition in Sri Lanka</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    marginTop: "80px", // Account for fixed navbar
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "3rem",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    width: "100%",
    zIndex: 1,
  },
  formHeader: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    lineHeight: "1.6",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#374151",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    transition: "all 0.3s",
    fontFamily: "inherit",
  },
  textarea: {
    resize: "vertical",
    minHeight: "80px",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: "2px",
  },
  errorText: {
    fontSize: "0.875rem",
    color: "#ef4444",
    marginTop: "0.25rem",
  },
  errorBox: {
    padding: "0.75rem",
    backgroundColor: "#fee2e2",
    borderRadius: "8px",
    border: "1px solid #ef4444",
  },
  submitButton: {
    padding: "1rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    marginTop: "0.5rem",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  loginLink: {
    textAlign: "center",
    marginTop: "1rem",
  },
  loginText: {
    fontSize: "0.95rem",
    color: "#6b7280",
  },
  loginAnchor: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500",
  },
  graphic: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    maxWidth: "400px",
  },
  graphicContent: {
    textAlign: "center",
  },
  graphicIcon: {
    fontSize: "6rem",
    marginBottom: "1rem",
  },
  graphicText: {
    fontSize: "1.2rem",
    color: "#4b5563",
    fontWeight: "500",
  },
  successContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    marginTop: "80px",
  },
  successCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "3rem",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  },
  successIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  successTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "1rem",
  },
  successText: {
    fontSize: "1.1rem",
    color: "#4b5563",
    marginBottom: "0.5rem",
  },
  successSubtext: {
    fontSize: "0.95rem",
    color: "#9ca3af",
    marginTop: "1rem",
  },
};

