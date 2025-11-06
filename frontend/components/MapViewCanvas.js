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

  // Create a map of stall names to stall objects for quick lookup
  const stallMap = new Map();
  stalls.forEach(stall => {
    if (stall.name) {
      stallMap.set(stall.name, stall);
      stallMap.set(stall.name.toUpperCase(), stall);
      stallMap.set(stall.name.trim(), stall);
    }
    if (stall.id) {
      stallMap.set(stall.id, stall);
      stallMap.set(String(stall.id), stall);
      stallMap.set(parseInt(stall.id), stall);
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
                  let stall = stallMap.get(stallId);
                  
                  // If not found by exact match, try multiple matching strategies
                  if (!stall) {
                    stall = stalls.find(s => {
                      // Try matching by name (string comparison, case-insensitive)
                      if (s.name && typeof s.name === 'string' && stallId && typeof stallId === 'string') {
                        const sName = s.name.trim().toUpperCase();
                        const mapName = stallId.trim().toUpperCase();
                        if (sName === mapName) return true;
                        // Try partial match (e.g., "A1" matches "A01")
                        if (sName.replace(/^0+/, '') === mapName.replace(/^0+/, '')) return true;
                      }
                      // Try matching by ID (numeric or string)
                      if (s.id && stallId) {
                        if (s.id === stallId || s.id === parseInt(stallId) || String(s.id) === String(stallId)) {
                          return true;
                        }
                      }
                      // Try matching by index if available
                      if (index < stalls.length && s.id === stalls[index].id) {
                        return true;
                      }
                      return false;
                    });
                  }
                  
                  // If stall not found in database, still render it but with default values
                  if (!stall) {
                    console.warn('Stall not found in database:', stallId, 'Map stall index:', index, 'Available stalls:', stalls.slice(0, 5).map(s => ({ id: s.id, name: s.name })));
                    // Try to use stall by index as fallback
                    const fallbackStall = stalls[index];
                    if (fallbackStall) {
                      stall = fallbackStall;
                      console.log('Using fallback stall by index:', fallbackStall);
                    } else {
                      return (
                        <Group
                          key={stallData.id || `stall-${stallId}-${index}`}
                          x={stallData.x}
                          y={stallData.y}
                          onClick={() => {
                            console.warn('Stall not found in database:', stallId);
                            if (onStallClick) {
                              onStallClick(null);
                            }
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
                        </Group>
                      );
                    }
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
                      onStallClick(stall);
                    } else if (!stall) {
                      console.warn('Stall not found in database:', stallId);
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

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
        <div className="bg-white border border-gray-300 rounded shadow p-2 mb-2">
          <div className="text-xs text-gray-600 text-center mb-1">
            {Math.round(scale * 100)}%
          </div>
        </div>
        <button
          onClick={() => {
            const newScale = Math.min(5, scale + 0.1);
            setScale(newScale);
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => {
            const newScale = Math.max(0.1, scale - 0.1);
            setScale(newScale);
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow text-xs hover:bg-gray-50 transition-colors"
          title="Reset View"
        >
          Reset
        </button>
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
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow text-xs hover:bg-gray-50 transition-colors"
          title="Fit to Content"
        >
          Fit
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 border border-gray-300 rounded shadow p-3 text-xs z-10 max-w-xs">
        <div className="font-semibold mb-2">Map Controls:</div>
        <div className="space-y-1 text-gray-600">
          <div>• <kbd className="px-1 bg-gray-100 rounded">Wheel</kbd> - Zoom</div>
          <div>• <kbd className="px-1 bg-gray-100 rounded">Shift + Drag</kbd> - Pan</div>
          <div>• <kbd className="px-1 bg-gray-100 rounded">Click</kbd> - Select Stall</div>
        </div>
      </div>
    </div>
  );
}

