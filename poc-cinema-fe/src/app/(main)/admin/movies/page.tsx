"use client";

import { useState, useEffect } from "react";
import { getAllMovies, createMovie, deleteMovie, updateMovie } from "@/lib/api";
import { Movie } from "@/types/movie";
import AdminMovieForm from "@/components/AdminMovieForm";
import { formatPrice } from "@/utils/price";
import Protected from "@/middleware/Protected";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>(
    undefined
  );

  // Fetch movies on component mount
  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter movies when search term changes
  useEffect(() => {
    filterMovies();
  }, [searchTerm, movies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getAllMovies();
      setMovies(data);
      setFilteredMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const filterMovies = () => {
    if (!searchTerm.trim()) {
      setFilteredMovies(movies);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = movies.filter((movie) => {
      // Safely check each property with optional chaining and nullish coalescing
      const title = movie?.title?.toLowerCase() ?? "";
      const director = movie?.director?.toLowerCase() ?? "";
      const genre = movie?.genre?.toLowerCase() ?? "";
      const year = movie?.releaseYear?.toString() ?? "";

      return (
        title.includes(searchTermLower) ||
        director.includes(searchTermLower) ||
        genre.includes(searchTermLower) ||
        year.includes(searchTermLower)
      );
    });

    setFilteredMovies(filtered);
  };

  const handleCreateMovie = async (movieData: Omit<Movie, "id">) => {
    try {
      setError(null);
      const newMovie = await createMovie(movieData);
      setMovies((prev) => [...prev, newMovie]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create movie");
    }
  };

  const handleUpdateMovie = async (movieData: Omit<Movie, "id">) => {
    if (!selectedMovie) return;

    try {
      setError(null);
      const updatedMovie = await updateMovie(selectedMovie.id, movieData);
      setMovies((prev) =>
        prev.map((m) => (m.id === selectedMovie.id ? updatedMovie : m))
      );
      setShowForm(false);
      setSelectedMovie(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie");
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      setError(null);
      await deleteMovie(movieId);
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete movie");
    }
  };

  const openEditForm = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowForm(true);
  };

  const closeForm = () => {
    setSelectedMovie(undefined);
    setShowForm(false);
  };

  return (
    <Protected requireAdmin>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-8 transition-colors duration-300">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Movie Management
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2 transition-colors duration-300">
            Add, edit, or remove movies from your cinema catalog
          </p>
        </div>

        {/* Admin Controls */}
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-700 p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-400 dark:text-purple-300 absolute left-4 top-1/2 transform -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Add Movie Button */}
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center group hover: cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Movie
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
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
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Movie Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl transform transition-all">
              <AdminMovieForm
                movie={selectedMovie}
                onSubmit={async (movieData) => {
                  if (selectedMovie) {
                    await handleUpdateMovie(movieData);
                  } else {
                    await handleCreateMovie(movieData);
                  }
                }}
                onCancel={closeForm}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Loading movies...
              </p>
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Poster
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Director
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Release Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Genre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Language
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredMovies.map((movie) => (
                      <tr
                        key={movie.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        {/* Existing poster cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative w-12 h-16 rounded-lg overflow-hidden shadow-sm dark:shadow-black/50">
                            <img
                              src={movie.posterUrl || "/placeholder-poster.jpg"}
                              alt={movie.title}
                              style={{ objectFit: "cover" }}
                              className="transform hover:scale-110 transition-transform duration-200"
                            />
                          </div>
                        </td>

                        {/* Title cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {movie.title}
                          </div>
                        </td>

                        {/* Director cell */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {movie.director}
                        </td>

                        {/* Release Date cell */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {new Date(movie.releaseDate).toLocaleDateString()}
                        </td>

                        {/* Genre cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                            {movie.genre}
                          </span>
                        </td>

                        {/* Language cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                            {movie.language}
                          </span>
                        </td>

                        {/* Price cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">
                            {formatPrice(movie.price)}
                          </span>
                        </td>

                        {/* Rating cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            {movie.rating}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => openEditForm(movie)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150 hover: cursor-pointer"
                              title="Edit movie"
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
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-150 hover: cursor-pointer"
                              title="Delete movie"
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
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-700 transition-colors duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                No movies found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {searchTerm
                  ? `No movies matching "${searchTerm}"`
                  : "You haven't added any movies yet"}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              >
                Add Your First Movie
              </button>
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
