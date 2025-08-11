"use client";

import { useState, useEffect } from "react";
import { Movie, Cinema, LazyShowtime } from "@/types/movie";
import {
  getAllMovies,
  getAllCinemas,
  getAllShowtimes,
  createShowtime,
  deleteShowtime,
  updateShowtime,
} from "@/lib/api";
import AdminShowtimeForm from "@/components/AdminShowtimeForm";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import Protected from "@/middleware/Protected";

export default function AdminShowtimesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<LazyShowtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<
    LazyShowtime | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    movieTitle: "",
    cinemaName: "",
    date: "",
    hall: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch all data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesData, cinemasData, showtimesData] = await Promise.all([
        getAllMovies(),
        getAllCinemas(),
        getAllShowtimes(),
      ]);
      setMovies(moviesData);
      setCinemas(cinemasData);
      setShowtimes(showtimesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredShowtimes = showtimes.filter((showtime) => {
    const matchesMovie =
      !filters.movieTitle || showtime.movieTitle === filters.movieTitle;
    const matchesCinema =
      !filters.cinemaName || showtime.cinemaName === filters.cinemaName;
    const matchesHall =
      !filters.hall || showtime.hall === parseInt(filters.hall);
    const matchesDate =
      !filters.date ||
      (startOfDay(parseISO(showtime.screeningTime)) <=
        endOfDay(parseISO(filters.date)) &&
        endOfDay(parseISO(showtime.screeningTime)) >=
          startOfDay(parseISO(filters.date)));

    return matchesMovie && matchesCinema && matchesHall && matchesDate;
  });

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredShowtimes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredShowtimes.length / itemsPerPage);

  // Pagination controls
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleCreateShowtime = async (
    showtimeData: Omit<LazyShowtime, "id">
  ) => {
    try {
      console.log(showtimeData);
      setError(null);
      const newShowtime = await createShowtime(showtimeData);
      setShowtimes((prev) => [...prev, newShowtime]);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create showtime"
      );
    }
  };

  const handleUpdateShowtime = async (showtimeData: LazyShowtime) => {
    try {
      setError(null);
      const updatedShowtime = await updateShowtime(
        showtimeData.id,
        showtimeData
      );
      setShowtimes((prev) =>
        prev.map((s) => (s.id === showtimeData.id ? updatedShowtime : s))
      );
      setShowForm(false);
      setSelectedShowtime(undefined);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update showtime"
      );
    }
  };

  const handleDeleteShowtime = async (showtimeId: number) => {
    if (!window.confirm("Are you sure you want to delete this showtime?"))
      return;

    try {
      setError(null);
      await deleteShowtime(showtimeId);
      setShowtimes((prev) => prev.filter((s) => s.id !== showtimeId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete showtime"
      );
    }
  };

  const renderFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
      {/* Movie Filter */}
      <div className="relative">
        <label
          htmlFor="movieFilter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
        >
          Movie
        </label>
        <div className="relative">
          <select
            id="movieFilter"
            value={filters.movieTitle}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, movieTitle: e.target.value }))
            }
            className="w-full appearance-none rounded-xl border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-10 text-sm 
              text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
          >
            <option value="">All Movies</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.title}>
                {movie.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Cinema Filter */}
      <div className="relative">
        <label
          htmlFor="cinemaFilter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
        >
          Cinema
        </label>
        <div className="relative">
          <select
            id="cinemaFilter"
            value={filters.cinemaName}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, cinemaName: e.target.value }))
            }
            className="w-full appearance-none rounded-xl border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-10 text-sm 
              text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
          >
            <option value="">All Cinemas</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.name}>
                {cinema.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="relative">
        <label
          htmlFor="dateFilter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
        >
          Date
        </label>
        <div className="relative">
          <input
            type="date"
            id="dateFilter"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full rounded-xl border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm 
              text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
          />
        </div>
      </div>

      {/* Hall Filter - Only shown when cinema is selected */}
      {filters.cinemaName && (
        <div className="relative">
          <label
            htmlFor="hallFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
          >
            Hall
          </label>
          <div className="relative">
            <input
              type="number"
              id="hallFilter"
              value={filters.hall}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, hall: e.target.value }))
              }
              min="1"
              placeholder="Enter hall number"
              className="w-full rounded-xl border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm 
                text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Add pagination component after the table
  const renderPagination = () => (
    <div className="mt-6 flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 border-t border-purple-100 dark:border-gray-700 transition-colors duration-300">
      <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
        Showing {indexOfFirstItem + 1} to{" "}
        {Math.min(indexOfLastItem, filteredShowtimes.length)} of{" "}
        {filteredShowtimes.length} entries
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-700 text-sm font-medium text-purple-600 dark:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors hover:cursor-pointer"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-3 py-1 rounded-lg text-sm font-medium hover:cursor-pointer ${
              currentPage === number
                ? "bg-purple-600 text-white"
                : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 hover:cursor-pointer rounded-lg border border-purple-200 dark:border-purple-700 text-sm font-medium text-purple-600 dark:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <Protected requireAdmin>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-8 transition-colors duration-300">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Showtime Management
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2 transition-colors duration-300">
            Schedule and manage movie showtimes across all cinemas
          </p>
        </div>

        {/* Admin Controls */}
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-700 p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {renderFilters()}

            {/* Add Showtime Button */}
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center hover:cursor-pointer"
            >
              <svg
                className="w-8 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Showtime
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl transition-colors duration-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400 dark:text-red-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300 transition-colors duration-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Showtime Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
            <AdminShowtimeForm
              showtime={selectedShowtime}
              movies={movies}
              cinemas={cinemas}
              onSubmit={async (showtimeData) => {
                if (selectedShowtime) {
                  // Update existing showtime
                  await handleUpdateShowtime({
                    ...showtimeData,
                    id: selectedShowtime.id,
                  });
                } else {
                  // Create new showtime
                  await handleCreateShowtime(showtimeData);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setSelectedShowtime(undefined);
              }}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Loading showtimes...
              </p>
            </div>
          ) : filteredShowtimes.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 transition-colors duration-300">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                        Movie
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                        Cinema
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                        Hall
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {currentItems.map((showtime) => (
                      <tr
                        key={showtime.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                            {showtime.movieTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          {showtime.cinemaName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors duration-300">
                            {format(parseISO(showtime.screeningTime), "PPp")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-colors duration-300">
                            Hall {showtime.hall}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setSelectedShowtime(showtime);
                                setShowForm(true);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150 hover:cursor-pointer"
                              title="Edit showtime"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteShowtime(showtime.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-150 hover:cursor-pointer"
                              title="Delete showtime"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {renderPagination()}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-700 transition-colors duration-300">
              <svg
                className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-300">
                No Showtimes Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">
                {searchTerm
                  ? `No showtimes matching "${searchTerm}"`
                  : "You haven't added any showtimes yet"}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 hover:cursor-pointer"
              >
                Schedule Your First Showtime
              </button>
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
