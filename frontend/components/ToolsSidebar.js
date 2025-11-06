import { useState } from 'react';

export default function ToolsSidebar({ halls, setHalls, mode, setMode, selectedHall, setSelectedHall }) {
  const [hallName, setHallName] = useState('');
  const [stallPrefix, setStallPrefix] = useState('A');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(8);
  const [stallSize, setStallSize] = useState('SMALL');
  const [selectedColor, setSelectedColor] = useState('#22C55E');

  const sizeColors = {
    'SMALL': '#ffeb3b',
    'MEDIUM': '#ff9800',
    'LARGE': '#4caf50',
    'RESERVED': '#cccccc'
  };

  const handleAddGrid = () => {
    if (!hallName.trim()) {
      alert('Please enter a hall name');
      return;
    }

    const hall = halls.find(h => h.name === hallName.trim());
    if (!hall) {
      alert('Hall not found. Please create the hall first.');
      return;
    }

    const newStalls = [];
    const cellWidth = 80;
    const cellHeight = 60;
    const startX = 50;
    const startY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const stallNumber = row * cols + col + 1;
        const stallId = stallNumber < 10 
          ? `${stallPrefix}0${stallNumber}` 
          : `${stallPrefix}${stallNumber}`;

        newStalls.push({
          id: `stall-${Date.now()}-${row}-${col}`,
          stallId: stallId,
          x: startX + col * (cellWidth + 10),
          y: startY + row * (cellHeight + 10),
          width: cellWidth,
          height: cellHeight,
          size: stallSize,
          color: sizeColors[stallSize] || selectedColor,
          status: 'AVAILABLE',
          hallId: hall.id
        });
      }
    }

    setHalls(halls.map(h => 
      h.id === hall.id 
        ? { ...h, stalls: [...h.stalls, ...newStalls] }
        : h
    ));

    // Reset form
    setHallName('');
    setRows(3);
    setCols(8);
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Tools</h3>

      {/* Hall Selection */}
      {halls.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Active Hall</label>
          <select
            value={selectedHall?.id || ''}
            onChange={(e) => {
              const hall = halls.find(h => h.id === e.target.value);
              setSelectedHall(hall || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            {halls.map(hall => (
              <option key={hall.id} value={hall.id}>
                {hall.name} ({hall.stalls.length} stalls)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
        <div className="space-y-2">
          <button
            onClick={() => setMode('select')}
            className={`w-full px-3 py-2 rounded transition-colors ${
              mode === 'select' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✋ Select
          </button>
          <button
            onClick={() => setMode('draw')}
            className={`w-full px-3 py-2 rounded transition-colors ${
              mode === 'draw' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✏️ Draw Mode
          </button>
          <button
            onClick={() => setMode('delete')}
            className={`w-full px-3 py-2 rounded transition-colors ${
              mode === 'delete' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🗑️ Delete Mode
          </button>
        </div>
      </div>

      {/* Add Grid Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Add Stall Grid</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Hall Name</label>
            <select
              value={hallName}
              onChange={(e) => setHallName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Hall</option>
              {halls.map(hall => (
                <option key={hall.id} value={hall.name}>{hall.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Stall Prefix</label>
            <input
              type="text"
              value={stallPrefix}
              onChange={(e) => setStallPrefix(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Rows</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Columns</label>
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Stall Size</label>
            <select
              value={stallSize}
              onChange={(e) => setStallSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="SMALL">Small</option>
              <option value="MEDIUM">Medium</option>
              <option value="LARGE">Large</option>
            </select>
          </div>

          <button
            onClick={handleAddGrid}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🟩 Add Stalls
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Stall Color</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      {/* Stall Legend */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: sizeColors.SMALL }}></div>
            <span className="text-sm">Small</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: sizeColors.MEDIUM }}></div>
            <span className="text-sm">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: sizeColors.LARGE }}></div>
            <span className="text-sm">Large</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: sizeColors.RESERVED }}></div>
            <span className="text-sm">Reserved</span>
          </div>
        </div>
      </div>

    </div>
  );
}

