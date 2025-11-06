import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

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
  const polygonStallMapRef = useRef(new Map());

  // Filters
  const [sizeFilter, setSizeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
  }, [router]);

  useEffect(() => {
    if (stalls.length > 0 && svgRef.current) {
      const timer = setTimeout(() => {
        initializePolygonMapping();
        updatePolygonStyles();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stalls]);

  useEffect(() => {
    if (stalls.length > 0 && svgRef.current) {
      updatePolygonStyles();
    }
  }, [selectedStalls, hoveredStallId, stalls]);

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
        return;
      }
      
      const data = await res.json();
      setStalls(data);
      setMessage('');
    } catch (err) {
      console.error('Failed to load stalls:', err);
      setMessage('Failed to load stalls. Please check if the backend is running.');
    }
  };

  const initializePolygonMapping = () => {
    if (!svgRef.current || stalls.length === 0) return;
    
    const polygons = svgRef.current.querySelectorAll('polygon');
    
    // Set default styles for all polygons
    polygons.forEach((polygon) => {
      if (polygon._clickHandler) {
        polygon.removeEventListener('click', polygon._clickHandler);
        polygon.removeEventListener('mouseenter', polygon._mouseEnterHandler);
        polygon.removeEventListener('mouseleave', polygon._mouseLeaveHandler);
      }
      
      polygon.style.fill = 'transparent';
      polygon.style.stroke = 'none';
      polygon.style.pointerEvents = 'none';
      polygon.style.opacity = '0';
    });
    
    // Map ALL stalls to polygons (up to the number of available polygons)
    const maxStalls = Math.min(stalls.length, polygons.length);
    stalls.slice(0, maxStalls).forEach((stall, index) => {
      if (index < polygons.length) {
        const polygon = polygons[index];
        polygonStallMapRef.current.set(polygon, stall);
        
        polygon.style.pointerEvents = 'auto';
        polygon.style.opacity = '1';
        
        const clickHandler = (e) => {
          e.stopPropagation();
          handlePolygonClick(stall);
        };
        const mouseEnterHandler = () => setHoveredStallId(stall.id);
        const mouseLeaveHandler = () => setHoveredStallId(null);
        
        polygon._clickHandler = clickHandler;
        polygon._mouseEnterHandler = mouseEnterHandler;
        polygon._mouseLeaveHandler = mouseLeaveHandler;
        
        polygon.addEventListener('click', clickHandler);
        polygon.addEventListener('mouseenter', mouseEnterHandler);
        polygon.addEventListener('mouseleave', mouseLeaveHandler);
      }
    });
  };

  const updatePolygonStyles = () => {
    if (!svgRef.current) return;
    
    const polygons = svgRef.current.querySelectorAll('polygon');
    
    polygons.forEach((polygon) => {
      const stall = polygonStallMapRef.current.get(polygon);
      
      if (stall) {
        const isSelected = selectedStalls.some(s => s.id === stall.id);
        const isHovered = hoveredStallId === stall.id && !isSelected;
        
        if (stall.reserved) {
          polygon.style.fill = 'rgba(100, 100, 100, 0.7)';
          polygon.style.cursor = 'not-allowed';
        } else if (isSelected) {
          polygon.style.fill = 'rgba(37, 99, 235, 0.6)';
          polygon.style.stroke = '#0070f3';
          polygon.style.strokeWidth = '4';
          polygon.style.filter = 'drop-shadow(0 0 8px rgba(0, 112, 243, 0.6))';
          polygon.style.cursor = 'pointer';
        } else if (isHovered) {
          polygon.style.fill = 'rgba(34, 197, 94, 0.6)';
          polygon.style.stroke = '#4caf50';
          polygon.style.strokeWidth = '2';
          polygon.style.filter = 'none';
          polygon.style.cursor = 'pointer';
        } else {
          polygon.style.fill = getStallFillColor(stall);
          polygon.style.stroke = 'rgba(255, 255, 255, 0.5)';
          polygon.style.strokeWidth = '1';
          polygon.style.filter = 'none';
          polygon.style.cursor = 'pointer';
        }
        
        polygon.style.transition = 'all 0.3s ease';
        polygon.style.pointerEvents = 'auto';
        polygon.style.opacity = '1';
      } else {
        polygon.style.fill = 'transparent';
        polygon.style.stroke = 'none';
        polygon.style.pointerEvents = 'none';
        polygon.style.opacity = '0';
      }
    });
  };

  const getStallFillColor = (stall) => {
    if (stall.reserved) return 'rgba(100, 100, 100, 0.7)';
    switch (stall.size) {
      case 'SMALL': return 'rgba(255, 235, 59, 0.6)';
      case 'MEDIUM': return 'rgba(255, 152, 0, 0.6)';
      case 'LARGE': return 'rgba(76, 175, 80, 0.6)';
      default: return 'rgba(224, 224, 224, 0.6)';
    }
  };

  const handlePolygonClick = (stall) => {
    if (stall.reserved) return;
    
    const isSelected = selectedStalls.some(s => s.id === stall.id);
    
    if (isSelected) {
      setSelectedStalls(selectedStalls.filter(s => s.id !== stall.id));
    } else {
      const totalSelected = selectedStalls.length + userReservations;
      if (totalSelected >= 3) {
        setMessage(`You can only reserve up to 3 stalls. You have ${userReservations} existing reservation(s).`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      setSelectedStalls([...selectedStalls, stall]);
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
  const hoveredStall = stalls.find(s => s.id === hoveredStallId);

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
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Stall ID or Name</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stalls..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Stall Size</label>
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

              {/* SVG Map */}
              <div className="w-full overflow-auto border-2 border-gray-200 rounded-lg bg-white">
                <svg 
                  ref={svgRef}
                  version="1.1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  xmlnsXlink="http://www.w3.org/1999/xlink" 
                  viewBox="0 0 2528 2825" 
                  className="w-full h-auto"
                  preserveAspectRatio="xMidYMid meet"
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
                  />

                  {/* All 436 polygons from the map */}
                  <polygon points="1736,925 1775,925 1775,970 1736,970 1736,925" />
                  <polygon points="1736,884 1775,884 1775,925 1736,925 1736,884" />
                  <polygon points="1736,769 1779,769 1779,811 1736,811 1736,769" />
                  <polygon points="1736,722 1779,722 1779,769 1736,769 1736,722" />
                  <polygon points="1355,729 1389,691 1447,757 1415,792 1355,729" />
                  <polygon points="1326,756 1355,729 1415,792 1389,820 1326,756" />
                  <polygon points="1295,788 1326,756 1389,820 1356,851 1295,788" />
                  <polygon points="1263,819 1295,788 1356,851 1323,883 1263,819" />
                  <polygon points="1389,820 1447,757 1510,818 1448,885 1389,820" />
                  <polygon points="1323,883 1389,820 1448,885 1383,948 1323,883" />
                  <polygon points="1199,722 1187,756 1143,756 1168,689 1199,722" />
                  <polygon points="1230,688 1199,722 1168,689 1199,659 1230,688" />
                  <polygon points="1260,656 1230,688 1199,659 1228,625 1260,656" />
                  <polygon points="1291,626 1260,656 1228,625 1261,595 1291,626" />
                  <polygon points="1322,567 1366,567 1366,611 1322,611 1322,567" />
                  <polygon points="1322,567 1322,611 1291,626 1261,595 1322,567" />
                  <polygon points="1413,569 1453,569 1453,610 1413,610 1413,569" />
                  <polygon points="1517,594 1453,569 1453,610 1486,626 1517,594" />
                  <polygon points="1547,627 1517,594 1486,626 1518,657 1547,627" />
                  <polygon points="1579,656 1547,627 1518,657 1548,689 1579,656" />
                  <polygon points="1578,720 1608,688 1579,656 1548,689 1578,720" />
                  <polygon points="1592,753 1633,754 1608,688 1578,720 1592,753" />
                  <polygon points="1591,796 1632,797 1633,754 1592,753 1591,796" />
                  <polygon points="1547,753 1548,797 1591,796 1592,753 1578,720 1547,753" />
                  <polygon points="1517,721 1547,753 1578,720 1548,689 1517,721" />
                  <polygon points="1488,689 1517,721 1548,689 1518,657 1488,689" />
                  <polygon points="1458,657 1488,689 1518,657 1486,626 1458,657" />
                  <polygon points="1413,610 1456,610 1486,626 1456,658 1413,657 1413,610" />
                  <polygon points="1322,658 1366,657 1366,611 1322,611 1291,626 1322,658" />
                  <polygon points="1289,688 1322,658 1291,626 1260,656 1289,688" />
                  <polygon points="1259,721 1289,688 1260,656 1230,688 1259,721" />
                  <polygon points="1228,755 1259,721 1230,688 1199,722 1228,755" />
                  <polygon points="1187,801 1228,799 1228,755 1199,722 1187,756 1187,801" />
                  <polygon points="1143,756 1187,756 1187,801 1143,801 1143,756" />
                  <polygon points="1185,892 1142,892 1142,847 1185,847 1185,892" />
                  <polygon points="1230,894 1228,848 1185,847 1185,892 1197,921 1230,894" />
                  <polygon points="1168,955 1142,892 1185,892 1197,921 1168,955" />
                  <polygon points="1230,954 1197,921 1230,894 1260,927 1230,954" />
                  <polygon points="1291,954 1260,986 1230,954 1260,927 1291,954" />
                  <polygon points="1320,986 1291,1018 1260,986 1291,954 1320,986" />
                  <polygon points="1197,986 1168,955 1197,921 1230,954 1197,986" />
                  <polygon points="1229,1018 1197,986 1230,954 1260,986 1229,1018" />
                  <polygon points="1258,1050 1229,1018 1260,986 1291,1018 1258,1050" />
                  <polygon points="1322,1035 1365,1035 1365,1078 1322,1078 1322,1035" />
                  <polygon points="1320,986 1365,988 1365,1035 1322,1035 1291,1018 1320,986" />
                  <polygon points="1322,1035 1322,1078 1258,1050 1291,1018 1322,1035" />
                  <polygon points="1406,1035 1406,1078 1365,1078 1365,1035 1406,1035" />
                  <polygon points="1406,986 1406,1035 1365,1035 1365,988 1406,986" />
                  <polygon points="1406,986 1495,986 1495,1078 1406,1078 1406,986" />
                  <polygon points="1545,842 1635,842 1635,934 1545,934 1545,842" />
                  <polygon points="1679,904 1721,904 1720,965 1658,1038 1622,1005 1678,946 1679,904" />
                  <polygon points="1679,853 1721,853 1721,904 1679,904 1679,853" />
                  <polygon points="1681,768 1721,768 1721,813 1681,813 1681,768" />
                  <polygon points="1681,724 1721,724 1721,768 1681,768 1681,724" />
                  <polygon points="1662,683 1681,724 1721,724 1721,680 1695,650 1662,683" />
                  <polygon points="1631,650 1662,683 1695,650 1662,619 1631,650" />
                  <polygon points="1603,620 1631,650 1662,619 1632,588 1603,620" />
                  <polygon points="1571,587 1603,620 1632,588 1600,556 1571,587" />
                  <polygon points="1539,556 1571,587 1600,556 1572,527 1539,556" />
                  <polygon points="1507,524 1539,556 1572,527 1541,492 1507,524" />
                  <polygon points="1466,477 1466,523 1507,524 1541,492 1527,477 1466,477" />
                  <polygon points="1423,477 1466,477 1466,523 1423,523 1423,477" />
                  <polygon points="1312,523 1356,523 1356,478 1312,478 1312,523" />
                  <polygon points="1267,524 1312,523 1312,478 1250,477 1238,491 1267,524" />
                  <polygon points="1237,556 1267,524 1238,491 1207,524 1237,556" />
                  <polygon points="1207,587 1237,556 1207,524 1175,556 1207,587" />
                  <polygon points="1176,618 1207,587 1175,556 1146,586 1176,618" />
                  <polygon points="1144,649 1176,618 1146,586 1115,618 1144,649" />
                  <polygon points="1084,649 1115,680 1144,649 1115,618 1084,649" />
                  <polygon points="1098,724 1115,680 1084,649 1057,682 1057,724 1098,724" />
                  <polygon points="1098,767 1057,767 1057,724 1098,724 1098,767" />
                  <polygon points="1098,813 1057,813 1057,767 1098,767 1098,813" />
                  <polygon points="1098,856 1057,856 1057,813 1098,813 1098,856" />
                  <polygon points="1098,902 1057,902 1057,856 1098,856 1098,902" />
                  <polygon points="1098,943 1056,943 1056,902 1098,902 1098,943" />
                  <polygon points="1130,980 1100,1011 1056,967 1056,943 1098,943 1130,980" />
                  <polygon points="1160,1011 1130,980 1100,1011 1126,1041 1160,1011" />
                  <polygon points="1191,1045 1160,1011 1126,1041 1159,1077 1191,1045" />
                  <polygon points="1224,1077 1191,1045 1159,1077 1190,1108 1224,1077" />
                  <polygon points="1250,1106 1224,1077 1190,1108 1219,1136 1250,1106" />
                  <polygon points="1291,1123 1250,1106 1219,1136 1250,1168 1291,1168 1291,1123" />
                  <polygon points="1335,1123 1291,1123 1291,1168 1335,1168 1335,1123" />
                  <polygon points="1380,1123 1335,1123 1335,1168 1380,1168 1380,1123" />
                  <polygon points="1421,1123 1380,1123 1380,1168 1421,1168 1421,1123" />
                  <polygon points="1464,1168 1421,1168 1421,1123 1464,1123 1464,1168" />
                  <polygon points="1562,1064 1592,1099 1524,1168 1464,1168 1464,1123 1505,1123 1562,1064" />
                  <polygon points="1967,883 1970,949 2010,991 1974,1023 1921,962 1921,882 1967,883" />
                  <polygon points="2031,750 2004,783 2032,811 2061,783 2031,750" />
                  <polygon points="2065,718 2031,750 2061,783 2094,750 2065,718" />
                  <polygon points="2095,689 2065,718 2094,750 2128,722 2095,689" />
                  <polygon points="2155,751 2187,720 2156,688 2095,689 2155,751" />
                  <polygon points="2094,750 2128,722 2155,751 2124,784 2094,750" />
                  <polygon points="2061,783 2094,750 2124,784 2090,813 2061,783" />
                  <polygon points="2032,811 2061,783 2090,813 2063,844 2032,811" />
                  <polygon points="2004,783 2063,844 2030,880 2001,845 2004,783" />
                  <polygon points="2091,875 2124,840 2153,875 2121,904 2091,875" />
                  <polygon points="2124,840 2154,812 2183,840 2153,875 2124,840" />
                  <polygon points="2154,812 2184,777 2215,811 2183,840 2155,812" />
                  <polygon points="2184,777 2217,745 2248,777 2215,811 2184,777" />
                  <polygon points="2217,745 2248,716 2276,747 2248,777 2217,745" />
                  <polygon points="2248,777 2276,747 2306,781 2277,808 2248,777" />
                  <polygon points="2215,811 2248,777 2277,808 2247,842 2215,811" />
                  <polygon points="2183,840 2215,811 2247,842 2217,871 2183,840" />
                  <polygon points="2153,875 2183,840 2217,871 2186,904 2153,875" />
                  <polygon points="2121,904 2153,875 2186,904 2153,936 2121,904" />
                  <polygon points="2029,934 2091,875 2153,936 2090,1004 2029,934" />
                  <polygon points="2242,1033 2179,1033 2152,1002 2184,968 2242,1033" />
                  <polygon points="2242,970 2214,1002 2184,968 2213,939 2242,970" />
                  <polygon points="2244,905 2273,938 2242,970 2213,939 2244,905" />
                  <polygon points="2272,875 2305,905 2274,938 2244,905 2272,875" />
                  <polygon points="2336,938 2339,875 2306,843 2272,875 2336,938" />
                  <polygon points="2274,938 2306,905 2336,936 2306,969 2273,938" />
                  <polygon points="2242,970 2273,938 2306,969 2273,1001 2242,970" />
                  <polygon points="2214,1002 2242,970 2273,1001 2242,1033 2214,1002" />
                  <polygon points="2145,1070 2145,1117 2067,1114 2009,1056 2040,1022 2083,1070 2145,1070" />
                  <polygon points="2145,1070 2189,1070 2189,1117 2145,1117 2145,1070" />
                  <polygon points="2189,1070 2233,1070 2233,1117 2189,1117 2189,1070" />
                  <polygon points="2298,1085 2269,1117 2233,1117 2233,1070 2249,1070 2268,1054 2298,1085" />
                  <polygon points="2298,1022 2327,1054 2298,1085 2268,1054 2298,1022" />
                  <polygon points="2327,991 2359,1023 2327,1054 2298,1022 2327,991" />
                  <polygon points="2359,959 2387,993 2359,1023 2327,991 2359,959" />
                  <polygon points="2373,930 2359,959 2387,993 2412,964 2414,930 2373,930" />
                  <polygon points="2373,884 2414,884 2414,930 2373,930 2373,884" />
                  <polygon points="2373,840 2413,840 2413,884 2373,884 2373,840" />
                  <polygon points="2373,795 2413,795 2413,840 2373,840 2373,795" />
                  <polygon points="2355,760 2373,795 2412,795 2414,758 2388,730 2355,760" />
                  <polygon points="2326,727 2357,697 2388,730 2355,760 2326,727" />
                  <polygon points="2265,667 2296,698 2327,665 2296,634 2265,667" />
                  <polygon points="2235,609 2271,609 2296,634 2265,667 2235,653 2235,609" />
                  <polygon points="2191,609 2235,609 2235,652 2191,652 2191,609" />
                  <polygon points="2147,609 2191,609 2191,652 2147,652 2147,609" />
                  <polygon points="2102,609 2147,609 2147,652 2102,652 2102,609" />
                  <polygon points="2043,634 2068,607 2102,609 2103,653 2073,665 2043,634" />
                  <polygon points="2012,666 2043,634 2073,665 2041,696 2012,666" />
                  <polygon points="1982,697 2012,666 2041,696 2011,726 1982,697" />
                  <polygon points="1965,837 1923,838 1923,758 1982,697 2011,726 1968,771 1965,837" />
                  <polygon points="1870,748 1913,748 1913,795 1870,795 1870,748" />
                  <polygon points="1870,795 1913,795 1913,838 1870,838 1870,795" />
                  <polygon points="1870,882 1913,882 1913,927 1870,927 1870,882" />
                  <polygon points="1870,927 1913,927 1913,972 1870,972 1870,927" />
                  <polygon points="2079,2034 2318,2034 2318,2187 2079,2187 2079,2034" />
                  <polygon points="2103,1979 2142,1979 2142,2024 2103,2024 2103,1979" />
                  <polygon points="2142,1979 2180,1979 2180,2024 2142,2024 2142,1979" />
                  <polygon points="2180,1979 2213,1979 2213,2024 2180,2024 2180,1979" />
                  <polygon points="2213,1979 2248,1979 2248,2024 2213,2024 2213,1979" />
                  <polygon points="2248,1979 2289,1979 2289,2024 2248,2024 2248,1979" />
                  <polygon points="2248,1934 2289,1934 2289,1979 2248,1979 2248,1934" />
                  <polygon points="2213,1934 2248,1934 2248,1979 2213,1979 2213,1934" />
                  <polygon points="2180,1934 2213,1934 2213,1979 2180,1979 2180,1934" />
                  <polygon points="2142,1934 2180,1934 2180,1979 2142,1979 2142,1934" />
                  <polygon points="2103,1934 2142,1934 2142,1979 2103,1979 2103,1934" />
                  <polygon points="2118,1869 2154,1869 2154,1912 2118,1912 2118,1869" />
                  <polygon points="2154,1870 2189,1870 2189,1912 2154,1912 2154,1870" />
                  <polygon points="2189,1872 2227,1872 2227,1912 2189,1912 2189,1872" />
                  <polygon points="2227,1872 2263,1872 2263,1912 2227,1912 2227,1872" />
                  <polygon points="2263,1872 2299,1872 2299,1912 2263,1912 2263,1872" />
                  <polygon points="2263,1831 2299,1831 2299,1872 2263,1872 2263,1831" />
                  <polygon points="2227,1831 2263,1831 2263,1872 2227,1872 2227,1831" />
                  <polygon points="2189,1831 2227,1831 2227,1872 2189,1872 2189,1831" />
                  <polygon points="2154,1831 2189,1831 2189,1872 2154,1872 2154,1831" />
                  <polygon points="2118,1831 2154,1831 2154,1872 2118,1872 2118,1831" />
                  <polygon points="2104,1762 2142,1762 2142,1805 2104,1805 2104,1762" />
                  <polygon points="2142,1762 2177,1762 2177,1805 2142,1805 2142,1762" />
                  <polygon points="2177,1763 2211,1763 2211,1805 2177,1805 2177,1763" />
                  <polygon points="2211,1763 2251,1763 2251,1805 2211,1805 2211,1763" />
                  <polygon points="2251,1763 2284,1763 2284,1805 2251,1805 2251,1763" />
                  <polygon points="2251,1722 2284,1722 2284,1763 2251,1763 2251,1722" />
                  <polygon points="2211,1722 2251,1722 2251,1763 2211,1763 2211,1722" />
                  <polygon points="2177,1722 2211,1722 2211,1763 2177,1763 2177,1722" />
                  <polygon points="2142,1722 2177,1722 2177,1763 2142,1763 2142,1722" />
                  <polygon points="2104,1722 2142,1722 2142,1763 2104,1763 2104,1722" />
                  <polygon points="2279,1627 2322,1627 2322,1675 2279,1675 2279,1627" />
                  <polygon points="2241,1627 2279,1627 2279,1675 2241,1675 2241,1627" />
                  <polygon points="2196,1627 2241,1627 2241,1675 2196,1675 2196,1627" />
                  <polygon points="2161,1627 2196,1627 2196,1675 2161,1675 2161,1627" />
                  <polygon points="2117,1627 2161,1627 2161,1675 2117,1675 2117,1627" />
                  <polygon points="1310,1641 1492,1641 1492,1824 1310,1824 1310,1641" />
                  <polygon points="1427,1836 1472,1836 1472,1877 1427,1877 1427,1836" />
                  <polygon points="1427,1877 1472,1877 1472,1920 1427,1920 1427,1877" />
                  <polygon points="1427,1920 1472,1920 1472,1962 1427,1962 1427,1920" />
                  <polygon points="1384,1920 1427,1920 1427,1962 1384,1962 1384,1920" />
                  <polygon points="1384,1877 1427,1877 1427,1920 1384,1920 1384,1877" />
                  <polygon points="1384,1836 1427,1836 1427,1877 1384,1877 1384,1836" />
                  <polygon points="1310,1836 1356,1836 1356,1879 1310,1879 1310,1836" />
                  <polygon points="1310,1879 1356,1879 1356,1917 1310,1917 1310,1879" />
                  <polygon points="1310,1917 1356,1917 1356,1962 1310,1962 1310,1917" />
                  <polygon points="1310,1962 1356,1962 1356,2001 1310,2001 1310,1962" />
                  <polygon points="1358,2010 1399,2010 1399,2058 1358,2058 1358,2010" />
                  <polygon points="1399,2010 1434,2010 1434,2058 1399,2058 1399,2010" />
                  <polygon points="1434,2010 1472,2010 1472,2058 1434,2058 1434,2010" />
                  <polygon points="1496,2363 1521,2363 1521,2383 1496,2383 1496,2363" />
                  <polygon points="1496,2383 1521,2383 1521,2401 1496,2401 1496,2383" />
                  <polygon points="1496,2401 1521,2401 1521,2418 1496,2418 1496,2401" />
                  <polygon points="1496,2418 1521,2418 1521,2437 1496,2437 1496,2418" />
                  <polygon points="1496,2437 1521,2437 1521,2458 1496,2458 1496,2437" />
                  <polygon points="1496,2458 1521,2458 1521,2480 1496,2480 1496,2458" />
                  <polygon points="1496,2493 1520,2493 1520,2511 1496,2511 1496,2493" />
                  <polygon points="1496,2511 1520,2511 1520,2534 1496,2534 1496,2511" />
                  <polygon points="1496,2534 1520,2534 1520,2554 1496,2554 1496,2534" />
                  <polygon points="1496,2554 1520,2554 1520,2572 1496,2572 1496,2554" />
                  <polygon points="1496,2572 1520,2572 1520,2590 1496,2590 1496,2572" />
                  <polygon points="1496,2590 1520,2590 1520,2610 1496,2610 1496,2590" />
                  <polygon points="1511,2629 1536,2629 1536,2649 1511,2649 1511,2629" />
                  <polygon points="1487,2629 1511,2629 1511,2649 1487,2649 1487,2629" />
                  <polygon points="1460,2629 1487,2629 1487,2649 1460,2649 1460,2629" />
                  <polygon points="1470,2590 1496,2590 1496,2610 1470,2610 1470,2590" />
                  <polygon points="1470,2572 1496,2572 1496,2590 1470,2590 1470,2572" />
                  <polygon points="1470,2554 1496,2554 1496,2572 1470,2572 1470,2554" />
                  <polygon points="1470,2534 1496,2534 1496,2554 1470,2554 1470,2534" />
                  <polygon points="1470,2511 1496,2511 1496,2534 1470,2534 1470,2511" />
                  <polygon points="1470,2493 1496,2493 1496,2511 1470,2511 1470,2493" />
                  <polygon points="1470,2458 1496,2458 1496,2480 1470,2480 1470,2458" />
                  <polygon points="1470,2437 1496,2437 1496,2458 1470,2458 1470,2437" />
                  <polygon points="1470,2418 1496,2418 1496,2437 1470,2437 1470,2418" />
                  <polygon points="1470,2401 1496,2401 1496,2418 1470,2418 1470,2401" />
                  <polygon points="1470,2383 1496,2383 1496,2401 1470,2401 1470,2383" />
                  <polygon points="1470,2363 1496,2363 1496,2383 1470,2383 1470,2363" />
                  <polygon points="1400,2340 1422,2340 1422,2363 1400,2363 1400,2340" />
                  <polygon points="1400,2363 1422,2363 1422,2383 1400,2383 1400,2363" />
                  <polygon points="1400,2383 1422,2383 1422,2402 1400,2402 1400,2383" />
                  <polygon points="1400,2402 1422,2402 1422,2420 1400,2420 1400,2402" />
                  <polygon points="1400,2420 1422,2420 1422,2439 1400,2439 1400,2420" />
                  <polygon points="1400,2439 1422,2439 1422,2458 1400,2458 1400,2439" />
                  <polygon points="1400,2458 1422,2458 1422,2478 1400,2478 1400,2458" />
                  <polygon points="1400,2478 1422,2478 1422,2497 1400,2497 1400,2478" />
                  <polygon points="1400,2497 1422,2497 1422,2518 1400,2518 1400,2497" />
                  <polygon points="1400,2533 1422,2533 1422,2552 1400,2552 1400,2533" />
                  <polygon points="1400,2552 1422,2552 1422,2570 1400,2570 1400,2552" />
                  <polygon points="1400,2570 1422,2570 1422,2593 1400,2593 1400,2570" />
                  <polygon points="1400,2593 1422,2593 1422,2613 1400,2613 1400,2593" />
                  <polygon points="1400,2613 1422,2613 1422,2630 1400,2630 1400,2613" />
                  <polygon points="1400,2630 1422,2630 1422,2649 1400,2649 1400,2630" />
                  <polygon points="1400,2649 1422,2649 1422,2667 1400,2667 1400,2649" />
                  <polygon points="1400,2667 1422,2667 1422,2687 1400,2687 1400,2667" />
                  <polygon points="1407,2705 1435,2705 1435,2728 1407,2728 1407,2705" />
                  <polygon points="1383,2705 1407,2705 1407,2728 1383,2728 1383,2705" />
                  <polygon points="1357,2705 1383,2705 1383,2728 1357,2728 1357,2705" />
                  <polygon points="1374,2667 1400,2667 1400,2687 1374,2687 1374,2667" />
                  <polygon points="1374,2649 1400,2649 1400,2667 1374,2667 1374,2649" />
                  <polygon points="1374,2630 1400,2630 1400,2649 1374,2649 1374,2630" />
                  <polygon points="1374,2613 1400,2613 1400,2630 1374,2630 1374,2613" />
                  <polygon points="1374,2593 1400,2593 1400,2613 1374,2613 1374,2593" />
                  <polygon points="1374,2570 1400,2570 1400,2593 1374,2593 1374,2570" />
                  <polygon points="1374,2552 1400,2552 1400,2570 1374,2570 1374,2552" />
                  <polygon points="1374,2533 1400,2533 1400,2552 1374,2552 1374,2533" />
                  <polygon points="1374,2497 1400,2497 1400,2518 1374,2518 1374,2497" />
                  <polygon points="1374,2478 1400,2478 1400,2497 1374,2497 1374,2478" />
                  <polygon points="1374,2458 1400,2458 1400,2478 1374,2478 1374,2458" />
                  <polygon points="1374,2439 1400,2439 1400,2458 1374,2458 1374,2439" />
                  <polygon points="1374,2420 1400,2420 1400,2439 1374,2439 1374,2420" />
                  <polygon points="1374,2402 1400,2402 1400,2420 1374,2420 1374,2402" />
                  <polygon points="1374,2383 1400,2383 1400,2402 1374,2402 1374,2383" />
                  <polygon points="1374,2363 1400,2363 1400,2383 1374,2383 1374,2363" />
                  <polygon points="1374,2340 1400,2340 1400,2363 1374,2363 1374,2340" />
                  <polygon points="1290,2457 1316,2457 1316,2477 1290,2477 1290,2457" />
                  <polygon points="1290,2477 1316,2477 1316,2495 1290,2495 1290,2477" />
                  <polygon points="1290,2495 1316,2495 1316,2515 1290,2515 1290,2495" />
                  <polygon points="1290,2515 1316,2515 1316,2534 1290,2534 1290,2515" />
                  <polygon points="1290,2534 1316,2534 1316,2554 1290,2554 1290,2534" />
                  <polygon points="1290,2554 1316,2554 1316,2573 1290,2573 1290,2554" />
                  <polygon points="1290,2589 1318,2589 1318,2608 1290,2608 1290,2589" />
                  <polygon points="1290,2608 1318,2608 1318,2628 1290,2628 1290,2608" />
                  <polygon points="1290,2628 1318,2628 1318,2646 1290,2646 1290,2628" />
                  <polygon points="1290,2646 1318,2646 1318,2666 1290,2666 1290,2646" />
                  <polygon points="1290,2666 1318,2666 1318,2686 1290,2686 1290,2666" />
                  <polygon points="1267,2666 1290,2666 1290,2686 1267,2686 1267,2666" />
                  <polygon points="1267,2646 1290,2646 1290,2666 1267,2666 1267,2646" />
                  <polygon points="1267,2628 1290,2628 1290,2646 1267,2646 1267,2628" />
                  <polygon points="1267,2608 1290,2608 1290,2628 1267,2628 1267,2608" />
                  <polygon points="1267,2589 1290,2589 1290,2608 1267,2608 1267,2589" />
                  <polygon points="1267,2554 1290,2554 1290,2573 1267,2573 1267,2554" />
                  <polygon points="1267,2534 1290,2534 1290,2554 1267,2554 1267,2534" />
                  <polygon points="1267,2515 1290,2515 1290,2534 1267,2534 1267,2515" />
                  <polygon points="1267,2495 1290,2495 1290,2515 1267,2515 1267,2495" />
                  <polygon points="1267,2477 1290,2477 1290,2495 1267,2495 1267,2477" />
                  <polygon points="1267,2457 1290,2457 1290,2477 1267,2477 1267,2457" />
                  <polygon points="1220,2455 1241,2455 1241,2474 1220,2474 1220,2455" />
                  <polygon points="1220,2474 1241,2474 1241,2494 1220,2494 1220,2474" />
                  <polygon points="1220,2494 1241,2494 1241,2512 1220,2512 1220,2494" />
                  <polygon points="1220,2512 1241,2512 1241,2533 1220,2533 1220,2512" />
                  <polygon points="1220,2533 1241,2533 1241,2552 1220,2552 1220,2533" />
                  <polygon points="1220,2552 1241,2552 1241,2572 1220,2572 1220,2552" />
                  <polygon points="1220,2589 1244,2589 1244,2608 1220,2608 1220,2589" />
                  <polygon points="1220,2608 1244,2608 1244,2627 1220,2627 1220,2608" />
                  <polygon points="1220,2627 1244,2627 1244,2645 1220,2645 1220,2627" />
                  <polygon points="1220,2645 1244,2645 1244,2667 1220,2667 1220,2645" />
                  <polygon points="1220,2667 1244,2667 1244,2686 1220,2686 1220,2667" />
                  <polygon points="1311,2706 1334,2706 1334,2728 1311,2728 1311,2706" />
                  <polygon points="1284,2706 1311,2706 1311,2728 1284,2728 1284,2706" />
                  <polygon points="1258,2706 1284,2706 1284,2728 1258,2728 1258,2706" />
                  <polygon points="1235,2706 1258,2706 1258,2728 1235,2728 1235,2706" />
                  <polygon points="1211,2706 1235,2706 1235,2728 1211,2728 1211,2706" />
                  <polygon points="1184,2706 1211,2706 1211,2728 1184,2728 1184,2706" />
                  <polygon points="1194,2667 1220,2667 1220,2686 1194,2686 1194,2667" />
                  <polygon points="1194,2645 1220,2645 1220,2667 1194,2667 1194,2645" />
                  <polygon points="1194,2627 1220,2627 1220,2645 1194,2645 1194,2627" />
                  <polygon points="1194,2608 1220,2608 1220,2627 1194,2627 1194,2608" />
                  <polygon points="1194,2589 1220,2589 1220,2608 1194,2608 1194,2589" />
                  <polygon points="1194,2552 1220,2552 1220,2572 1194,2572 1194,2552" />
                  <polygon points="1194,2533 1220,2533 1220,2552 1194,2552 1194,2533" />
                  <polygon points="1194,2512 1220,2512 1220,2533 1194,2533 1194,2512" />
                  <polygon points="1194,2494 1220,2494 1220,2512 1194,2512 1194,2494" />
                  <polygon points="1194,2474 1220,2474 1220,2494 1194,2494 1194,2474" />
                  <polygon points="1194,2455 1220,2455 1220,2474 1194,2474 1194,2455" />
                  <polygon points="824,2084 894,2084 894,2121 824,2121 824,2084" />
                  <polygon points="824,2048 894,2048 894,2084 824,2084 824,2048" />
                  <polygon points="824,2013 894,2013 894,2048 824,2048 824,2013" />
                  <polygon points="824,1978 894,1978 894,2013 824,2013 824,1978" />
                  <polygon points="824,1941 894,1941 894,1978 824,1978 824,1941" />
                  <polygon points="824,1906 894,1906 894,1941 824,1941 824,1906" />
                  <polygon points="824,1871 894,1871 894,1906 824,1906 824,1871" />
                  <polygon points="824,1838 894,1838 894,1871 824,1871 824,1838" />
                  <polygon points="824,1799 894,1799 894,1838 824,1838 824,1799" />
                  <polygon points="824,1764 894,1764 894,1799 824,1799 824,1764" />
                  <polygon points="824,1731 894,1731 894,1764 824,1764 824,1731" />
                  <polygon points="824,1694 894,1694 894,1731 824,1731 824,1694" />
                  <polygon points="824,1661 894,1661 894,1694 824,1694 824,1661" />
                  <polygon points="824,1621 894,1621 894,1661 824,1661 824,1621" />
                  <polygon points="824,1588 894,1588 894,1621 824,1621 824,1588" />
                  <polygon points="824,1554 894,1554 894,1588 824,1588 824,1554" />
                  <polygon points="894,1553 970,1553 970,1588 894,1588 894,1553" />
                  <polygon points="894,1588 970,1588 970,1621 894,1621 894,1588" />
                  <polygon points="894,1621 970,1621 970,1661 894,1661 894,1621" />
                  <polygon points="894,1661 970,1661 970,1694 894,1694 894,1661" />
                  <polygon points="894,1694 970,1694 970,1731 894,1731 894,1694" />
                  <polygon points="894,1731 970,1731 970,1764 894,1764 894,1731" />
                  <polygon points="894,1764 970,1764 970,1799 894,1799 894,1764" />
                  <polygon points="894,1799 970,1799 970,1838 894,1838 894,1799" />
                  <polygon points="894,1838 970,1838 970,1871 894,1871 894,1838" />
                  <polygon points="894,1871 970,1871 970,1906 894,1906 894,1871" />
                  <polygon points="894,1906 970,1906 970,1941 894,1941 894,1906" />
                  <polygon points="894,1941 970,1941 970,1978 894,1978 894,1941" />
                  <polygon points="894,1978 970,1978 970,2013 894,2013 894,1978" />
                  <polygon points="894,2013 970,2013 970,2048 894,2048 894,2013" />
                  <polygon points="894,2048 970,2048 970,2084 894,2084 894,2048" />
                  <polygon points="894,2084 970,2084 970,2121 894,2121 894,2084" />
                  <polygon points="895,2135 1059,2135 1059,2221 895,2221 895,2135" />
                  <polygon points="730,2135 895,2135 895,2221 730,2221 730,2135" />
                  <polygon points="731,2092 774,2092 774,2119 731,2119 731,2092" />
                  <polygon points="731,2059 774,2059 774,2092 731,2092 731,2059" />
                  <polygon points="731,2021 774,2021 774,2059 731,2059 731,2021" />
                  <polygon points="731,1987 774,1987 774,2021 731,2021 731,1987" />
                  <polygon points="731,1955 774,1955 774,1987 731,1987 731,1955" />
                  <polygon points="731,1920 774,1920 774,1955 731,1955 731,1920" />
                  <polygon points="731,1889 774,1889 774,1920 731,1920 731,1889" />
                  <polygon points="731,1854 774,1854 774,1889 731,1889 731,1854" />
                  <polygon points="731,1822 774,1822 774,1854 731,1854 731,1822" />
                  <polygon points="731,1787 774,1787 774,1822 731,1822 731,1787" />
                  <polygon points="731,1755 774,1755 774,1787 731,1787 731,1755" />
                  <polygon points="731,1723 774,1723 774,1755 731,1755 731,1723" />
                  <polygon points="731,1693 774,1693 774,1723 731,1723 731,1693" />
                  <polygon points="731,1656 774,1656 774,1693 731,1693 731,1656" />
                  <polygon points="731,1621 774,1621 774,1656 731,1656 731,1621" />
                  <polygon points="731,1591 774,1591 774,1621 731,1621 731,1591" />
                  <polygon points="731,1553 774,1553 774,1591 731,1591 731,1553" />
                  <polygon points="730,1500 773,1500 773,1534 730,1534 730,1500" />
                  <polygon points="773,1500 811,1500 811,1534 773,1534 773,1500" />
                  <polygon points="811,1500 856,1500 856,1534 811,1534 811,1500" />
                  <polygon points="937,1500 977,1500 977,1534 937,1534 937,1500" />
                  <polygon points="977,1500 1019,1500 1019,1534 977,1534 977,1500" />
                  <polygon points="1019,1500 1059,1500 1059,1534 1019,1534 1019,1500" />
                  <polygon points="1016,1553 1059,1553 1059,1586 1016,1586 1016,1553" />
                  <polygon points="1016,1586 1059,1586 1059,1623 1016,1623 1016,1586" />
                  <polygon points="1016,1623 1059,1623 1059,1655 1016,1655 1016,1623" />
                  <polygon points="1016,1655 1059,1655 1059,1685 1016,1685 1016,1655" />
                  <polygon points="1016,1685 1059,1685 1059,1718 1016,1718 1016,1685" />
                  <polygon points="1016,1718 1059,1718 1059,1753 1016,1753 1016,1718" />
                  <polygon points="1016,1753 1059,1753 1059,1785 1016,1785 1016,1753" />
                  <polygon points="1016,1785 1059,1785 1059,1820 1016,1820 1016,1785" />
                  <polygon points="1016,1820 1059,1820 1059,1852 1016,1852 1016,1820" />
                  <polygon points="1016,1852 1059,1852 1059,1887 1016,1887 1016,1852" />
                  <polygon points="1016,1887 1059,1887 1059,1920 1016,1920 1016,1887" />
                  <polygon points="1016,1920 1059,1920 1059,1954 1016,1954 1016,1920" />
                  <polygon points="1016,1954 1059,1954 1059,1986 1016,1986 1016,1954" />
                  <polygon points="1016,1986 1059,1986 1059,2019 1016,2019 1016,1986" />
                  <polygon points="1016,2019 1059,2019 1059,2054 1016,2054 1016,2019" />
                  <polygon points="1016,2054 1059,2054 1059,2089 1016,2089 1016,2054" />
                  <polygon points="490,1675 537,1675 537,1711 490,1711 490,1675" />
                  <polygon points="490,1711 537,1711 537,1748 490,1748 490,1711" />
                  <polygon points="490,1748 537,1748 537,1788 490,1788 490,1748" />
                  <polygon points="490,1788 537,1788 537,1828 490,1828 490,1788" />
                  <polygon points="490,1828 537,1828 537,1868 490,1868 490,1828" />
                  <polygon points="490,1868 537,1868 537,1907 490,1907 490,1868" />
                  <polygon points="490,1907 537,1907 537,1944 490,1944 490,1907" />
                  <polygon points="490,1944 537,1944 537,1983 490,1983 490,1944" />
                  <polygon points="490,1983 537,1983 537,2025 490,2025 490,1983" />
                  <polygon points="573,1988 616,1988 616,2030 573,2030 573,1988" />
                  <polygon points="573,1948 616,1948 616,1988 573,1988 573,1948" />
                  <polygon points="573,1910 616,1910 616,1948 573,1948 573,1910" />
                  <polygon points="573,1869 616,1869 616,1910 573,1910 573,1869" />
                  <polygon points="573,1832 616,1832 616,1869 573,1869 573,1832" />
                  <polygon points="573,1792 616,1792 616,1832 573,1832 573,1792" />
                  <polygon points="573,1756 616,1756 616,1792 573,1792 573,1756" />
                  <polygon points="573,1713 616,1713 616,1756 573,1756 573,1713" />
                  <polygon points="573,1678 616,1678 616,1713 573,1713 573,1678" />
                  <polygon points="573,1637 616,1637 616,1678 573,1678 573,1637" />
                  <polygon points="410,2058 610,2058 610,2136 409,2136 409,2058" />
                  <polygon points="414,1988 458,1988 458,2024 414,2024 414,1988" />
                  <polygon points="414,1951 458,1951 458,1988 414,1988 414,1951" />
                  <polygon points="414,1911 458,1911 458,1951 414,1951 414,1911" />
                  <polygon points="414,1871 458,1871 458,1911 414,1911 414,1871" />
                  <polygon points="414,1831 458,1831 458,1871 414,1871 414,1831" />
                  <polygon points="414,1794 458,1794 458,1831 414,1831 414,1794" />
                  <polygon points="414,1753 458,1753 458,1794 414,1794 414,1753" />
                  <polygon points="414,1713 458,1713 458,1753 414,1753 414,1713" />
                  <polygon points="414,1678 458,1678 458,1713 414,1713 414,1678" />
                  <polygon points="414,1637 458,1637 458,1678 414,1678 414,1637" />
                  <polygon points="186,1607 350,1607 350,1856 186,1856 186,1607" />
                  <polygon points="570,796 748,796 750,1083 560,1083 560,796" />
                  <polygon points="354,793 540,793 540,1079 354,1079 354,793" />
                  <polygon points="41,201 458,201 458,354 41,354 41,201" />
                  <polygon points="26,391 476,391 476,566 26,566 26,391" />
                  <polygon points="930,368 983,368 983,424 930,424 930,368" />
                  <polygon points="879,368 930,368 930,424 879,424 879,368" />
                  <polygon points="821,368 879,368 879,424 821,424 821,368" />
                  <polygon points="767,368 821,368 821,424 767,424 767,368" />
                  <polygon points="713,368 767,368 767,424 713,424 713,368" />
                  <polygon points="658,368 713,368 713,424 658,424 658,368" />
                  <polygon points="606,368 658,368 658,424 606,424 606,368" />
                  <polygon points="553,368 606,368 606,424 553,424 553,368" />
                  <polygon points="930,317 983,317 983,370 930,370 930,317" />
                  <polygon points="879,317 930,317 930,370 879,370 879,317" />
                  <polygon points="821,317 879,317 879,370 821,370 821,317" />
                  <polygon points="767,317 821,317 821,370 767,370 767,317" />
                  <polygon points="713,317 767,317 767,370 713,370 713,317" />
                  <polygon points="658,317 713,317 713,370 658,370 658,317" />
                  <polygon points="606,317 658,317 658,370 606,370 606,317" />
                  <polygon points="553,317 606,317 606,370 553,370 553,317" />
                  <polygon points="930,235 986,235 986,290 930,290 930,235" />
                  <polygon points="878,235 930,235 930,290 878,290 878,235" />
                  <polygon points="825,235 878,235 878,290 825,290 825,235" />
                  <polygon points="769,235 825,235 825,290 769,290 769,235" />
                  <polygon points="715,235 769,235 769,290 715,290 715,235" />
                  <polygon points="663,235 715,235 715,290 663,290 663,235" />
                  <polygon points="605,235 663,235 663,290 605,290 605,235" />
                  <polygon points="553,235 605,235 605,290 553,290 553,235" />
                </svg>
              </div>
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
          {hoveredStall.reserved && (
            <div className="text-sm text-red-300 mt-1">(Reserved)</div>
          )}
        </div>
      )}
    </div>
  );
}
