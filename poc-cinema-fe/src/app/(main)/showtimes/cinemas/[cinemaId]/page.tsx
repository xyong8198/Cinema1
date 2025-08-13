"use client";

import { getShowtimesByCinema, getAllMovies, getCinemaById } from "@/lib/api";
import Link from "next/link";
import { Movie, Showtime, Cinema } from "@/types/movie";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MoviePoster from "@/components/MoviePoster";

export default function ShowtimesByCinemaPage() {
  // Use React hooks for client-side data fetching
  const params = useParams();
  const cinemaId = parseInt(params.cinemaId as string);

  // State for storing fetched data
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  // Add state for selected date
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch cinema details and showtimes in parallel
        const [showtimesData, cinemaData, moviesData] = await Promise.all([
          getShowtimesByCinema(cinemaId),
          getCinemaById(cinemaId).catch(() => null),
          getAllMovies(),
        ]);

        setShowtimes(showtimesData);
        setCinema(cinemaData);
        setMovies(moviesData);

        // Set the first date as selected by default
        if (showtimesData.length > 0) {
          const dates = Array.from(
            new Set(
              showtimesData.map((s) =>
                format(parseISO(s.screeningTime), "yyyy-MM-dd")
              )
            )
          ).sort();

          setSelectedDate(dates[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cinemaId]);

  // Create cinema info object from fetched data or default values
  const cinemaInfo: Cinema = cinema || {
    id: cinemaId,
    name: showtimes.length > 0 ? showtimes[0].cinema.name : "Cinema",
    location: "Location unavailable",
    totalScreens: 0,
  };

  // Extract unique dates from showtimes
  const dates = Array.from(
    new Set(
      showtimes.map((s) => format(parseISO(s.screeningTime), "yyyy-MM-dd"))
    )
  ).sort();

  // Filter showtimes by selected date if one is selected
  const filteredShowtimes = selectedDate
    ? showtimes.filter(
        (showtime) =>
          format(parseISO(showtime.screeningTime), "yyyy-MM-dd") ===
          selectedDate
      )
    : showtimes;

  // Group showtimes by movie title
  const showtimesByMovie = filteredShowtimes.reduce((acc, showtime) => {
    const movieTitle = showtime.movie.title;
    if (!acc[movieTitle]) {
      acc[movieTitle] = [];
    }
    acc[movieTitle].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  // Find movie details by title
  const getMovieByTitle = (title: string): Movie | undefined => {
    return movies.find((m) => m.title.toLowerCase() === title.toLowerCase());
  };

  // Format time for display
  const formatTime = (dateString: string): string => {
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), "EEE, MMM d");
    } catch (e) {
      return dateString;
    }
  };

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading showtimes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-gray-900 transition-colors duration-300">
      {/* Back button */}
      <Link
        href="/showtimes"
        className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Cinemas
      </Link>

      {/* Cinema Header */}
      <div className="p-8 rounded-3xl mb-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-sm border border-purple-100 dark:border-purple-800/30">
        {/* Cinema header content - remains the same */}
        <div className="flex items-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md mr-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {cinemaInfo.name}
            </h1>
            <p className="text-blue-600 dark:text-blue-400">
              {cinemaInfo.location} • {cinemaInfo.totalScreens} Screens
            </p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Showing {Object.keys(showtimesByMovie).length} movies with{" "}
          {filteredShowtimes.length} showtimes
          {selectedDate ? ` on ${formatDate(selectedDate)}` : " today"}
        </p>

        {/* Date Selector */}
        <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
          {dates.map((date) => (
            <button
              key={`date-${date}`}
              onClick={() => handleDateSelect(date)}
              className={`flex-shrink-0 p-4 w-28 rounded-2xl shadow-sm border transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                selectedDate === date
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-transparent"
                  : "bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700 border-gray-100 dark:border-gray-700"
              }`}
            >
              <p
                className={`text-center font-medium ${
                  selectedDate === date
                    ? "text-blue-100"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {format(parseISO(date), "EEE")}
              </p>
              <p
                className={`text-center text-lg ${
                  selectedDate === date
                    ? "font-bold text-white"
                    : "font-semibold text-gray-900 dark:text-white"
                }`}
              >
                {format(parseISO(date), "MMM d")}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Movies at this cinema section */}
      {Object.keys(showtimesByMovie).length > 0 ? (
        Object.entries(showtimesByMovie).map(
          ([movieTitle, movieShowtimes], index) => {
            // Find movie details from our movie list
            const movie = getMovieByTitle(movieTitle);

            // Group showtimes by date
            const showtimesByDate = movieShowtimes.reduce((acc, showtime) => {
              const date = format(
                parseISO(showtime.screeningTime),
                "yyyy-MM-dd"
              );
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(showtime);
              return acc;
            }, {} as Record<string, Showtime[]>);

            return (
              <div
                key={`movie-${index}`}
                className="mb-12 p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
                  {/* Movie Poster */}
                  <div className="relative w-40 h-60 rounded-2xl overflow-hidden shadow-lg dark:shadow-black/30 shrink-0">
                    <MoviePoster
                      src={movie?.posterUrl}
                      alt={movieTitle}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-2xl"
                    />
                  </div>

                  {/* Movie Details */}
                  <div>
                    <h2 className="text-2xl font-bold mb-3 flex items-center flex-wrap gap-2 text-gray-900 dark:text-white">
                      {movieTitle}
                      {movie && (
                        <Link
                          href={`/movies/${movie.id}`}
                          className="inline-flex items-center text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ml-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Movie Details
                        </Link>
                      )}
                    </h2>

                    {movie && (
                      <>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                            {movie.genre}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                            {movie.rating}
                          </span>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-sm">
                            {movie.duration} min
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                          {movie.description}
                        </p>
                      </>
                    )}

                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {movieShowtimes.length} showtimes at {cinemaInfo.name}
                      {selectedDate ? ` on ${formatDate(selectedDate)}` : ""}
                    </p>

                    <Link
                      href={`/showtimes/movies/${movie?.id || ""}`}
                      className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      All Showtimes for This Movie
                    </Link>
                  </div>
                </div>

                {/* Show showtimes grouped by date */}
                {Object.entries(showtimesByDate).map(
                  ([date, dateShowtimes]) => (
                    <div key={`date-${date}`} className="mb-6">
                      <h3 className="font-semibold text-lg mb-4 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full inline-block">
                        {formatDate(date)}
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {dateShowtimes
                          .sort((a, b) =>
                            a.screeningTime.localeCompare(b.screeningTime)
                          )
                          .map((showtime, idx) => (
                            <Link
                              key={`showtime-${showtime.id}-${idx}`}
                              href={`/pre-booking/${showtime.id}`}
                              className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
                            >
                              <span className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                                {formatTime(showtime.screeningTime)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-300">
                                Screen {showtime.id % 10 || 1}
                              </span>
                              <span className="mt-2 text-xs px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
                                Available
                              </span>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            );
          }
        )
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
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
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-200">
            No Showtimes Available
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {selectedDate ? (
              <>
                There are no scheduled showtimes at this cinema on{" "}
                <span className="font-medium">{formatDate(selectedDate)}</span>.
              </>
            ) : (
              "There are currently no scheduled showtimes at this cinema."
            )}{" "}
            Please try another date or explore other cinemas.
          </p>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-medium transition-all duration-300 hover:shadow-md hover:scale-105 mr-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Show All Dates
            </button>
          )}
          <Link
            href="/showtimes"
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Browse Other Cinemas
          </Link>
        </div>
      )}
    </div>
  );
}
