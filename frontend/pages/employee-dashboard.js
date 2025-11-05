import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmployee = localStorage.getItem("employee");
    const token = localStorage.getItem("employeeToken");

    if (!savedEmployee || !token) {
      router.push("/employee-login");
      return;
    }

    setEmployee(JSON.parse(savedEmployee));
    loadStalls();
  }, [router]);

  const loadStalls = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      const res = await fetch("http://localhost:8085/api/employee/dashboard/stalls", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setStalls(data);
      }
    } catch (err) {
      console.error("Failed to load stalls:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStallColor = (stall) => {
    if (stall.reserved) return "#cccccc";
    switch (stall.size) {
      case "SMALL": return "#ffeb3b";
      case "MEDIUM": return "#ff9800";
      case "LARGE": return "#4caf50";
      default: return "#e0e0e0";
    }
  };

  const reservedCount = stalls.filter(s => s.reserved).length;
  const availableCount = stalls.length - reservedCount;

  if (!employee) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1>Employee Dashboard</h1>
      <p>Welcome, {employee.email}</p>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3>Total Stalls</h3>
          <p style={styles.statNumber}>{stalls.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Available</h3>
          <p style={{...styles.statNumber, color: "#4caf50"}}>{availableCount}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Reserved</h3>
          <p style={{...styles.statNumber, color: "#f44336"}}>{reservedCount}</p>
        </div>
      </div>

      <h2>Stall Availability</h2>
      {loading ? (
        <p>Loading stalls...</p>
      ) : (
        <div style={styles.mapContainer}>
          {stalls.map(stall => (
            <div
              key={stall.id}
              style={{
                ...styles.stallBox,
                backgroundColor: getStallColor(stall),
                opacity: stall.reserved ? 0.5 : 1
              }}
            >
              <strong>{stall.name}</strong>
              <div>{stall.size}</div>
              {stall.reserved && <div style={styles.reservedLabel}>Reserved</div>}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => {
        localStorage.removeItem("employee");
        localStorage.removeItem("employeeToken");
        router.push("/employee-login");
      }} style={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  stats: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px"
  },
  statCard: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    textAlign: "center"
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "10px 0"
  },
  mapContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "20px"
  },
  stallBox: {
    width: "150px",
    height: "120px",
    border: "2px solid #333",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center"
  },
  reservedLabel: {
    fontSize: "10px",
    color: "#666",
    marginTop: "5px"
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px"
  }
};

