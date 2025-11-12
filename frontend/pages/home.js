import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import userApi from "../lib/api/user";
import reservationsApi from "../lib/api/reservations";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [genres, setGenres] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userReservations, setUserReservations] = useState([]);
  const [reservationsCount, setReservationsCount] = useState(0);

  // On mount, load user from localStorage and fetch profile
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchUserProfile();
      fetchUserReservations();
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch user profile including genres
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getProfile();
      if (data.genres) {
        // Check if genres is JSON (from old registration) or plain text
        let genresText = data.genres;
        try {
          const parsed = JSON.parse(data.genres);
          // If it's an object with contactPerson, phone, address, it's old format
          if (parsed.contactPerson || parsed.phone || parsed.address) {
            // This is contact info stored in genres field, clear it
            genresText = "";
          } else {
            // It's valid JSON but not contact info, use as is
            genresText = data.genres;
          }
        } catch (e) {
          // Not JSON, use as plain text
          genresText = data.genres;
        }
        setGenres(genresText);
      }
      // Update user data with latest from server
      setUser(prevUser => ({
        ...prevUser,
        ...data
      }));
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user reservations with details
  const fetchUserReservations = async () => {
    try {
      const data = await reservationsApi.getMyReservations();
      setUserReservations(data || []);
      setReservationsCount(data?.length || 0);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setUserReservations([]);
      setReservationsCount(0);
    }
  };

  // Save genres to backend
  const handleSaveGenres = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsSaving(true);

    try {
      // Ensure genres is plain text, not JSON
      let genresToSave = genres.trim();
      
      // Validate: if it looks like JSON with contact info, reject it
      try {
        const parsed = JSON.parse(genresToSave);
        if (parsed.contactPerson || parsed.phone || parsed.address) {
          setMessage("Invalid genres format. Please enter genres as plain text, separated by commas.");
          setMessageType("error");
          setIsSaving(false);
          return;
        }
      } catch (e) {
        // Not JSON, which is good - proceed with saving
      }
      
      await userApi.updateGenres(user.email, genresToSave);
      setMessage("Genres updated successfully! 🎉");
      setMessageType("success");
      // Refresh profile and reservations to get updated data
      await fetchUserProfile();
      await fetchUserReservations();
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (err) {
      setMessage(err.message || "Failed to connect to backend. Please try again.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Welcome back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {user.username || user.email}!
                </span>
              </h1>
              <p className="text-lg text-gray-600">
                You're now logged into the Colombo Bookfair Portal.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center px-6 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600">{reservationsCount}</div>
                <div className="text-sm text-green-700 font-medium">Reservations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => router.push("/map")}
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xl font-semibold">Reserve a Stall</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {user.role === "ADMIN" && (
            <button
              onClick={() => router.push("/admin-panel")}
              className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xl font-semibold">Admin Panel</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>

        {/* Quick Stats or Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Account Status</p>
                <p className="text-xl font-bold text-purple-900">Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Your Role</p>
                <p className="text-xl font-bold text-blue-900">{user.role}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Total Reservations</p>
                <p className="text-xl font-bold text-green-900">{reservationsCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Your Reserved Stalls & Genres Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Your Reserved Stalls & Genres
            </h2>
          </div>

          {userReservations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-600 text-lg mb-4">You haven't reserved any stalls yet</p>
              <button
                onClick={() => router.push("/map")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Reserve Your First Stall
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userReservations.map((reservation) => {
                // Get genres for this reservation (using user's genres for now)
                const hasGenres = genres && genres.trim();
                let genresList = [];
                if (hasGenres) {
                  try {
                    const parsed = JSON.parse(genres);
                    if (parsed.contactPerson || parsed.phone || parsed.address) {
                      genresList = [];
                    } else {
                      genresList = [genres];
                    }
                  } catch (e) {
                    genresList = genres.split(",").filter(g => g.trim());
                  }
                }

                // Get size color
                const sizeColors = {
                  SMALL: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  MEDIUM: "bg-orange-100 text-orange-800 border-orange-200",
                  LARGE: "bg-green-100 text-green-800 border-green-200"
                };
                const sizeColor = sizeColors[reservation.stallSize] || "bg-gray-100 text-gray-800 border-gray-200";

                return (
                  <div key={reservation.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900">{reservation.stallName}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${sizeColor}`}>
                        {reservation.stallSize}
                      </span>
                    </div>
                    
                    {genresList.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Genres:</p>
                        <div className="flex flex-wrap gap-2">
                          {genresList.map((genre, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                            >
                              {genre.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">No genres added yet</p>
                        <button
                          onClick={() => {
                            // Scroll to genres section or open modal
                            const genresInput = document.getElementById('genres-input');
                            if (genresInput) {
                              genresInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              genresInput.focus();
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          + Add Genres
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl border-2 ${
                messageType === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              } animate-fadeIn`}
            >
              <div className="flex items-center space-x-2">
                {messageType === "success" ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Add Genres Section - Collapsible */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Add Literary Genres
            </h2>
            <p className="text-gray-600">
              Specify the genres of books you'll be showcasing at the bookfair
            </p>
          </div>

          <form onSubmit={handleSaveGenres} className="space-y-6">
            <div>
              <label htmlFor="genres-input" className="block text-sm font-medium text-gray-700 mb-2">
                Genres (e.g., Fiction, History, Comics, Science Fiction)
              </label>
              <input
                id="genres-input"
                type="text"
                placeholder="Ex: Fiction, History, Comics, Science Fiction, Biography"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                disabled={isSaving}
              />
              <p className="mt-2 text-sm text-gray-500">
                Separate multiple genres with commas
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Genres</span>
                </>
              )}
            </button>
          </form>
        </div>


        {/* All Your Unique Genres Section */}
        {(() => {
          // Calculate unique genres from user's genres
          let uniqueGenres = [];
          if (genres && genres.trim()) {
            try {
              const parsed = JSON.parse(genres);
              if (!parsed.contactPerson && !parsed.phone && !parsed.address) {
                uniqueGenres = [genres];
              }
            } catch (e) {
              uniqueGenres = genres.split(",").map(g => g.trim()).filter(g => g);
            }
          }

          return uniqueGenres.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 8h10M5 3l6 6m-6-6l6 6m6-3v4m-2-4h-6m6 0l-6 6m6-6l-6-6" />
                  </svg>
                  All Your Unique Genres
                </h2>
                <p className="text-gray-600">
                  These are all the unique genres across all your reserved stalls ({uniqueGenres.length} {uniqueGenres.length === 1 ? 'genre' : 'genres'}).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueGenres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}
