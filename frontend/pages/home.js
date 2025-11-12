import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import userApi from "../lib/api/user";
import reservationsApi from "../lib/api/reservations";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userReservations, setUserReservations] = useState(0);
  const [reservations, setReservations] = useState([]);

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

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getProfile();
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

  // Fetch user reservations count and details
  const fetchUserReservations = async () => {
    try {
      const data = await reservationsApi.getMyReservations();
      setUserReservations(data.length || 0);
      setReservations(data || []);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setUserReservations(0);
      setReservations([]);
    }
  };

  // Calculate unique genres from all reservations
  const getUniqueGenres = () => {
    const allGenres = new Set();
    reservations.forEach(reservation => {
      if (reservation.stallGenres) {
        const genres = reservation.stallGenres.split(',').map(g => g.trim()).filter(g => g);
        genres.forEach(genre => allGenres.add(genre));
      }
    });
    return Array.from(allGenres);
  };

  const uniqueGenres = getUniqueGenres();

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
                You're now logged into the Colombo Bookfair Portal
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center px-6 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600">{userReservations}</div>
                <div className="text-sm text-green-700 font-medium">Reservations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => router.push("/map")}
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 md:col-span-1"
            style={user.role !== "ADMIN" ? { gridColumn: "1 / -1" } : {}}
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Account Status</p>
                <p className="text-xl font-bold text-purple-900">Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <p className="text-xl font-bold text-green-900">{userReservations}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stall-wise Genres Section */}
        {reservations.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Your Reserved Stalls & Genres
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.map((reservation) => {
                  const stallGenres = reservation.stallGenres ? reservation.stallGenres.split(',').map(g => g.trim()).filter(g => g) : [];
                  return (
                    <div key={reservation.id} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-indigo-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Stall {reservation.stallName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            reservation.stallSize === 'SMALL' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.stallSize === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {reservation.stallSize}
                          </span>
                          {stallGenres.length > 0 && (
                            <button
                              onClick={() => router.push({ pathname: '/add-genres', query: { stallIds: reservation.stallId.toString() } })}
                              className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="Edit Genres"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {stallGenres.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Genres:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {stallGenres.map((genre, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium shadow-sm"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-2">No genres added yet</p>
                          <button
                            onClick={() => router.push({ pathname: '/add-genres', query: { stallIds: reservation.stallId.toString() } })}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center justify-center space-x-1 mx-auto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Genres</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* All Unique Genres Section */}
        {uniqueGenres.length > 0 && (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                All Your Unique Genres
              </h2>
              <p className="text-gray-600 mb-4">
                These are all the unique genres across all your reserved stalls ({uniqueGenres.length} genres)
              </p>
              <div className="flex flex-wrap gap-3">
                {uniqueGenres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
