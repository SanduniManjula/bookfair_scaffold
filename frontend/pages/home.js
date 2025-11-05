import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [genres, setGenres] = useState("");
  const [message, setMessage] = useState("");

  // On mount, load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push("/login"); // Redirect if not logged in
    }
  }, [router]);


  // Save genres to backend
  const handleSaveGenres = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/user/genres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          genres: genres
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Genres updated successfully!");
      } else {
        setMessage(data.error || "Error saving genres.");
      }
    } catch (err) {
      setMessage("Failed to connect to backend.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1>Welcome, {user.username || user.email}!</h1>
      <p>You're now logged into the Colombo Bookfair Portal 🎉</p>

      <div style={styles.actions}>
        <button
          onClick={() => router.push('/map')}
          style={styles.primaryButton}
        >
          Reserve a Stall
        </button>
        {user.role === 'ADMIN' && (
          <button
            onClick={() => router.push('/admin-panel')}
            style={styles.adminButton}
          >
            Admin Panel
          </button>
        )}
      </div>

      <form onSubmit={handleSaveGenres} style={styles.form}>
        <h3>Add Literary Genres</h3>
        <input
          type="text"
          placeholder="Ex: Fiction, History, Comics"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Save Genres</button>
      </form>

      {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

// ---------- Inline Styles ----------
const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    marginTop: "30px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  actions: {
    marginTop: "20px",
    marginBottom: "30px"
  },
  primaryButton: {
    padding: "15px 30px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginRight: "10px"
  },
  adminButton: {
    padding: "15px 30px",
    backgroundColor: "#ff9800",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  },
};
