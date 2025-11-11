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
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [user, setUser] = useState(null);
  const [userReservations, setUserReservations] = useState(0);
  const [hoveredStallId, setHoveredStallId] = useState(null);
  const svgRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [mapLayout, setMapLayout] = useState(null);
  const [useSavedMap, setUseSavedMap] = useState(false);
  const [isLoadingStalls, setIsLoadingStalls] = useState(true);

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
        setUserReservations(data.length || 0);
      }
    } catch (err) {
      console.error('Failed to load user reservations:', err);
    }
  };

  const loadStalls = async () => {
    try {
      setIsLoadingStalls(true);
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
        setMessageType('error');
        setDebugInfo('');
        return;
      }
      
      const data = await res.json();
      console.log('Loaded stalls:', data.length, data);
      setStalls(data);
      setDebugInfo('');
      setMessage('');
    } catch (err) {
      console.error('Failed to load stalls:', err);
      setMessage('Failed to load stalls. Please check if the backend is running.');
      setMessageType('error');
      setDebugInfo('');
    } finally {
      setIsLoadingStalls(false);
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
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }
    
    // Ensure stall has required properties
    if (!stall.id) {
      console.error('Stall missing ID:', stall);
      setMessage('Unable to select this stall. Stall ID is missing.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
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
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
        return;
      }
    }
    
    if (stall.reserved) {
      setMessage(`This stall is already reserved.`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
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
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
        return;
      }
      
      setSelectedStalls([...selectedStalls, stall]);
      console.log('Stall selected:', stall.name || stall.id, 'Total selected:', selectedStalls.length + 1);
    }
  };

  const handleConfirmReservation = async () => {
    if (selectedStalls.length === 0) {
      setMessage('Please select at least one stall to reserve.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');
    
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
        setMessageType('success');
        setSelectedStalls([]);
        setShowConfirmModal(false);
        setTimeout(() => {
          loadStalls();
          loadUserReservations();
          setMessage('');
          setMessageType('');
        }, 5000);
      } else {
        setMessage(`Failed to reserve stalls: ${errorMessages.join(', ')}`);
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Failed to connect to server');
      setMessageType('error');
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-12">
      {/* Enhanced Page Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 mb-8 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Reserve Your Stall
              </h1>
              <p className="text-lg text-gray-600">
                Choose your preferred stalls on the interactive map below
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl px-6 py-3 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Reservation Limit</div>
                <div className="text-2xl font-bold text-blue-600">{userReservations} / 3</div>
              </div>
              {remainingSlots > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl px-6 py-3 border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Available Slots</div>
                  <div className="text-2xl font-bold text-green-600">{remainingSlots}</div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 sm:max-w-xs">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Stall Size
              </label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium transition-all"
              >
                <option value="All">All Sizes</option>
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>
            {sizeFilter !== 'All' && (
              <button
                onClick={() => setSizeFilter('All')}
                className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filter</span>
              </button>
            )}
            <button
              onClick={() => {
                console.log('Manual refresh triggered');
                loadMapLayout();
                loadStalls();
              }}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Map</span>
            </button>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 flex items-center space-x-4">
            {useSavedMap ? (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Using saved map layout</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Using default map view</span>
              </div>
            )}
            {sizeFilter !== 'All' && (
              <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                Showing <span className="font-semibold text-blue-600">{filteredStalls.length}</span> {sizeFilter.toLowerCase()} stall(s)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 animate-fadeIn ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {messageType === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Interactive Map</span>
                </h2>
                {isLoadingStalls && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium">Loading stalls...</span>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="w-5 h-5 bg-yellow-400 rounded border-2 border-yellow-600 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Small</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="w-5 h-5 bg-orange-400 rounded border-2 border-orange-600 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Medium</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="w-5 h-5 bg-green-500 rounded border-2 border-green-700 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Large</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="w-5 h-5 bg-blue-500 rounded border-2 border-blue-700 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="w-5 h-5 bg-gray-400 rounded border-2 border-gray-600 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Reserved</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  💡 Click on stalls to select them. Use mouse wheel to zoom, Shift + drag to pan.
                </div>
              </div>

              {/* Map Display */}
              {useSavedMap && (filteredMapLayout || mapLayout) ? (
                <div className="w-full border-2 border-gray-300 rounded-xl bg-white relative shadow-inner" style={{ minHeight: '650px', overflow: 'hidden' }}>
                  {sizeFilter !== 'All' && (
                    <div className="absolute top-3 left-3 z-20 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
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
                <div className="w-full overflow-auto border-2 border-gray-300 rounded-xl bg-white shadow-inner">
                  <svg 
                    ref={svgRef}
                    version="1.1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    xmlnsXlink="http://www.w3.org/1999/xlink" 
                    viewBox="0 0 2528 2825" 
                    className="w-full h-auto"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ position: 'relative', minHeight: '650px' }}
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
                    fontSize="28" 
                    fill="#666"
                    fontWeight="bold"
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
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Summary</span>
              </h2>
              
              {/* Reservation Stats */}
              <div className="mb-6 space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Selected Stalls</div>
                  <div className="text-3xl font-bold text-blue-600">{selectedStalls.length} <span className="text-lg text-gray-500">/ {remainingSlots}</span></div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Reserved</div>
                  <div className="text-3xl font-bold text-gray-700">{userReservations + selectedStalls.length} <span className="text-lg text-gray-500">/ 3</span></div>
                </div>
              </div>

              {/* Selected Stalls List */}
              {selectedStalls.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Selected Stalls</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {selectedStalls.map((stall) => (
                      <div key={stall.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{stall.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            <span className="inline-block px-2 py-0.5 bg-white rounded text-gray-700 font-medium">
                              {stall.size}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedStalls(selectedStalls.filter(s => s.id !== stall.id))}
                          className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors"
                          title="Remove"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedStalls.length === 0 && (
                <div className="mb-6 text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm text-gray-500">No stalls selected</p>
                  <p className="text-xs text-gray-400 mt-1">Click on stalls to select them</p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={selectedStalls.length === 0 || loading || remainingSlots === 0}
                className={`w-full py-4 px-4 rounded-xl font-semibold transition-all transform ${
                  selectedStalls.length === 0 || loading || remainingSlots === 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </span>
                ) : remainingSlots === 0 ? (
                  'Reservation Limit Reached'
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirm Reservation</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => !loading && setShowConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Confirm Reservation</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are about to reserve the following stall(s):
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2">
                  {selectedStalls.map((stall) => (
                    <div key={stall.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{stall.name}</span>
                        <span className="ml-2 text-sm text-gray-600">({stall.size})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                A confirmation email with QR codes will be sent to your registered email address.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleConfirmReservation}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Processing...' : 'Confirm & Reserve'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip for hovered stall */}
      {hoveredStall && (
        <div className="fixed top-32 right-6 bg-gray-900 text-white p-4 rounded-xl shadow-2xl z-40 pointer-events-none animate-fadeIn border border-gray-700">
          <div className="font-bold text-lg mb-1">{hoveredStall.name}</div>
          <div className="text-sm text-gray-300 mb-2">Size: {hoveredStall.size}</div>
          {hoveredStall.reserved && (
            <div className="text-sm text-red-300 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Reserved</span>
            </div>
          )}
          {!hoveredStall.reserved && (
            <div className="text-sm text-green-300 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
