"use client";

import { useState, useEffect } from "react";
import { getAllMovies } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types/movie";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [inputState, setInputState] = useState({
    searchFocused: false,
    selectFocused: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  // Define pastel color schemes to cycle through
  const colorSchemes = [
    "pink",
    "purple",
    "blue",
    "green",
    "yellow",
    "orange",
  ] as const;

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);

    // Set initial window width
    setWindowWidth(window.innerWidth);

    async function loadMovies() {
      try {
        const data = await getAllMovies();
        setMovies(data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();

    // Handle responsive layout
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get grid columns based on window width
  const getGridCols = () => {
    if (!mounted) return "grid-cols-1";
    if (windowWidth >= 1024) return "grid-cols-4";
    if (windowWidth >= 768) return "grid-cols-3";
    if (windowWidth >= 640) return "grid-cols-2";
    return "grid-cols-1";
  };

  // Determine flex direction based on screen size
  const getFlexDirection = () => {
    if (!mounted) return "flex-col";
    return windowWidth >= 768 ? "flex-row" : "flex-col";
  };

  // Determine padding based on screen size
  const getPadding = () => {
    if (!mounted) return "p-4";
    return windowWidth >= 768 ? "p-8" : "p-4";
  };

  // Determine select width based on screen size
  const getSelectWidth = () => {
    if (!mounted) return "w-full";
    return windowWidth >= 768 ? "w-auto" : "w-full";
  };

  // Filter movies based on search and genre
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      searchTerm === "" ||
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.director &&
        movie.director.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGenre =
      selectedGenre === "" ||
      movie.genre?.toLowerCase() === selectedGenre.toLowerCase() ||
      movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-7xl mx-auto ${getPadding()} dark:bg-gray-900 transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        <span className="bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text">
          Discover Movies
        </span>
      </h1>

      {/* Modern Filter/Search section */}
      <div className="mb-8 overflow-hidden backdrop-blur-sm backdrop-filter rounded-2xl transition-all duration-300">
        <div className="relative p-6 bg-white/90 dark:bg-gray-800/90 border border-pink-100 dark:border-purple-900/30 shadow-lg rounded-2xl">
          {/* Gradient glow effects */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-pink-300 dark:bg-pink-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-24 h-24 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

          <div className="relative">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-pink-500 dark:text-pink-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Find Your Perfect Movie
            </h2>

            <div className={`flex ${getFlexDirection()} gap-4`}>
              {/* Enhanced search input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className={`h-5 w-5 transition-colors duration-200 ${
                      inputState.searchFocused
                        ? "text-pink-500 dark:text-pink-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title or director..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 w-full rounded-xl border-2 ${
                    inputState.searchFocused
                      ? "border-pink-500 ring-2 ring-pink-200 dark:ring-pink-900/30"
                      : "border-gray-200 dark:border-gray-700"
                  } py-3 px-4 outline-none transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  onFocus={() =>
                    setInputState({ ...inputState, searchFocused: true })
                  }
                  onBlur={() =>
                    setInputState({ ...inputState, searchFocused: false })
                  }
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="sr-only">Clear search</span>
                  </button>
                )}
              </div>

              {/* Enhanced genre selector */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className={`h-5 w-5 transition-colors duration-200 ${
                      inputState.selectFocused
                        ? "text-purple-500 dark:text-purple-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className={`pl-10 appearance-none rounded-xl border-2 ${
                    inputState.selectFocused
                      ? "border-purple-500 ring-2 ring-purple-200 dark:ring-purple-900/30"
                      : "border-gray-200 dark:border-gray-700"
                  } py-3 px-4 pr-10 outline-none transition-all duration-200 ${getSelectWidth()} bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                  onFocus={() =>
                    setInputState({ ...inputState, selectFocused: true })
                  }
                  onBlur={() =>
                    setInputState({ ...inputState, selectFocused: false })
                  }
                >
                  <option value="">All Genres</option>
                  {[
                    "Action",
                    "Comedy",
                    "Drama",
                    "Horror",
                    "Sci-Fi",
                    "Biography",
                    "Animation",
                    "Adventure",
                    "Romance",
                    "Thriller",
                    "Documentary",
                  ].map((genre) => (
                    <option key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-500 dark:text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
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

            {/* Filter chips/tags section */}
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200">
                  <span className="mr-1">Search:</span> {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 flex-shrink-0 text-pink-500 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 focus:outline-none"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {selectedGenre && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                  <span className="mr-1">Genre:</span>{" "}
                  {selectedGenre.charAt(0).toUpperCase() +
                    selectedGenre.slice(1)}
                  <button
                    onClick={() => setSelectedGenre("")}
                    className="ml-1 flex-shrink-0 text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 focus:outline-none"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {(searchTerm || selectedGenre) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedGenre("");
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Results count */}
            {filteredMovies.length > 0 && (searchTerm || selectedGenre) && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Found{" "}
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  {filteredMovies.length}
                </span>{" "}
                {filteredMovies.length === 1 ? "movie" : "movies"} matching your
                criteria
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movies grid */}
      {filteredMovies.length > 0 ? (
        <div className={`grid ${getGridCols()} gap-6`}>
          {filteredMovies.map((movie, index) => (
            <div key={movie.id} className="h-full">
              <MovieCard
                movie={movie}
                colorScheme={colorSchemes[index % colorSchemes.length]}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm transition-colors duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No movies found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedGenre
              ? "No movies match your current filters. Try adjusting your search criteria."
              : "There are no movies available at this time."}
          </p>
        </div>
      )}
    </div>
  );
}