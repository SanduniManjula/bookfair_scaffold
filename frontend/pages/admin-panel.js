import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'reservations'

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    // Check if user is admin
    if (userData.role !== 'ADMIN') {
      setMessage('Access denied. Admin role required.');
      setTimeout(() => router.push('/home'), 2000);
      return;
    }
    
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load stats
      const statsRes = await fetch('http://localhost:8081/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Load users
      const usersRes = await fetch('http://localhost:8081/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      
      // Load reservations
      const resRes = await fetch('http://localhost:8081/api/admin/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resRes.ok) {
        const resData = await resRes.json();
        setReservations(resData.reservations || []);
      }
      
    } catch (err) {
      console.error('Failed to load data:', err);
      setMessage('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('User role updated successfully!');
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to update role');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Failed to update user role.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their reservations.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('User deleted successfully!');
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to delete user');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Failed to delete user.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to delete this reservation? The stall will become available again.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/api/admin/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Reservation deleted successfully!');
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to delete reservation');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Failed to delete reservation.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={styles.container}>
        <p>{message || 'Loading...'}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Admin Panel</h1>
        <div style={styles.headerActions}>
          <button onClick={() => router.push('/home')} style={styles.backButton}>
            Back to Home
          </button>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div style={styles.message(message.includes('success') || message.includes('updated'))}>
          {message}
        </div>
      )}

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('stats')}
          style={{...styles.tabButton, ...(activeTab === 'stats' ? styles.activeTab : {})}}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{...styles.tabButton, ...(activeTab === 'users' ? styles.activeTab : {})}}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          style={{...styles.tabButton, ...(activeTab === 'reservations' ? styles.activeTab : {})}}
        >
          Reservations ({reservations.length})
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div style={styles.statsContainer}>
          <h2>Dashboard Statistics</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statCardH3}>{stats.totalUsers}</h3>
              <p style={styles.statCardP}>Total Users</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statCardH3}>{stats.adminUsers}</h3>
              <p style={styles.statCardP}>Admin Users</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statCardH3}>{stats.regularUsers}</h3>
              <p style={styles.statCardP}>Regular Users</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statCardH3}>{stats.totalReservations}</h3>
              <p style={styles.statCardP}>Total Reservations</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div style={styles.tableContainer}>
          <h2>User Management</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableTh}>ID</th>
                <th style={styles.tableTh}>Username</th>
                <th style={styles.tableTh}>Email</th>
                <th style={styles.tableTh}>Role</th>
                <th style={styles.tableTh}>Reservations</th>
                <th style={styles.tableTh}>Created At</th>
                <th style={styles.tableTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.tableTd}>{u.id}</td>
                  <td style={styles.tableTd}>{u.username}</td>
                  <td style={styles.tableTd}>{u.email}</td>
                  <td style={styles.tableTd}>
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      style={styles.roleSelect}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={styles.tableTd}>{u.reservationCount}</td>
                  <td style={styles.tableTd}>{new Date(u.createdAt).toLocaleString()}</td>
                  <td style={styles.tableTd}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      style={u.id === user.id ? {...styles.deleteButton, ...styles.deleteButtonDisabled} : styles.deleteButton}
                      disabled={u.id === user.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div style={styles.tableContainer}>
          <h2>Reservation Management</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableTh}>ID</th>
                <th style={styles.tableTh}>User</th>
                <th style={styles.tableTh}>Email</th>
                <th style={styles.tableTh}>Stall</th>
                <th style={styles.tableTh}>Size</th>
                <th style={styles.tableTh}>Created At</th>
                <th style={styles.tableTh}>QR Code</th>
                <th style={styles.tableTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td style={styles.tableTd}>{r.id}</td>
                  <td style={styles.tableTd}>{r.username}</td>
                  <td style={styles.tableTd}>{r.userEmail}</td>
                  <td style={styles.tableTd}>{r.stallName}</td>
                  <td style={styles.tableTd}>{r.stallSize}</td>
                  <td style={styles.tableTd}>{new Date(r.createdAt).toLocaleString()}</td>
                  <td style={styles.tableTd}>{r.qrCodeFilename || 'N/A'}</td>
                  <td style={styles.tableTd}>
                    <button
                      onClick={() => handleDeleteReservation(r.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '2px solid #ddd'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  message: (isSuccess) => ({
    padding: '15px',
    backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
    color: isSuccess ? '#155724' : '#721c24',
    borderRadius: '5px',
    marginBottom: '20px'
  }),
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #ddd'
  },
  tabButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'normal'
  },
  activeTab: {
    borderBottom: '3px solid #0070f3',
    fontWeight: 'bold',
    color: '#0070f3'
  },
  statsContainer: {
    marginTop: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  statCard: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statCardH3: {
    fontSize: '32px',
    margin: '0 0 10px 0',
    color: '#0070f3'
  },
  statCardP: {
    margin: '0',
    color: '#666',
    fontSize: '14px'
  },
  tableContainer: {
    marginTop: '20px',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  tableTh: {
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold'
  },
  tableTd: {
    padding: '12px',
    borderBottom: '1px solid #ddd'
  },
  tableTr: {
    // Styles for table rows
  },
  roleSelect: {
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '5px 15px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteButtonDisabled: {
    padding: '5px 15px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '12px'
  }
};

