import { useState, useEffect } from 'react';

export default function EditStallModal({ stall, onUpdate, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    stallId: '',
    size: 'SMALL',
    status: 'AVAILABLE',
    color: '#22C55E',
    width: 80,
    height: 60
  });

  useEffect(() => {
    if (stall) {
      setFormData({
        stallId: stall.stallId || '',
        size: stall.size || 'SMALL',
        status: stall.status || 'AVAILABLE',
        color: stall.color || '#22C55E',
        width: stall.width || 80,
        height: stall.height || 60
      });
    }
  }, [stall]);

  const sizeColors = {
    'SMALL': '#ffeb3b',
    'MEDIUM': '#ff9800',
    'LARGE': '#4caf50'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedStall = {
      ...stall,
      ...formData,
      color: formData.color || sizeColors[formData.size]
    };
    onUpdate(updatedStall);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this stall?')) {
      onDelete(stall.id);
    }
  };

  if (!stall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Edit Stall</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stall ID
              </label>
              <input
                type="text"
                value={formData.stallId}
                onChange={(e) => setFormData({ ...formData, stallId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => {
                  const newSize = e.target.value;
                  setFormData({ 
                    ...formData, 
                    size: newSize,
                    color: sizeColors[newSize] || formData.color
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 80 })}
                  min="40"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 60 })}
                  min="40"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

