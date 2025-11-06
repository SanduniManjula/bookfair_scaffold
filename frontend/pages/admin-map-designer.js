import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import ToolsSidebar from '../components/ToolsSidebar';
import EditStallModal from '../components/EditStallModal';

// Dynamically import MapCanvas to avoid SSR issues with react-konva
const MapCanvas = dynamic(() => import('../components/MapCanvas'), {
  ssr: false
});

export default function AdminMapDesigner() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [halls, setHalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mode, setMode] = useState('select'); // select, draw, grid
  const [mapData, setMapData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      // Check if user is admin
      if (!userData.role || userData.role !== 'ADMIN') {
        router.push('/home');
        return;
      }

      setUser(userData);
      setLoading(false);
      loadMapData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const loadMapData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/admin/map-layout', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMapData(data);
        if (data.halls) {
          setHalls(data.halls);
        }
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    }
  };

  const handleSaveMap = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      // Validate that there's at least one hall with stalls
      const hasStalls = halls.some(hall => hall.stalls && hall.stalls.length > 0);
      if (!hasStalls) {
        setMessage('Please add at least one stall to the map before saving.');
        setTimeout(() => setMessage(''), 3000);
        setIsSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/admin/map-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          halls: halls
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('Map saved successfully! The map will be available on the map page.');
        setTimeout(() => setMessage(''), 5000);
        console.log('Map saved successfully:', data);
      } else {
        const errorMsg = data.error || 'Failed to save map';
        setMessage(`Error: ${errorMsg}`);
        setTimeout(() => setMessage(''), 5000);
        console.error('Failed to save map:', data);
      }
    } catch (err) {
      console.error('Failed to save map:', err);
      setMessage(`Error saving map: ${err.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPNG = async () => {
    // This will be implemented in MapCanvas component
    const canvas = document.getElementById('map-canvas');
    if (canvas) {
      const html2canvas = (await import('html2canvas')).default;
      const canvasElement = await html2canvas(canvas);
      const url = canvasElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'stall-map.png';
      link.href = url;
      link.click();
    }
  };

  const handleResetMap = () => {
    if (confirm('Are you sure you want to reset the map? This cannot be undone.')) {
      setHalls([]);
      setMapData(null);
    }
  };

  const handleAddHall = () => {
    const hallName = prompt('Enter hall name (e.g., Hall A):');
    if (hallName && hallName.trim()) {
      const newHall = {
        id: `hall-${Date.now()}`,
        name: hallName.trim(),
        stalls: []
      };
      setHalls([...halls, newHall]);
    }
  };

  const handleStallClick = (stall) => {
    setSelectedStall(stall);
    setShowEditModal(true);
  };

  const handleStallUpdate = (updatedStall) => {
    setHalls(halls.map(hall => ({
      ...hall,
      stalls: hall.stalls.map(stall => 
        stall.id === updatedStall.id ? updatedStall : stall
      )
    })));
    setShowEditModal(false);
    setSelectedStall(null);
  };

  const handleStallDelete = (stallId) => {
    setHalls(halls.map(hall => ({
      ...hall,
      stalls: hall.stalls.filter(stall => stall.id !== stallId)
    })));
    setShowEditModal(false);
    setSelectedStall(null);
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
                className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Map Designer
              </button>
              <button
                onClick={() => router.push('/admin-panel')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Stalls
              </button>
              <button
                onClick={() => router.push('/admin-panel')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Visual Stall Map Designer</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleAddHall}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add Hall
              </button>
              <button
                onClick={handleSaveMap}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                💾 {isSaving ? 'Saving...' : 'Save Map'}
              </button>
              <button
                onClick={handleExportPNG}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                📤 Export PNG
              </button>
              <button
                onClick={handleResetMap}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑 Reset Map
              </button>
            </div>
          </div>
          {message && (
            <div className={`mt-2 px-4 py-2 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Main Work Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Tools Panel */}
          <div className="col-span-3">
            <ToolsSidebar
              halls={halls}
              setHalls={setHalls}
              mode={mode}
              setMode={setMode}
            />
          </div>

          {/* Right Panel - Interactive Canvas */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <MapCanvas
                halls={halls}
                setHalls={setHalls}
                mode={mode}
                onStallClick={handleStallClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Stall Modal */}
      {showEditModal && selectedStall && (
        <EditStallModal
          stall={selectedStall}
          onUpdate={handleStallUpdate}
          onDelete={handleStallDelete}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStall(null);
          }}
        />
      )}
    </div>
  );
}

