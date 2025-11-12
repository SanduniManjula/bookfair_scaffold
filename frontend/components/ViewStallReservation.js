import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import reservationsApi from '../lib/api/reservations';

// Dynamically import MapViewCanvas to avoid SSR issues with react-konva
const MapViewCanvas = dynamic(() => import('./MapViewCanvas'), {
  ssr: false
});

export default function ViewStallReservation() {
  const router = useRouter();
  const [stalls, setStalls] = useState([]);
  const [user, setUser] = useState(null);
  const [allReservationsCount, setAllReservationsCount] = useState(0);
  const [allStallCount, setAllStallCount] = useState(0);
  const [hoveredStallId, setHoveredStallId] = useState(null);
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
    loadMapLayout();
    getAllStallCount();
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

  const getAllStallCount = async () => {
    try {
      const data = await reservationsApi.getAllStalls();
      setAllStallCount(data.length || 0);
      const reservedCount = data.filter(stall => stall.reserved === true).length;
      setAllReservationsCount(reservedCount);
    } catch (err) {
      console.error('Failed to load user reservations:', err);
    }
  };
  

  const loadStalls = async () => {
    try {
      setIsLoadingStalls(true);
      const data = await reservationsApi.getAllStalls();
      console.log('Loaded stalls:', data.length, data);
      setStalls(data);
    } catch (err) {
      console.error('Failed to load stalls:', err);
    } finally {
      setIsLoadingStalls(false);
    }
  };

  const loadMapLayout = async () => {
    try {
      const data = await reservationsApi.getMapLayout();
      
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
      // 404 or other errors are expected if no layout exists
      if (err.status !== 404) {
        console.error('Failed to load map layout:', err);
      } else {
        console.log('No saved map layout found, using SVG fallback');
      }
      setUseSavedMap(false);
      setMapLayout(null);
    }
  };
 
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
                View Reserved Stalls
              </h1>
              <p className="text-lg text-gray-600">
                View reserved stalls on the interactive map below
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl px-6 py-3 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Available Stalls</div>
                <div className="text-2xl font-bold text-blue-600">{allReservationsCount} / {allStallCount}</div>
              </div>
              
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
            {sizeFilter !== 'All' && (
              <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                Showing <span className="font-semibold text-blue-600">{filteredStalls.length}</span> {sizeFilter.toLowerCase()} stall(s)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   
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
                <div className="flex items-center space-x-3">
                  {useSavedMap && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Using saved map layout</span>
                    </div>
                  )}
                  {isLoadingStalls && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm font-medium">Loading stalls...</span>
                    </div>
                  )}
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
                    selectedStalls={[]}
                    hoveredStallId={hoveredStallId}
                    onHover={setHoveredStallId}
                  />
                </div>
              ) : (
                <div className="w-full border-2 border-gray-300 rounded-xl bg-white shadow-inner flex items-center justify-center" style={{ minHeight: '650px' }}>
                  <div className="text-center p-8">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Map Not Configured</h3>
                    <p className="text-gray-600 mb-4">Please configure the map in the Map Designer to view stalls.</p>
                    <p className="text-sm text-gray-500">Go to Admin Panel → Map Designer to set up the map layout.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

      
      </div>

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
