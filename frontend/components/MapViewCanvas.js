import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

export default function MapViewCanvas({ halls, stalls, selectedStalls, onStallClick, hoveredStallId, onHover }) {
  const [scale, setScale] = useState(1);
  const stageRef = useRef(null);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.5, Math.min(2, newScale));
    setScale(clampedScale);
  };

  const getStallColor = (stall) => {
    if (stall.reserved) return 'rgba(100, 100, 100, 0.7)';
    
    const isSelected = selectedStalls.some(s => s.id === stall.id);
    if (isSelected) return 'rgba(37, 99, 235, 0.6)';
    
    const isHovered = hoveredStallId === stall.id;
    if (isHovered) return 'rgba(34, 197, 94, 0.6)';
    
    switch (stall.size) {
      case 'SMALL': return 'rgba(255, 235, 59, 0.6)';
      case 'MEDIUM': return 'rgba(255, 152, 0, 0.6)';
      case 'LARGE': return 'rgba(76, 175, 80, 0.6)';
      default: return 'rgba(224, 224, 224, 0.6)';
    }
  };

  const getStallStroke = (stall) => {
    const isSelected = selectedStalls.some(s => s.id === stall.id);
    if (isSelected) return '#0070f3';
    
    const isHovered = hoveredStallId === stall.id;
    if (isHovered) return '#4caf50';
    
    return '#333';
  };

  const getStallStrokeWidth = (stall) => {
    const isSelected = selectedStalls.some(s => s.id === stall.id);
    if (isSelected) return 4;
    
    const isHovered = hoveredStallId === stall.id;
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
          scaleX={scale}
          scaleY={scale}
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            // Only handle clicks on the stage itself (not on stalls)
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
                {/* Hall label */}
                <Text
                  x={20}
                  y={20}
                  text={hall.name}
                  fontSize={24}
                  fontStyle="bold"
                  fill="#333"
                />

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

                  const isSelected = selectedStalls.some(s => s.id === stall.id);
                  const isHovered = hoveredStallId === stall.id;
                  const isReserved = stall.reserved;

                  const handleClick = (e) => {
                    e.cancelBubble = true;
                    if (e.evt) {
                      e.evt.stopPropagation();
                      e.evt.preventDefault();
                    }
                    console.log('Stall clicked in MapViewCanvas:', {
                      stall: stall,
                      stallId: stall.id,
                      stallName: stall.name,
                      isSelected: isSelected,
                      isReserved: isReserved
                    });
                    if (onStallClick) {
                      onStallClick(stall);
                    } else {
                      console.warn('onStallClick handler is not provided');
                    }
                  };

                  const handleMouseEnter = () => {
                    if (onHover) {
                      onHover(stall.id);
                    }
                  };

                  const handleMouseLeave = () => {
                    if (onHover) {
                      onHover(null);
                    }
                  };

                  return (
                    <Group
                      key={stallData.id || stall.id || `stall-${index}`}
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
                        fill={getStallColor(stall)}
                        stroke={getStallStroke(stall)}
                        strokeWidth={getStallStrokeWidth(stall)}
                        shadowBlur={isSelected ? 10 : 0}
                        shadowColor={isSelected ? '#0070f3' : 'transparent'}
                        opacity={isReserved ? 0.5 : 1}
                        onClick={handleClick}
                        onTap={handleClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        listening={true}
                      />
                      <Text
                        x={5}
                        y={(stallData.height || 60) / 2 - 10}
                        text={stall.name || stallData.stallId || `Stall ${index + 1}`}
                        fontSize={12}
                        fill="#000"
                        fontStyle="bold"
                        listening={false}
                      />
                      <Text
                        x={5}
                        y={(stallData.height || 60) / 2 + 5}
                        text={stall.size || stallData.size || 'MEDIUM'}
                        fontSize={10}
                        fill="#666"
                        listening={false}
                      />
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
        <button
          onClick={() => setScale(Math.min(2, scale + 0.1))}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
        >
          +
        </button>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
        >
          −
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow text-xs hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

