import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import MapViewCanvas to avoid SSR issues with react-konva
const MapViewCanvas = dynamic(() => import('./MapViewCanvas'), {
  ssr: false
});

export default function StallReservation() {
  const router = useRouter();
  const [stalls, setStalls] = useState([]);
  const [selectedStalls, setSelectedStalls] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [userReservations, setUserReservations] = useState(0);
  const [hoveredStallId, setHoveredStallId] = useState(null);
  const svgRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [mapLayout, setMapLayout] = useState(null);
  const [useSavedMap, setUseSavedMap] = useState(false);

  // Filters
  const [sizeFilter, setSizeFilter] = useState('All');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(savedUser));
    loadStalls();
    loadUserReservations();
    loadMapLayout();
  }, [router]);

  // Reload map layout when component becomes visible (e.g., when navigating back to the page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadMapLayout();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadUserReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/reservations/my-reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUserReservations(data.length);
      }
    } catch (err) {
      console.error('Failed to load user reservations:', err);
    }
  };

  const loadStalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('http://localhost:8081/api/reservations/all', {
        headers: headers
      });
      
      if (!res.ok) {
        setMessage(`Failed to load stalls (HTTP ${res.status})`);
        setDebugInfo(''); // Only show debug info for actual errors
        return;
      }
      
      const data = await res.json();
      console.log('Loaded stalls:', data.length, data);
      setStalls(data);
      setDebugInfo(''); // Clear debug info on successful load
      setMessage('');
    } catch (err) {
      console.error('Failed to load stalls:', err);
      setMessage('Failed to load stalls. Please check if the backend is running.');
      setDebugInfo(''); // Hide debug info, show user-friendly message instead
    }
  };

  const loadMapLayout = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/reservations/map-layout');
      if (!res.ok) {
        console.log('No saved map layout found, using SVG fallback');
        setUseSavedMap(false);
        setMapLayout(null);
        return;
      }
      
      const data = await res.json();
      
      // Check for error in response
      if (data.error) {
        console.error('Error loading map layout:', data.error);
        setUseSavedMap(false);
        setMapLayout(null);
        return;
      }
      
      // Check if halls exist and have stalls
      if (data.halls && Array.isArray(data.halls) && data.halls.length > 0) {
        // Check if at least one hall has stalls
        const hasStalls = data.halls.some(hall => hall.stalls && Array.isArray(hall.stalls) && hall.stalls.length > 0);
        
        if (hasStalls) {
        console.log('Loaded saved map layout:', data);
        setMapLayout(data);
        setUseSavedMap(true);
        } else {
          console.log('Map layout has halls but no stalls, using SVG fallback');
          setUseSavedMap(false);
          setMapLayout(null);
        }
      } else {
        console.log('Empty map layout, using SVG fallback');
        setUseSavedMap(false);
        setMapLayout(null);
      }
    } catch (err) {
      console.error('Failed to load map layout:', err);
      setUseSavedMap(false);
      setMapLayout(null);
    }
  };

  const handleStallClick = (stall) => {
    console.log('handleStallClick called with stall:', stall);
    console.log('Stall properties:', {
      id: stall?.id,
      name: stall?.name,
      size: stall?.size,
      reserved: stall?.reserved
    });
    
    if (!stall) {
      console.warn('No stall provided to handleStallClick');
      setMessage('Unable to select this stall. Please try again.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    // Ensure stall has required properties
    if (!stall.id) {
      console.error('Stall missing ID:', stall);
      setMessage('Unable to select this stall. Stall ID is missing.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    // Check if stall exists in database by ID
    const existsInDatabase = stalls.some(s => s.id === stall.id);
    
    if (!existsInDatabase) {
      console.warn('Stall not found in database by ID:', {
        clickedStall: { id: stall.id, name: stall.name },
        availableStalls: stalls.slice(0, 5).map(s => ({ id: s.id, name: s.name }))
      });
      
      // Try to find by name as fallback
      const foundStall = stalls.find(s => {
        if (stall.name && s.name) {
          // Normalize names for comparison (A08 vs A8)
          const normalize = (name) => {
            const match = String(name).match(/^([A-Za-z]+)(\d+)$/);
            if (match) {
              return `${match[1]}${parseInt(match[2], 10)}`;
            }
            return String(name);
          };
          return normalize(s.name) === normalize(stall.name);
        }
        return false;
      });
      
      if (foundStall) {
        console.log('Found stall by name match:', foundStall);
        stall = foundStall;
      } else {
        console.error('Stall not found in database:', {
          clicked: { id: stall.id, name: stall.name },
          totalStalls: stalls.length
        });
        setMessage(`This stall (${stall.name || stall.id}) is not available in the database.`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }
    
    if (stall.reserved) {
      setMessage(`This stall is already reserved.`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const isSelected = selectedStalls.some(s => s.id === stall.id);
    
    if (isSelected) {
      setSelectedStalls(selectedStalls.filter(s => s.id !== stall.id));
      console.log('Stall deselected:', stall.name || stall.id);
    } else {
      const totalSelected = selectedStalls.length + userReservations;
      if (totalSelected >= 3) {
        setMessage(`You can only reserve up to 3 stalls. You have ${userReservations} existing reservation(s).`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      setSelectedStalls([...selectedStalls, stall]);
      console.log('Stall selected:', stall.name || stall.id, 'Total selected:', selectedStalls.length + 1);
    }
  };

  const handleConfirmReservation = async () => {
    if (selectedStalls.length === 0) {
      setMessage('Please select at least one stall to reserve.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let errorMessages = [];
      
      for (const stall of selectedStalls) {
        try {
          const res = await fetch('http://localhost:8081/api/reservations/reserve', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stallId: stall.id })
          });
          
          const data = await res.json();
          if (res.ok) {
            successCount++;
          } else {
            errorMessages.push(`${stall.name}: ${data.error || 'Failed'}`);
          }
        } catch (err) {
          errorMessages.push(`${stall.name}: Connection error`);
        }
      }
      
      if (successCount > 0) {
        setMessage(`✅ Reservation confirmed! A confirmation email has been sent with your QR code.`);
        setSelectedStalls([]);
        setShowConfirmModal(false);
        setTimeout(() => {
          loadStalls();
          loadUserReservations();
          setMessage('');
        }, 3000);
      } else {
        setMessage(`Failed to reserve stalls: ${errorMessages.join(', ')}`);
      }
    } catch (err) {
      setMessage('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const remainingSlots = 3 - userReservations;
  
  // Filter stalls based on size filter
  const filteredStalls = stalls.filter(stall => {
    // Size filter
    if (sizeFilter !== 'All' && stall.size !== sizeFilter) {
      return false;
    }
    
    return true;
  });

  // Filter map layout halls to only show stalls that match the size filter
  const filteredMapLayout = mapLayout && mapLayout.halls ? {
    ...mapLayout,
    halls: mapLayout.halls.map(hall => ({
      ...hall,
      stalls: hall.stalls.filter(stallData => {
        // Find matching stall from database
        const stallId = stallData.stallId || stallData.id || stallData.name;
        const matchingStall = stalls.find(s => {
          const sName = (s.name || '').toLowerCase();
          const sId = (s.id || '').toString().toLowerCase();
          const mapName = (stallId || '').toString().toLowerCase();
          return sName === mapName || sId === mapName || 
                 sName.replace(/^0+/, '') === mapName.replace(/^0+/, '');
        });
        
        // If no matching stall found, check size from map layout
        if (!matchingStall) {
          // If size filter is set, check if map layout stall size matches
          if (sizeFilter !== 'All' && stallData.size !== sizeFilter) {
            return false;
          }
          return true;
        }
        
        // Check if matching stall passes size filter
        if (sizeFilter !== 'All' && matchingStall.size !== sizeFilter) {
          return false;
        }
        
        return true;
      })
    }))
  } : null;

  // Find hovered stall from filtered stalls array
  let hoveredStall = filteredStalls.find(s => s.id === hoveredStallId);

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Page Header */}
      <div className="bg-white shadow-sm mb-8 pt-24 px-6">
        <div className="max-w-7xl mx-auto py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reserve Your Stall</h1>
          <p className="text-lg text-gray-600 mb-6">
            Choose your preferred stalls on the map below. You can reserve up to 3 stalls per business.
            {userReservations > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                You have {userReservations} existing reservation(s). {remainingSlots > 0 && `You can select up to ${remainingSlots} more.`}
              </span>
            )}
          </p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stall Size
                {sizeFilter !== 'All' && (
                  <span className="ml-2 text-xs text-blue-600">({filteredStalls.length} matches)</span>
                )}
              </label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All</option>
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>
            {sizeFilter !== 'All' && (
              <div className="flex items-end">
                <button
                  onClick={() => setSizeFilter('All')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') || message.includes('confirmed')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          } animate-fadeIn`}>
            {message}
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-200">
            Debug: {debugInfo}
          </div>
        )}

        {/* Map Layout Status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {useSavedMap ? (
              <span className="text-green-600 font-medium">✓ Using saved map layout</span>
            ) : (
              <span className="text-gray-500">Using default SVG map</span>
            )}
          </div>
          <button
            onClick={() => {
              console.log('Manual refresh triggered');
              loadMapLayout();
            }}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh Map
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stall Map Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Stalls Map</h2>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded border border-yellow-600"></div>
                  <span className="text-sm text-gray-700">Small</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded border border-orange-600"></div>
                  <span className="text-sm text-gray-700">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded border border-green-700"></div>
                  <span className="text-sm text-gray-700">Large</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-700"></div>
                  <span className="text-sm text-gray-700">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded border border-gray-500"></div>
                  <span className="text-sm text-gray-700">Reserved</span>
                </div>
              </div>

              {/* Map Display - Use saved map if available, otherwise fallback to SVG */}
              {useSavedMap && (filteredMapLayout || mapLayout) ? (
                <div className="w-full border-2 border-gray-200 rounded-lg bg-white relative" style={{ minHeight: '600px', overflow: 'hidden' }}>
                  {sizeFilter !== 'All' && (
                    <div className="absolute top-2 left-2 z-20 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                      Showing {filteredMapLayout ? filteredMapLayout.halls.reduce((sum, h) => sum + (h.stalls?.length || 0), 0) : 0} filtered stalls
                    </div>
                  )}
                  <MapViewCanvas
                    halls={(filteredMapLayout || mapLayout)?.halls || []}
                    stalls={filteredStalls}
                    selectedStalls={selectedStalls}
                    onStallClick={handleStallClick}
                    hoveredStallId={hoveredStallId}
                    onHover={setHoveredStallId}
                  />
                </div>
              ) : (
                <div className="w-full overflow-auto border-2 border-gray-200 rounded-lg bg-white">
                  <svg 
                    ref={svgRef}
                    version="1.1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    xmlnsXlink="http://www.w3.org/1999/xlink" 
                    viewBox="0 0 2528 2825" 
                    className="w-full h-auto"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ position: 'relative' }}
                  >
                  <defs>
                    <filter id="blur-stroke" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" />
                    </filter>
                  </defs>

                  {/* Background image */}
                  <image 
                    href="/MAP NEW.jpg" 
                    x="0" 
                    y="0" 
                    width="2528" 
                    height="2825"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ pointerEvents: 'none' }}
                  />

                  {/* Fallback message when no saved map is available */}
                  <text 
                    x="1264" 
                    y="1412" 
                    textAnchor="middle" 
                    fontSize="24" 
                    fill="#666"
                    style={{ pointerEvents: 'none' }}
                  >
                    Please design a map in the admin panel to view stalls
                  </text>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Reservation Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reservation Summary</h2>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Selected: <span className="font-semibold text-gray-900">{selectedStalls.length}</span> / {remainingSlots}
                </div>
                <div className="text-sm text-gray-600">
                  Total reserved: <span className="font-semibold text-gray-900">{userReservations + selectedStalls.length}</span> / 3
                </div>
              </div>

              {selectedStalls.length > 0 && (
                <div className="mb-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedStalls.map((stall) => (
                      <div key={stall.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900">{stall.name}</div>
                          <div className="text-sm text-gray-600">{stall.size}</div>
                        </div>
                        <button
                          onClick={() => setSelectedStalls(selectedStalls.filter(s => s.id !== stall.id))}
                          className="text-red-500 hover:text-red-700 font-bold text-xl"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={selectedStalls.length === 0 || loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedStalls.length === 0 || loading
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Reservation</h2>
            <p className="text-gray-600 mb-4">
              You have selected stalls: <strong>{selectedStalls.map(s => s.name).join(', ')}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to confirm this reservation?</p>
            
            <div className="flex gap-3">
              <button
                onClick={handleConfirmReservation}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all disabled:bg-gray-300"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip for hovered stall */}
      {hoveredStall && (
        <div className="fixed top-24 right-6 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-40 pointer-events-none">
          <div className="font-semibold">{hoveredStall.name}</div>
          <div className="text-sm text-gray-300 mt-1">Size: {hoveredStall.size}</div>
          {hoveredStall.virtual && (
            <div className="text-sm text-yellow-300 mt-1">(Not in database)</div>
          )}
          {hoveredStall.reserved && !hoveredStall.virtual && (
            <div className="text-sm text-red-300 mt-1">(Reserved)</div>
          )}
        </div>
      )}
    </div>
  );
}
