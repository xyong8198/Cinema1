import React, { useState } from "react";
import { Movie, Cinema, Showtime, LazyShowtime } from "@/types/movie";

interface AdminShowtimeFormProps {
  showtime?: LazyShowtime;
  movies: Movie[];
  cinemas: Cinema[];
  onSubmit: (
    showtimeData: Omit<LazyShowtime, "id"> | LazyShowtime
  ) => Promise<void>;
  onCancel: () => void;
}

const AdminShowtimeForm: React.FC<AdminShowtimeFormProps> = ({
  showtime,
  movies,
  cinemas,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    id: showtime?.id || 0,
    movieTitle: showtime?.movieTitle || "",
    cinemaName: showtime?.cinemaName || "",
    screeningTime:
      showtime?.screeningTime || new Date().toISOString().slice(0, 16),
    hall: showtime?.hall || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.movieTitle) newErrors.movieTitle = "Movie is required";
    if (!formData.cinemaName) newErrors.cinemaName = "Cinema is required";
    if (!formData.screeningTime)
      newErrors.screeningTime = "Screening time is required";
    if (formData.hall < 1) newErrors.hall = "Invalid hall number";

    // Validate screening time is in the future
    const screeningDate = new Date(formData.screeningTime);
    if (screeningDate < new Date()) {
      newErrors.screeningTime = "Screening time must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-2xl w-full mx-auto transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {showtime ? "Edit Showtime" : "Add New Showtime"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Movie Selection */}
        <div>
          <label
            htmlFor="movieTitle"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
          >
            Movie
          </label>
          <select
            id="movieTitle"
            name="movieTitle"
            value={formData.movieTitle}
            onChange={(e) =>
              setFormData({ ...formData, movieTitle: e.target.value })
            }
            className={`w-full px-4 py-2 rounded-xl border ${
              errors.movieTitle
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200`}
          >
            <option value="">Select a movie</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.title}>
                {movie.title}
              </option>
            ))}
          </select>
          {errors.movieTitle && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.movieTitle}
            </p>
          )}
        </div>

        {/* Cinema Selection */}
        <div>
          <label
            htmlFor="cinemaName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
          >
            Cinema
          </label>
          <select
            id="cinemaName"
            name="cinemaName"
            value={formData.cinemaName}
            onChange={(e) =>
              setFormData({ ...formData, cinemaName: e.target.value })
            }
            className={`w-full px-4 py-2 rounded-xl border ${
              errors.cinemaName
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200`}
          >
            <option value="">Select a cinema</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.name}>
                {cinema.name}
              </option>
            ))}
          </select>
          {errors.cinemaName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.cinemaName}
            </p>
          )}
        </div>

        {/* Screening Time */}
        <div>
          <label
            htmlFor="screeningTime"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
          >
            Screening Time
          </label>
          <input
            type="datetime-local"
            id="screeningTime"
            name="screeningTime"
            value={formData.screeningTime}
            onChange={(e) =>
              setFormData({ ...formData, screeningTime: e.target.value })
            }
            className={`w-full px-4 py-2 rounded-xl border ${
              errors.screeningTime
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200`}
            min={new Date().toISOString().slice(0, 16)}
          />
          {errors.screeningTime && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.screeningTime}
            </p>
          )}
        </div>

        {/* Hall Number */}
        <div>
          <label
            htmlFor="hall"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
          >
            Hall Number
          </label>
          <input
            type="number"
            id="hall"
            name="hall"
            value={formData.hall}
            onChange={(e) => {
              // Get the input value
              const value = e.target.value;

              // Only parse if there's a value, otherwise use the default
              const hallNumber = value === "" ? 1 : parseInt(value, 10);

              // Update form data with the parsed number
              setFormData({ ...formData, hall: hallNumber });
            }}
            className={`w-full px-4 py-2 rounded-xl border ${
              errors.hall
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200`}
            min="1"
          />
          {errors.hall && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.hall}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 hover:cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Saving...
              </span>
            ) : showtime ? (
              "Update Showtime"
            ) : (
              "Add Showtime"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminShowtimeForm;
