import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

export default function MapViewCanvas({ halls, stalls, selectedStalls, onStallClick, hoveredStallId, onHover }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState(null);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    // Zoom towards mouse pointer
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setScale(clampedScale);
    setPosition(newPos);
  };

  const handleMouseDown = (e) => {
    // Start panning if middle mouse button or shift + left click
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) {
      setIsPanning(true);
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      setLastPointerPosition(pointerPos);
      e.evt.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && lastPointerPosition) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      const newPos = {
        x: position.x + (pointerPos.x - lastPointerPosition.x),
        y: position.y + (pointerPos.y - lastPointerPosition.y),
      };
      setPosition(newPos);
      setLastPointerPosition(pointerPos);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setLastPointerPosition(null);
  };

  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    return 'pointer';
  };

  // Get stall color based on map layout data (same as MapCanvas)
  const getStallColor = (stallData, stall) => {
    // If stall is reserved (from database), show as gray
    if (stall && stall.reserved) return 'rgba(100, 100, 100, 0.7)';
    
    // If stall is selected, show as blue
    if (stall && selectedStalls.some(s => s.id === stall.id)) {
      return 'rgba(37, 99, 235, 0.6)';
    }
    
    // If stall is hovered, show as green
    if (stall && hoveredStallId === stall.id) {
      return 'rgba(34, 197, 94, 0.6)';
    }
    
    // Use color from map layout if available
    if (stallData.color) {
      // Convert hex to rgba for consistency
      const hex = stallData.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }
    
    // Fallback to size-based colors (same as MapCanvas)
    const size = stallData.size || (stall ? stall.size : 'SMALL');
    switch (size) {
      case 'SMALL': return 'rgba(255, 235, 59, 0.8)';
      case 'MEDIUM': return 'rgba(255, 152, 0, 0.8)';
      case 'LARGE': return 'rgba(76, 175, 80, 0.8)';
      default: return 'rgba(34, 197, 94, 0.8)'; // Default green
    }
  };

  const getStallStroke = (stall) => {
    const isSelected = stall && selectedStalls.some(s => s.id === stall.id);
    if (isSelected) return '#0070f3';
    
    const isHovered = stall && hoveredStallId === stall.id;
    if (isHovered) return '#4caf50';
    
    return '#333';
  };

  const getStallStrokeWidth = (stall) => {
    const isSelected = stall && selectedStalls.some(s => s.id === stall.id);
    if (isSelected) return 3;
    
    const isHovered = stall && hoveredStallId === stall.id;
    if (isHovered) return 2;
    
    return 1;
  };

  // Helper function to normalize stall names (handles A08 vs A8, A01 vs A1, etc.)
  const normalizeStallName = (name) => {
    if (!name) return '';
    const trimmed = String(name).trim();
    // Match pattern: letter(s) followed by number(s)
    const match = trimmed.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const letter = match[1];
      const number = parseInt(match[2], 10); // Remove leading zeros by parsing as int
      return `${letter}${number}`;
    }
    return trimmed;
  };

  // Create a map of stall names to stall objects for quick lookup
  const stallMap = new Map();
  stalls.forEach(stall => {
    if (stall.name) {
      const name = stall.name.trim();
      // Add exact name (all variations)
      stallMap.set(name, stall);
      stallMap.set(name.toUpperCase(), stall);
      stallMap.set(name.toLowerCase(), stall);
      
      // Add normalized version (A08 -> A8, A01 -> A1, etc.)
      const normalized = normalizeStallName(name);
      if (normalized !== name) {
        stallMap.set(normalized, stall);
        stallMap.set(normalized.toUpperCase(), stall);
        stallMap.set(normalized.toLowerCase(), stall);
      }
    }
    if (stall.id) {
      stallMap.set(stall.id, stall);
      stallMap.set(String(stall.id), stall);
      if (!isNaN(stall.id)) {
        stallMap.set(parseInt(stall.id), stall);
      }
    }
  });
  
  // Debug: Log stall matching info
  if (halls.length > 0 && halls[0].stalls.length > 0) {
    console.log('MapViewCanvas - Total halls:', halls.length);
    console.log('MapViewCanvas - Total stalls in database:', stalls.length);
    console.log('MapViewCanvas - Sample stall from map:', halls[0].stalls[0]);
    console.log('MapViewCanvas - Sample stall from DB:', stalls[0]);
    console.log('MapViewCanvas - Stall map keys:', Array.from(stallMap.keys()).slice(0, 10));
  }

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-gray-50 relative">
      <div id="map-canvas">
        <Stage
          width={1200}
          height={800}
          ref={stageRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          style={{ cursor: getCursorStyle() }}
          onClick={(e) => {
            // Only handle clicks on the stage itself (not on stalls)
            if (isPanning) return;
            const stage = e.target.getStage();
            if (e.target === stage) {
              console.log('Stage clicked (empty area)');
            }
          }}
        >
          <Layer>
            {/* Render halls */}
            {halls.map(hall => (
              <Group key={hall.id}>
                {/* Hall label - with background like MapCanvas */}
                <Group
                  x={hall.labelX || 20}
                  y={hall.labelY || 20}
                  listening={false}
                >
                  <Rect
                    x={-5}
                    y={-5}
                    width={hall.name.length * 14 + 10}
                    height={32}
                    fill="rgba(255, 255, 255, 0.9)"
                    stroke="#ccc"
                    strokeWidth={1}
                    cornerRadius={4}
                    listening={false}
                  />
                  <Text
                    x={0}
                    y={0}
                    text={hall.name}
                    fontSize={24}
                    fontStyle="bold"
                    fill="#333"
                    listening={false}
                  />
                </Group>

                {/* Render stalls for this hall */}
                {hall.stalls.map((stallData, index) => {
                  // Find the corresponding stall from the database by name (e.g., "A01", "B87")
                  const stallId = stallData.stallId || stallData.id || stallData.name;
                  let stall = null;
                  
                  // First, try exact match from stallMap
                  if (stallId) {
                    const normalizedId = String(stallId).trim();
                    // Try exact match first
                    stall = stallMap.get(normalizedId) || 
                            stallMap.get(normalizedId.toUpperCase()) || 
                            stallMap.get(normalizedId.toLowerCase());
                    
                    // Try normalized version (A08 -> A8, A01 -> A1, etc.)
                    if (!stall) {
                      const normalized = normalizeStallName(normalizedId);
                      if (normalized !== normalizedId) {
                        stall = stallMap.get(normalized) || 
                                stallMap.get(normalized.toUpperCase()) || 
                                stallMap.get(normalized.toLowerCase());
                      }
                    }
                    
                    // Try with leading zero (A18 -> A018, A8 -> A08)
                    if (!stall) {
                      const match = normalizedId.match(/^([A-Za-z]+)(\d+)$/);
                      if (match) {
                        const letter = match[1];
                        const number = parseInt(match[2], 10);
                        const withLeadingZero = `${letter}${String(number).padStart(2, '0')}`;
                        stall = stallMap.get(withLeadingZero) || 
                                stallMap.get(withLeadingZero.toUpperCase()) || 
                                stallMap.get(withLeadingZero.toLowerCase());
                      }
                    }
                  }
                  
                  // If still not found, try direct search with strict matching
                  if (!stall && stallId) {
                    const normalizedId = String(stallId).trim();
                    const mapNormalized = normalizeStallName(normalizedId);
                    
                    stall = stalls.find(s => {
                      if (!s.name) return false;
                      
                      const sName = String(s.name).trim();
                      const sNormalized = normalizeStallName(sName);
                      
                      // Exact name match (case-insensitive)
                      if (sName.toLowerCase() === normalizedId.toLowerCase() || 
                          sName.toUpperCase() === normalizedId.toUpperCase()) {
                        return true;
                      }
                      
                      // Normalized match (A08 vs A8, A01 vs A1, etc.)
                      if (sNormalized.toLowerCase() === mapNormalized.toLowerCase() ||
                          sNormalized.toUpperCase() === mapNormalized.toUpperCase()) {
                        return true;
                      }
                      
                      // Try with leading zero (A18 -> A018, A8 -> A08)
                      const mapMatch = normalizedId.match(/^([A-Za-z]+)(\d+)$/);
                      const sMatch = sName.match(/^([A-Za-z]+)(\d+)$/);
                      if (mapMatch && sMatch) {
                        const mapLetter = mapMatch[1];
                        const mapNumber = parseInt(mapMatch[2], 10);
                        const sLetter = sMatch[1];
                        const sNumber = parseInt(sMatch[2], 10);
                        if (mapLetter.toLowerCase() === sLetter.toLowerCase() && 
                            mapNumber === sNumber) {
                          return true;
                        }
                      }
                      
                      // ID match (exact only)
                      if (s.id && String(s.id).trim() === normalizedId) {
                        return true;
                      }
                      
                      return false;
                    });
                  }
                  
                  // Log if stall is not found for debugging
                  if (!stall && stallId) {
                    console.warn(`Stall not found in database: "${stallId}" (from map layout). Available stalls:`, 
                      stalls.slice(0, 10).map(s => ({ id: s.id, name: s.name })));
                  }
                  
                  // If stall not found in database, still render it but make it non-clickable
                  // DO NOT use index-based fallback as it causes incorrect matching
                  if (!stall) {
                    return (
                      <Group
                        key={stallData.id || `stall-${stallId}-${index}`}
                        x={stallData.x}
                        y={stallData.y}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          if (e.evt) {
                            e.evt.stopPropagation();
                            e.evt.preventDefault();
                          }
                          console.error(`Stall "${stallId}" from map layout not found in database.`, {
                            mapStallId: stallId,
                            availableStalls: stalls.slice(0, 10).map(s => ({ id: s.id, name: s.name }))
                          });
                          // Don't call onStallClick with null - show error message instead
                          alert(`Stall "${stallId}" is not available in the database. Please contact admin to sync the map with database stalls.`);
                        }}
                        listening={true}
                      >
                        <Rect
                          width={stallData.width || 80}
                          height={stallData.height || 60}
                          fill="rgba(224, 224, 224, 0.4)"
                          stroke="#999"
                          strokeWidth={1}
                          opacity={0.5}
                          listening={true}
                        />
                        <Text
                          x={5}
                          y={(stallData.height || 60) / 2 - 5}
                          text={stallId || 'N/A'}
                          fontSize={12}
                          fill="#666"
                          fontStyle="bold"
                          listening={false}
                        />
                        <Text
                          x={5}
                          y={(stallData.height || 60) / 2 + 10}
                          text="Not in DB"
                          fontSize={8}
                          fill="#ff0000"
                          listening={false}
                        />
                      </Group>
                    );
                  }

                  const isSelected = stall && selectedStalls.some(s => s.id === stall.id);
                  const isHovered = stall && hoveredStallId === stall.id;
                  const isReserved = stall && stall.reserved;

                  const handleClick = (e) => {
                    e.cancelBubble = true;
                    if (e.evt) {
                      e.evt.stopPropagation();
                      e.evt.preventDefault();
                    }
                    if (stall && onStallClick) {
                      console.log(`Stall clicked: Map ID="${stallId}", Matched DB stall:`, {
                        id: stall.id,
                        name: stall.name,
                        size: stall.size,
                        reserved: stall.reserved
                      });
                      // Ensure stall has all required properties
                      if (!stall.id) {
                        console.error('Matched stall missing ID:', stall);
                        return;
                      }
                      onStallClick(stall);
                    } else if (!stall) {
                      console.error(`Stall "${stallId}" from map not found in database. Cannot select.`, {
                        mapStallId: stallId,
                        availableStalls: stalls.slice(0, 10).map(s => ({ id: s.id, name: s.name }))
                      });
                      // Don't call onStallClick with null - let the user know the stall isn't found
                      // The stall will still be rendered but not clickable
                    }
                  };

                  const handleMouseEnter = () => {
                    if (stall && onHover) {
                      onHover(stall.id);
                    }
                  };

                  const handleMouseLeave = () => {
                    if (onHover) {
                      onHover(null);
                    }
                  };

                  // Use stallData properties for rendering (same as MapCanvas)
                  const stallDisplayId = stallData.stallId || stallData.id || (stall ? stall.name : `Stall ${index + 1}`);
                  const stallDisplaySize = stallData.size || (stall ? stall.size : 'SMALL');

                  return (
                    <Group
                      key={stallData.id || `stall-${stallId}-${index}`}
                      x={stallData.x}
                      y={stallData.y}
                      onClick={handleClick}
                      onTap={handleClick}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      listening={true}
                    >
                      <Rect
                        width={stallData.width || 80}
                        height={stallData.height || 60}
                        fill={getStallColor(stallData, stall)}
                        stroke={getStallStroke(stall)}
                        strokeWidth={getStallStrokeWidth(stall)}
                        shadowBlur={isSelected ? 15 : isHovered ? 10 : 0}
                        shadowColor={isSelected ? '#0070f3' : isHovered ? '#4caf50' : '#000'}
                        shadowOpacity={isSelected ? 0.5 : isHovered ? 0.3 : 0}
                        cornerRadius={4}
                        opacity={isReserved ? 0.5 : 1}
                        listening={true}
                      />
                      <Text
                        x={5}
                        y={(stallData.height || 60) / 2 - 10}
                        text={stallDisplayId}
                        fontSize={12}
                        fill="#000"
                        fontStyle="bold"
                        listening={false}
                      />
                      <Text
                        x={5}
                        y={(stallData.height || 60) / 2 + 5}
                        text={stallDisplaySize}
                        fontSize={10}
                        fill="#666"
                        listening={false}
                      />
                      {/* Selection indicator (same as MapCanvas) */}
                      {isSelected && (
                        <Rect
                          width={stallData.width || 80}
                          height={stallData.height || 60}
                          stroke="#0070f3"
                          strokeWidth={2}
                          fill="transparent"
                          dash={[5, 5]}
                          listening={false}
                        />
                      )}
                    </Group>
                  );
                })}
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Enhanced Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
        {/* Zoom Level Indicator */}
        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-3 mb-2 backdrop-blur-sm bg-white/95">
          <div className="text-xs text-gray-500 text-center mb-1 font-medium">Zoom Level</div>
          <div className="text-lg font-bold text-blue-600 text-center">
            {Math.round(scale * 100)}%
          </div>
        </div>
        
        {/* Zoom In */}
        <button
          onClick={() => {
            const newScale = Math.min(5, scale + 0.1);
            setScale(newScale);
          }}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-blue-50 hover:border-blue-500 transition-all transform hover:scale-105 active:scale-95"
          title="Zoom In (Scroll up)"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        
        {/* Zoom Out */}
        <button
          onClick={() => {
            const newScale = Math.max(0.1, scale - 0.1);
            setScale(newScale);
          }}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-blue-50 hover:border-blue-500 transition-all transform hover:scale-105 active:scale-95"
          title="Zoom Out (Scroll down)"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        
        {/* Reset View */}
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105 active:scale-95 text-xs font-medium text-gray-700"
          title="Reset to Default View"
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
        
        {/* Fit to Content */}
        <button
          onClick={() => {
            // Fit to content
            if (halls.length > 0 && halls[0].stalls && halls[0].stalls.length > 0) {
              const allStalls = halls.flatMap(h => h.stalls || []);
              if (allStalls.length > 0) {
                const minX = Math.min(...allStalls.map(s => s.x || 0));
                const minY = Math.min(...allStalls.map(s => s.y || 0));
                const maxX = Math.max(...allStalls.map(s => (s.x || 0) + (s.width || 80)));
                const maxY = Math.max(...allStalls.map(s => (s.y || 0) + (s.height || 60)));
                
                const contentWidth = maxX - minX;
                const contentHeight = maxY - minY;
                const scaleX = 1200 / (contentWidth + 100);
                const scaleY = 800 / (contentHeight + 100);
                const newScale = Math.min(scaleX, scaleY, 1);
                
                setScale(newScale);
                setPosition({ x: -minX * newScale + 50, y: -minY * newScale + 50 });
              }
            }
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-600 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 text-xs font-semibold"
          title="Fit All Stalls in View"
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
          Fit View
        </button>
      </div>

    </div>
  );
}

