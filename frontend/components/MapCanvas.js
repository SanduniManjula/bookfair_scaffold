import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

export default function MapCanvas({ halls, setHalls, mode, onStallClick }) {
  const [draggedStall, setDraggedStall] = useState(null);
  const [scale, setScale] = useState(1);
  const stageRef = useRef(null);

  const handleStallDragStart = (e, stall) => {
    setDraggedStall(stall.id);
  };

  const handleStallDragEnd = (e, stall) => {
    const newX = e.target.x();
    const newY = e.target.y();

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

  const handleStallClick = (stall) => {
    if (mode === 'select' || mode === 'draw') {
      onStallClick(stall);
    }
  };

  const handleCanvasClick = (e) => {
    if (mode === 'draw') {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      
      // Find which hall to add stall to (use first hall or prompt)
      if (halls.length > 0) {
        const hall = halls[0]; // Default to first hall
        const newStall = {
          id: `stall-${Date.now()}`,
          stallId: `A${hall.stalls.length + 1}`,
          x: point.x,
          y: point.y,
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
      }
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.5, Math.min(2, newScale));

    setScale(clampedScale);
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
          onClick={handleCanvasClick}
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'default' }}
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
              {hall.stalls.map(stall => (
                <Group
                  key={stall.id}
                  x={stall.x}
                  y={stall.y}
                  draggable={mode === 'select'}
                  onDragStart={(e) => handleStallDragStart(e, stall)}
                  onDragEnd={(e) => handleStallDragEnd(e, stall)}
                  onClick={() => handleStallClick(stall)}
                  onTap={() => handleStallClick(stall)}
                >
                  <Rect
                    width={stall.width}
                    height={stall.height}
                    fill={getStallColor(stall)}
                    stroke="#333"
                    strokeWidth={draggedStall === stall.id ? 3 : 1}
                    shadowBlur={draggedStall === stall.id ? 10 : 0}
                  />
                  <Text
                    x={5}
                    y={stall.height / 2 - 10}
                    text={stall.stallId || stall.id}
                    fontSize={12}
                    fill="#000"
                    fontStyle="bold"
                  />
                  <Text
                    x={5}
                    y={stall.height / 2 + 5}
                    text={stall.size}
                    fontSize={10}
                    fill="#666"
                  />
                </Group>
              ))}
            </Group>
          ))}
        </Layer>
        </Stage>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
        <button
          onClick={() => setScale(Math.min(2, scale + 0.1))}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow"
        >
          +
        </button>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow"
        >
          −
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow text-xs"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

