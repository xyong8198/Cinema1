"use client";

import React, { useState, useEffect } from "react";
import { Movie, DetailedMovie } from "@/types/movie";
import { getMovieDetailsByTitle } from "@/lib/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import MoviePoster from "./MoviePoster";

interface AdminMovieFormProps {
  movie?: Movie;
  onSubmit: (movieData: Omit<Movie, "id">) => Promise<void>;
  onCancel: () => void;
}

const AdminMovieForm: React.FC<AdminMovieFormProps> = ({
  movie,
  onSubmit,
  onCancel,
}) => {
  // State variables remain unchanged
  const [title, setTitle] = useState(movie?.title || "");
  const [description, setDescription] = useState(movie?.description || "");
  const [director, setDirector] = useState(movie?.director || "");
  const [genre, setGenre] = useState(movie?.genre || "");
  const [duration, setDuration] = useState(movie?.duration || 120);
  const [language, setLanguage] = useState(movie?.language || "English");
  const [releaseDate, setReleaseDate] = useState<Date>(
    movie?.releaseDate ? new Date(movie.releaseDate) : new Date()
  );
  const [posterUrl, setPosterUrl] = useState(movie?.posterUrl || "");
  const [ageRating, setAgeRating] = useState(movie?.rating || "PG");
  const [trailerUrl, setTrailerUrl] = useState(movie?.trailerUrl || "");
  const [searchTitle, setSearchTitle] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DetailedMovie | null>(
    null
  );
  const [searchError, setSearchError] = useState("");
  const [price, setPrice] = useState(movie?.price || 0);

  // Handlers remain unchanged
  const handleSearch = async (e: React.FormEvent) => {
    // Existing search handler code
    e.preventDefault();
    if (!searchTitle.trim()) {
      toast.error("Please enter a movie title to search");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchResults(null);

    try {
      const results = await getMovieDetailsByTitle(searchTitle);
      setSearchResults(results);
      toast.success(`Found movie: ${results.Title || searchTitle}`);

      // Auto-fill form fields with the search results
      if (results) {
        setTitle(results.Title || title);
        setDescription(results.Plot || description);
        setDirector(results.Director || director);

        // Parse duration (format: "120 min" -> 120)
        if (results.Runtime) {
          const minutes = parseInt(results.Runtime.split(" ")[0]);
          if (!isNaN(minutes)) {
            setDuration(minutes);
          }
        }

        const priceInput = document.getElementById("price");
        if (priceInput) {
          priceInput.classList.add("highlight-field");
          setTimeout(
            () => priceInput.classList.remove("highlight-field"),
            2000
          );
        }

        setGenre(results.Genre || genre);
        setLanguage(results.Language?.split(", ")[0] || language);

        // Parse release date
        if (results.Released) {
          try {
            const date = new Date(results.Released);
            if (!isNaN(date.getTime())) {
              setReleaseDate(date);
            }
          } catch (err) {
            // Keep existing date if parsing fails
            console.error("Failed to parse release date", err);
          }
        }

        setPosterUrl(results.Poster !== "N/A" ? results.Poster : posterUrl);
        setAgeRating(results.Rated || ageRating);
      }
    } catch (error) {
      console.error("Error searching movie:", error);
      setSearchError("Movie not found or search failed. Please try again.");
      toast.error("Error searching for movie");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Existing submit handler code
    e.preventDefault();

    // Form validation
    if (!title) {
      toast.error("Title is required");
      return;
    }

    if (!description) {
      toast.error("Description is required");
      return;
    }

    if (!posterUrl) {
      toast.error("Poster URL is required");
      return;
    }

    // Add price validation
    if (price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const movieData = {
      title,
      description,
      director,
      genre,
      duration,
      language,
      releaseDate: releaseDate.toISOString(),
      posterUrl,
      ageRating,
      trailerUrl,
      releaseYear: releaseDate.getFullYear(),
      rating: ageRating,
      review: 0, // Add appropriate value or state for review
      price: price, // Use the price state
    };

    try {
      await onSubmit(movieData);
      toast.success(`Movie ${movie ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Failed to ${movie ? "update" : "create"} movie`);
    }
  };

  // Modified UI with height constraints and scrolling
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full mx-auto overflow-hidden max-h-[80vh]">
      {/* Header section - sticky at top */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {movie ? "Edit Movie" : "Add New Movie"}
        </h2>
      </div>

      {/* Scrollable content */}
      <div
        className="overflow-y-auto p-6"
        style={{ maxHeight: "calc(80vh - 140px)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side - Search and Basic Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Movie Search Section */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">
                Search for Movie Details
              </h3>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Title"
                  className="w-3/4 px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSearching ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>Search</>
                  )}
                </button>
              </form>

              {searchError && (
                <div className="mt-3 text-red-500 text-sm">{searchError}</div>
              )}

              {searchResults && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-500 mr-2 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Movie details found!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Poster preview - smaller height */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <label
                htmlFor="posterUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Poster URL *
              </label>
              <input
                type="url"
                id="posterUrl"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                required
              />
              <div className="flex justify-center">
                {posterUrl ? (
                  <div className="relative w-32 h-48 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-md">
                    <MoviePoster
                      src={posterUrl}
                      alt="Poster preview"
                      useNextImage={false}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-48 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                    No poster image
                  </div>
                )}
              </div>
            </div>

            {/* Trailer URL field */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <label
                htmlFor="trailerUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Trailer URL
              </label>
              <input
                type="url"
                id="trailerUrl"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Right side - Form fields */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Title field */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Director field */}
                <div>
                  <label
                    htmlFor="director"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Director
                  </label>
                  <input
                    type="text"
                    id="director"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Genre field */}
                <div>
                  <label
                    htmlFor="genre"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Genre
                  </label>
                  <input
                    type="text"
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Duration field */}
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Language field */}
                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Language
                  </label>
                  <input
                    type="text"
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Release Date field */}
                <div>
                  <label
                    htmlFor="releaseDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Release Date
                  </label>
                  <DatePicker
                    selected={releaseDate}
                    onChange={(date: Date | null) =>
                      date && setReleaseDate(date)
                    }
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Age Rating field */}
                <div>
                  <label
                    htmlFor="ageRating"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Age Rating
                  </label>
                  <select
                    id="ageRating"
                    value={ageRating}
                    onChange={(e) => setAgeRating(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="G">G (General Audiences)</option>
                    <option value="PG">PG (Parental Guidance)</option>
                    <option value="PG-13">
                      PG-13 (Parents Strongly Cautioned)
                    </option>
                    <option value="R">R (Restricted)</option>
                    <option value="NC-17">NC-17 (Adults Only)</option>
                  </select>
                </div>

                {/* Price field */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">
                        $
                      </span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) =>
                        setPrice(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      step="0.01"
                      min="0"
                      className="w-full pl-8 px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Description field - spans both columns */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3} // Reduced from 5 to 3
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer with buttons - sticky at bottom */}
      <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 px-8 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors hover: cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors hover: cursor-pointer"
        >
          {movie ? "Update Movie" : "Create Movie"}
        </button>
      </div>
    </div>
  );
};

export default AdminMovieForm;
