import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      //Success
      alert("Login successful!");
      await router.push("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          type="email"
          onChange={handleChange}
          required
        /><br />
        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
