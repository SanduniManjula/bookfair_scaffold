import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import reservationsApi from '../lib/api/reservations';
import userApi from '../lib/api/user';

export default function AddGenres() {
  const router = useRouter();
  const { stallIds } = router.query;
  const [user, setUser] = useState(null);
  const [stalls, setStalls] = useState([]);
  const [stallGenres, setStallGenres] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Popular genres for quick selection
  const popularGenres = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Thriller',
    'Romance',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'Children',
    'Young Adult',
    'Poetry',
    'Comics',
    'Graphic Novels',
    'Horror',
    'Adventure',
    'Philosophy',
    'Religion',
    'Cookbook',
    'Travel',
    'Art',
    'Science',
    'Technology'
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(savedUser));
    
    if (stallIds) {
      loadStalls(stallIds);
    } else {
      setLoading(false);
    }
  }, [router, stallIds]);

  const loadStalls = async (ids) => {
    try {
      setLoading(true);
      const stallIdArray = ids.split(',');
      
      // Fetch all stalls using API client
      const allStalls = await reservationsApi.getAllStalls();
      
      // Filter to get only the reserved stalls
      const reservedStalls = allStalls.filter(stall => 
        stallIdArray.includes(stall.id.toString())
      );
      setStalls(reservedStalls);
      
      // Initialize stallGenres state with existing genres
      const initialGenres = {};
      reservedStalls.forEach(stall => {
        // Pre-fill with existing genres if available
        const existingGenres = stall.genres 
          ? stall.genres.split(',').map(g => g.trim()).filter(g => g)
          : [];
        
        initialGenres[stall.id] = {
          selectedGenres: existingGenres,
          customGenre: ''
        };
      });
      setStallGenres(initialGenres);
    } catch (err) {
      console.error('Failed to load stalls:', err);
      setMessage(err.message || 'Failed to load stalls. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (stallId, genre) => {
    setStallGenres(prev => {
      const current = prev[stallId] || { selectedGenres: [], customGenre: '' };
      const selectedGenres = current.selectedGenres || [];
      
      if (selectedGenres.includes(genre)) {
        return {
          ...prev,
          [stallId]: {
            ...current,
            selectedGenres: selectedGenres.filter(g => g !== genre)
          }
        };
      } else {
        return {
          ...prev,
          [stallId]: {
            ...current,
            selectedGenres: [...selectedGenres, genre]
          }
        };
      }
    });
  };

  const addCustomGenre = (stallId) => {
    const customGenre = stallGenres[stallId]?.customGenre?.trim();
    if (!customGenre) return;
    
    setStallGenres(prev => {
      const current = prev[stallId] || { selectedGenres: [], customGenre: '' };
      const selectedGenres = current.selectedGenres || [];
      
      if (!selectedGenres.includes(customGenre)) {
        return {
          ...prev,
          [stallId]: {
            ...current,
            selectedGenres: [...selectedGenres, customGenre],
            customGenre: ''
          }
        };
      }
      return prev;
    });
  };

  const removeGenre = (stallId, genre) => {
    setStallGenres(prev => {
      const current = prev[stallId] || { selectedGenres: [], customGenre: '' };
      return {
        ...prev,
        [stallId]: {
          ...current,
          selectedGenres: (current.selectedGenres || []).filter(g => g !== genre)
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      // Check if any stall has existing genres (edit mode)
      const isEditMode = stalls.some(stall => stall.genres && stall.genres.trim());
      
      // Prepare data for backend
      const genresData = stalls.map(stall => ({
        stallId: stall.id,
        stallName: stall.name,
        genres: (stallGenres[stall.id]?.selectedGenres || []).join(', ')
      }));

      // Save genres using API client
      await reservationsApi.saveStallGenres(genresData);
      
      setMessage(`Genres ${isEditMode ? 'updated' : 'saved'} successfully!`);
      setMessageType('success');
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err) {
      setMessage(err.message || 'Failed to save genres. Please try again.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your stalls...</p>
        </div>
      </div>
    );
  }

  if (!user || stalls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Stalls Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any stalls to add genres to.
          </p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Check if any stall has existing genres (edit mode)
  const isEditMode = stalls.some(stall => stall.genres && stall.genres.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEditMode ? 'Edit Genres for Your Stalls' : 'Add Genres to Your Stalls'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select or add genres for each stall to help visitors discover the books you'll be showcasing
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 animate-fadeIn max-w-4xl mx-auto ${
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

        {/* Stalls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {stalls.map((stall) => {
            const selectedGenres = stallGenres[stall.id]?.selectedGenres || [];
            const customGenre = stallGenres[stall.id]?.customGenre || '';

            return (
              <div key={stall.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all">
                {/* Stall Header */}
                <div className="mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Stall {stall.name}</span>
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      stall.size === 'SMALL' ? 'bg-yellow-100 text-yellow-800' :
                      stall.size === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {stall.size}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Select genres that best describe the books you'll showcase
                  </p>
                </div>

                {/* Selected Genres Display */}
                {selectedGenres.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Selected ({selectedGenres.length})
                    </h4>
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      {selectedGenres.map((genre) => (
                        <span
                          key={genre}
                          className="group px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium flex items-center space-x-1 hover:bg-blue-700 transition-colors cursor-pointer"
                          onClick={() => removeGenre(stall.id, genre)}
                        >
                          <span>{genre}</span>
                          <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Genres */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Popular Genres</h4>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2">
                    {popularGenres.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(stall.id, genre)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-gray-300 text-gray-700 border-2 border-gray-400'
                              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Genre Input */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Add Custom Genre</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter custom genre..."
                      value={customGenre}
                      onChange={(e) => setStallGenres(prev => ({
                        ...prev,
                        [stall.id]: {
                          ...prev[stall.id],
                          customGenre: e.target.value
                        }
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCustomGenre(stall.id);
                        }
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <button
                      onClick={() => addCustomGenre(stall.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save All Genres</span>
              </>
            )}
          </button>
          <button
            onClick={handleSkip}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}
