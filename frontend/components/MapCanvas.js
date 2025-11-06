import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';

export default function MapCanvas({ halls, setHalls, mode, onStallClick, selectedHall }) {
  const [draggedStall, setDraggedStall] = useState(null);
  const [selectedStallId, setSelectedStallId] = useState(null);
  const [draggedHallLabel, setDraggedHallLabel] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const stageRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState(null);

  const handleStallDragStart = (e, stall) => {
    setDraggedStall(stall.id);
  };

  const handleStallDragEnd = (e, stall) => {
    let newX = e.target.x();
    let newY = e.target.y();

    // Snap to grid if enabled
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    setHalls(halls.map(hall => ({
      ...hall,
      stalls: hall.stalls.map(s => 
        s.id === stall.id 
          ? { ...s, x: newX, y: newY }
          : s
      )
    })));

    setDraggedStall(null);
  };

  const handleHallLabelDragStart = (e, hall) => {
    setDraggedHallLabel(hall.id);
  };

  const handleHallLabelDragEnd = (e, hall) => {
    let newX = e.target.x();
    let newY = e.target.y();

    // Snap to grid if enabled
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    setHalls(halls.map(h => 
      h.id === hall.id 
        ? { ...h, labelX: newX, labelY: newY }
        : h
    ));

    setDraggedHallLabel(null);
  };

  const handleStallClick = (stall, e) => {
    if (e && e.evt) {
      e.evt.stopPropagation();
    }
    if (mode === 'select' || mode === 'draw') {
      setSelectedStallId(stall.id);
      onStallClick(stall);
    } else if (mode === 'delete') {
      // Delete stall
      setHalls(halls.map(hall => ({
        ...hall,
        stalls: hall.stalls.filter(s => s.id !== stall.id)
      })));
    }
  };

  const handleCanvasClick = (e) => {
    // Don't create stall if clicking on existing stall or if panning
    if (isPanning || e.target !== e.target.getStage()) {
      return;
    }

    if (mode === 'draw') {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      
      // Adjust for scale and position to get actual canvas coordinates
      const point = {
        x: (pointerPos.x - position.x) / scale,
        y: (pointerPos.y - position.y) / scale
      };
      
      // Snap to grid if enabled
      let x = point.x;
      let y = point.y;
      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }
      
      // Ensure positive coordinates
      x = Math.max(0, x);
      y = Math.max(0, y);
      
      // Find which hall to add stall to (use selected hall or first hall)
      const hall = selectedHall || (halls.length > 0 ? halls[0] : null);
      if (hall) {
        const stallCount = hall.stalls.length;
        const hallPrefix = hall.name.match(/[A-Z]/)?.[0] || 'A';
        // Format stall ID with leading zeros for single digits (A01-A09, then A10, A11, etc.)
        const stallNumber = stallCount + 1;
        const stallId = stallNumber < 10 
          ? `${hallPrefix}0${stallNumber}` 
          : `${hallPrefix}${stallNumber}`;
        
        const newStall = {
          id: `stall-${Date.now()}`,
          stallId: stallId,
          x: x,
          y: y,
          width: 80,
          height: 60,
          size: 'SMALL',
          color: '#22C55E',
          status: 'AVAILABLE',
          hallId: hall.id
        };

        setHalls(halls.map(h => 
          h.id === hall.id 
            ? { ...h, stalls: [...h.stalls, newStall] }
            : h
        ));
      } else {
        console.warn('No hall available. Please create a hall first.');
      }
    } else if (mode === 'select') {
      // Deselect when clicking on empty canvas
      setSelectedStallId(null);
    }
  };

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
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey && mode === 'select')) {
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key to remove selected stall
      if (e.key === 'Delete' && selectedStallId && mode === 'select') {
        setHalls(halls.map(hall => ({
          ...hall,
          stalls: hall.stalls.filter(s => s.id !== selectedStallId)
        })));
        setSelectedStallId(null);
      }
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedStallId(null);
      }
      // Toggle grid with G key
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(!showGrid);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStallId, halls, mode, showGrid]);

  // Generate grid lines
  const generateGridLines = () => {
    if (!showGrid) return [];
    const lines = [];
    const stageWidth = 1200;
    const stageHeight = 800;
    
    // Vertical lines
    for (let x = 0; x <= stageWidth; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, stageHeight]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= stageHeight; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, stageWidth, y]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    
    return lines;
  };

  const getStallColor = (stall) => {
    if (stall.status === 'RESERVED') return '#cccccc';
    const sizeColors = {
      'SMALL': '#ffeb3b',
      'MEDIUM': '#ff9800',
      'LARGE': '#4caf50'
    };
    return stall.color || sizeColors[stall.size] || '#22C55E';
  };

  const getCursorStyle = () => {
    if (mode === 'draw') return 'crosshair';
    if (mode === 'delete') return 'not-allowed';
    if (isPanning) return 'grabbing';
    return 'default';
  };

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
          onClick={handleCanvasClick}
          style={{ cursor: getCursorStyle() }}
        >
        <Layer>
          {/* Grid overlay */}
          <Group listening={false}>
            {generateGridLines()}
          </Group>

          {/* Render halls */}
          {halls.map(hall => {
            const labelX = hall.labelX || 20;
            const labelY = hall.labelY || 20;
            const isDraggingLabel = draggedHallLabel === hall.id;
            
            return (
              <Group key={hall.id}>
                {/* Hall label - draggable */}
                <Group
                  x={labelX}
                  y={labelY}
                  draggable={mode === 'select'}
                  onDragStart={(e) => handleHallLabelDragStart(e, hall)}
                  onDragEnd={(e) => handleHallLabelDragEnd(e, hall)}
                >
                  {/* Background for better visibility */}
                  <Rect
                    x={-5}
                    y={-5}
                    width={hall.name.length * 14 + 10}
                    height={32}
                    fill="rgba(255, 255, 255, 0.9)"
                    stroke={isDraggingLabel ? '#0070f3' : '#ccc'}
                    strokeWidth={isDraggingLabel ? 2 : 1}
                    cornerRadius={4}
                    shadowBlur={isDraggingLabel ? 10 : 0}
                    shadowColor="#000"
                    shadowOpacity={0.3}
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
              {hall.stalls.map(stall => {
                const isSelected = selectedStallId === stall.id;
                const isDragging = draggedStall === stall.id;
                
                return (
                  <Group
                    key={stall.id}
                    x={stall.x}
                    y={stall.y}
                    draggable={mode === 'select'}
                    onDragStart={(e) => handleStallDragStart(e, stall)}
                    onDragEnd={(e) => handleStallDragEnd(e, stall)}
                    onClick={(e) => handleStallClick(stall, e)}
                    onTap={(e) => handleStallClick(stall, e)}
                  >
                    <Rect
                      width={stall.width}
                      height={stall.height}
                      fill={getStallColor(stall)}
                      stroke={isSelected ? '#0070f3' : '#333'}
                      strokeWidth={isSelected ? 3 : isDragging ? 2 : 1}
                      shadowBlur={isSelected ? 15 : isDragging ? 10 : 0}
                      shadowColor={isSelected ? '#0070f3' : '#000'}
                      shadowOpacity={isSelected ? 0.5 : 0.3}
                      cornerRadius={4}
                    />
                    <Text
                      x={5}
                      y={stall.height / 2 - 10}
                      text={stall.stallId || stall.id}
                      fontSize={12}
                      fill="#000"
                      fontStyle="bold"
                      listening={false}
                    />
                    <Text
                      x={5}
                      y={stall.height / 2 + 5}
                      text={stall.size || 'SMALL'}
                      fontSize={10}
                      fill="#666"
                      listening={false}
                    />
                    {/* Selection indicator */}
                    {isSelected && (
                      <Rect
                        width={stall.width}
                        height={stall.height}
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
            );
          })}
        </Layer>
        </Stage>
      </div>

      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        {/* Grid toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm ${
            showGrid ? 'bg-blue-50 border-blue-300' : ''
          }`}
          title="Toggle Grid (G)"
        >
          {showGrid ? '⊞ Grid' : '⊞ No Grid'}
        </button>
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm ${
            snapToGrid ? 'bg-green-50 border-green-300' : ''
          }`}
          title="Snap to Grid"
        >
          {snapToGrid ? '🔗 Snap' : '🔗 No Snap'}
        </button>
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
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => {
            const newScale = Math.max(0.1, scale - 0.1);
            setScale(newScale);
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow text-xs hover:bg-gray-50"
          title="Reset View"
        >
          Reset
        </button>
        <button
          onClick={() => {
            // Fit to content
            if (halls.length > 0 && halls[0].stalls.length > 0) {
              const allStalls = halls.flatMap(h => h.stalls);
              const minX = Math.min(...allStalls.map(s => s.x));
              const minY = Math.min(...allStalls.map(s => s.y));
              const maxX = Math.max(...allStalls.map(s => s.x + s.width));
              const maxY = Math.max(...allStalls.map(s => s.y + s.height));
              
              const contentWidth = maxX - minX;
              const contentHeight = maxY - minY;
              const scaleX = 1200 / (contentWidth + 100);
              const scaleY = 800 / (contentHeight + 100);
              const newScale = Math.min(scaleX, scaleY, 1);
              
              setScale(newScale);
              setPosition({ x: -minX * newScale + 50, y: -minY * newScale + 50 });
            }
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow text-xs hover:bg-gray-50"
          title="Fit to Content"
        >
          Fit
        </button>
      </div>

    </div>
  );
}

