import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import adminApi from '../lib/api/admin';

export default function AdminReservations() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [halls, setHalls] = useState([]);
  const [mapLayout, setMapLayout] = useState(null);
  
  // Filter states
  const [hallFilter, setHallFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
      setMessageType('error');
      setTimeout(() => router.push('/home'), 2000);
      return;
    }
    
    loadData();
    loadMapLayout();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReservations();
      const reservationsList = data.reservations || [];
      // Infer status from qrCodeFilename: if exists = Confirmed, else = Pending
      const reservationsWithStatus = reservationsList.map(r => ({
        ...r,
        status: r.qrCodeFilename ? 'Confirmed' : 'Pending'
      }));
      setReservations(reservationsWithStatus);
      setFilteredReservations(reservationsWithStatus);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      setMessage(err.message || 'Failed to load reservations. Please check if the backend is running.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadMapLayout = async () => {
    try {
      const data = await adminApi.getMapLayout();
      setMapLayout(data);
      if (data.halls && data.halls.length > 0) {
        setHalls(data.halls.map(h => h.name));
      }
    } catch (err) {
      if (err.status !== 404) {
        console.error('Failed to load map layout:', err);
      }
    }
  };

  // Extract hall from stall name (e.g., "A07" -> "Hall A")
  const getHallFromStallName = (stallName) => {
    if (!stallName || !mapLayout) return 'Unknown';
    
    // Try to find the hall by matching stall name with stalls in the map layout
    if (mapLayout.halls && Array.isArray(mapLayout.halls)) {
      for (const hall of mapLayout.halls) {
        if (hall.stalls && Array.isArray(hall.stalls)) {
          const matchingStall = hall.stalls.find(s => {
            const stallId = s.stallId || s.id || s.name || '';
            // Match exact name or first character
            return stallId === stallName || 
                   stallId.toUpperCase() === stallName.toUpperCase() ||
                   stallId.charAt(0).toUpperCase() === stallName.charAt(0).toUpperCase();
          });
          if (matchingStall) {
            return hall.name;
          }
        }
      }
    }
    
    // Fallback: use first character of stall name
    const firstChar = stallName.charAt(0).toUpperCase();
    return `Hall ${firstChar}`;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...reservations];

    // Hall filter
    if (hallFilter !== 'All') {
      filtered = filtered.filter(r => {
        const hall = getHallFromStallName(r.stallName);
        return hall === hallFilter;
      });
    }

    // Size filter
    if (sizeFilter !== 'All') {
      filtered = filtered.filter(r => r.stallSize === sizeFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.username?.toLowerCase().includes(query) ||
        r.stallName?.toLowerCase().includes(query) ||
        r.userEmail?.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(r => {
        const resDate = new Date(r.createdAt);
        return resDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredReservations(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [hallFilter, sizeFilter, statusFilter, searchQuery, dateFilter, reservations, mapLayout]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredReservations].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReservations(sorted);
  };

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, endIndex);

  // Handle approve (placeholder - backend needs to be updated)
  const handleApprove = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      // For now, we'll just show a message
      setMessage('Approve functionality requires backend implementation. Please contact the development team.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
      
    } catch (err) {
      setMessage('Failed to approve reservation.');
      setMessageType('error');
    }
  };

  // Handle cancel (uses existing delete endpoint)
  const handleCancel = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation? The stall will become available again.')) {
      return;
    }

    try {
      await adminApi.deleteReservation(reservationId);
      setMessage('Reservation cancelled successfully!');
      setMessageType('success');
      loadData();
      setShowModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || 'Failed to cancel reservation.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['#', 'Business Name', 'Stall ID', 'Hall', 'Size', 'Status', 'Reserved Date', 'Email', 'Contact'];
    const rows = filteredReservations.map((r, index) => [
      index + 1,
      r.username || 'N/A',
      r.stallName || 'N/A',
      getHallFromStallName(r.stallName),
      r.stallSize || 'N/A',
      r.status || 'N/A',
      new Date(r.createdAt).toLocaleDateString(),
      r.userEmail || 'N/A',
      'N/A' // Contact not available in current data
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View reservation details
  const handleView = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700">{message || 'Loading...'}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Organizer Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin-panel')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/admin-map-designer')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Stall Map
              </button>
              <button
                className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Reservations
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reservation Management</h2>
              <p className="text-gray-600 mt-1">View and manage all stall reservations made by vendors.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <span>🔄</span> Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>📊</span> Export CSV
              </button>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter by Date"
              />
            </div>
          </div>
          {message && (
            <div className={`mt-4 px-4 py-2 rounded ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hall</label>
              <select
                value={hallFilter}
                onChange={(e) => setHallFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All</option>
                {halls.map(hall => (
                  <option key={hall} value={hall}>{hall}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stall Size</label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All</option>
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Business Name or Stall ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('id')}
                  >
                    # {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('username')}
                  >
                    Business Name {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('stallName')}
                  >
                    Stall ID {sortConfig.key === 'stallName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Hall</th>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('stallSize')}
                  >
                    Size {sortConfig.key === 'stallSize' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('createdAt')}
                  >
                    Reserved Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  paginatedReservations.map((reservation, index) => {
                    const statusColors = {
                      'Confirmed': 'bg-green-100 text-green-800',
                      'Pending': 'bg-yellow-100 text-yellow-800',
                      'Cancelled': 'bg-red-100 text-red-800'
                    };
                    
                    return (
                      <tr key={reservation.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{startIndex + index + 1}</td>
                        <td className="px-6 py-4 font-medium">{reservation.username || 'N/A'}</td>
                        <td className="px-6 py-4">{reservation.stallName || 'N/A'}</td>
                        <td className="px-6 py-4">{getHallFromStallName(reservation.stallName)}</td>
                        <td className="px-6 py-4">{reservation.stallSize || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[reservation.status] || 'bg-gray-100 text-gray-800'}`}>
                            {reservation.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(reservation.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(reservation)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                            >
                              View
                            </button>
                            {reservation.status === 'Pending' && (
                              <button
                                onClick={() => handleApprove(reservation.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              >
                                Approve
                              </button>
                            )}
                            {reservation.status === 'Confirmed' && (
                              <button
                                onClick={() => handleCancel(reservation.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredReservations.length)} of {filteredReservations.length} reservations
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Reservation Modal */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Reservation Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <p className="mt-1 text-gray-900">{selectedReservation.username || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="mt-1 text-gray-900">{selectedReservation.username || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{selectedReservation.userEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">N/A</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hall</label>
                  <p className="mt-1 text-gray-900">{getHallFromStallName(selectedReservation.stallName)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stall ID</label>
                  <p className="mt-1 text-gray-900">{selectedReservation.stallName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <p className="mt-1 text-gray-900">{selectedReservation.stallSize || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedReservation.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      selectedReservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedReservation.status || 'N/A'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Reservation</label>
                  <p className="mt-1 text-gray-900">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
                </div>
                {selectedReservation.qrCodeFilename && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">QR Code</label>
                    <p className="mt-1 text-gray-900">{selectedReservation.qrCodeFilename}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              {selectedReservation.status === 'Pending' && (
                <button
                  onClick={() => {
                    handleApprove(selectedReservation.id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              {selectedReservation.status === 'Confirmed' && (
                <button
                  onClick={() => {
                    handleCancel(selectedReservation.id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

