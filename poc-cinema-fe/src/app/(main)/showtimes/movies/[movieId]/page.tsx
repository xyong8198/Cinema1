"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Showtime, Movie } from "@/types/movie";
import { getMovieById, getShowtimesByMovie } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import MoviePoster from "@/components/MoviePoster";

export default function ShowtimesByMoviePage({
  params,
}: {
  params: { movieId: string };
}) {
  const movieId = parseInt(params.movieId);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showtimesByDate, setShowtimesByDate] = useState<
    Record<string, Showtime[]>
  >({});
  const [sortedDates, setSortedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [uniqueCinemas, setUniqueCinemas] = useState<
    { name: string; id: string | number }[]
  >([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch movie and showtimes data
        const [movieData, showtimesData] = await Promise.all([
          getMovieById(movieId),
          getShowtimesByMovie(movieId),
        ]);

        setMovie(movieData);
        setShowtimes(showtimesData);

        // Process showtimes by date
        const groupedShowtimes = groupShowtimesByDate(showtimesData);
        setShowtimesByDate(groupedShowtimes);

        // Get sorted dates
        const dates = Object.keys(groupedShowtimes).sort();
        setSortedDates(dates);

        // Get unique cinemas
        const cinemas = Array.from(
          new Map(
            showtimesData.map((s) => [
              s.cinema.name,
              { name: s.cinema.name, id: s.cinema.id },
            ])
          ).values()
        );
        setUniqueCinemas(cinemas);

        // Set initial selected date from URL or first available date
        const dateFromURL = searchParams.get("date");
        if (dateFromURL && dates.includes(dateFromURL)) {
          setSelectedDate(dateFromURL);
        } else if (dates.length > 0) {
          setSelectedDate(dates[0]);
          // Update URL with the selected date
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.set("date", dates[0]);
          router.push(
            `/showtimes/movies/${movieId}?${newSearchParams.toString()}`
          );
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, router]);

  useEffect(() => {
    const dateFromURL = searchParams.get("date");
    if (dateFromURL && sortedDates.includes(dateFromURL)) {
      setSelectedDate(dateFromURL);
    }
  }, [searchParams, sortedDates]);

  // Group showtimes by date
  const groupShowtimesByDate = (showtimesData: Showtime[]) => {
    return showtimesData.reduce((acc, showtime) => {
      // Extract date portion from screeningTime
      const date = showtime.screeningTime.split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(showtime);
      return acc;
    }, {} as Record<string, Showtime[]>);
  };

  // Handle date selection
  const handleDateSelect = (date: string) => {
    // If it's the same date, don't do anything
    if (date === selectedDate) {
      return;
    }

    setSelectedDate(date);

    // Update URL with the selected date, but use shallow routing to prevent full page refresh
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("date", date);

    // Use router.replace with shallow option instead of router.push
    router.replace(
      `/showtimes/movies/${movieId}?${newSearchParams.toString()}`,
      { scroll: false }
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "EEEE, MMMM d");
    } catch (e) {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  if (loading || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex justify-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading showtimes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-gray-900 transition-colors duration-300">
      {/* Back button */}
      <Link
        href="/movies"
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
        Back to Movies
      </Link>

      {/* Movie Header */}
      <div className="p-8 rounded mb-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-sm border border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Movie Poster */}
          <div className="relative w-40 h-60 rounded overflow-hidden shadow-lg dark:shadow-black/30 shrink-0">
            <MoviePoster
              src={movie.posterUrl}
              alt={movie.title}
              fill
              style={{ objectFit: "cover" }}
              className="rounded"
            />
          </div>

          {/* Movie Details */}
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              {movie.title}
            </h1>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                {movie.genre}
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                {movie.rating}
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-sm">
                {movie.duration} min
              </span>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                {new Date(movie.releaseDate).getFullYear()}
              </span>
            </div>

            <p className="mb-6 text-gray-700 dark:text-gray-300 line-clamp-3 max-w-2xl">
              {movie.description}
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href={`/movies/${movie.id}`}
                className="inline-flex items-center px-5 py-2 rounded-full bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 text-sm font-medium transition-all hover:bg-purple-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Movie Details
              </Link>

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2 rounded-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium transition-all hover:bg-red-50 dark:hover:bg-gray-700 hover:border-red-300 dark:hover:border-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Available Showtimes
          </span>
        </h2>

        {/* Date Pills */}
        {sortedDates.length > 0 && (
          <div className="flex overflow-x-auto space-x-3 pb-4 mb-8 scrollbar-hide">
            {sortedDates.map((date, index) => (
              <div
                key={`date-${date}-${index}`}
                onClick={() => handleDateSelect(date)}
                className={`flex-shrink-0 p-4 w-28 rounded shadow-sm border transition-all duration-300 transform hover:scale-105 cursor-pointer rounded-xl ${
                  date === selectedDate
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-transparent"
                    : "bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700 border-gray-100 dark:border-gray-700"
                }`}
              >
                <p
                  className={`text-center font-medium ${
                    date === selectedDate
                      ? "text-blue-100"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {format(parseISO(date), "EEE")}
                </p>
                <p
                  className={`text-center text-lg ${
                    date === selectedDate
                      ? "font-bold text-white"
                      : "font-semibold text-gray-900 dark:text-white"
                  }`}
                >
                  {format(parseISO(date), "MMM d")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Showtimes for Selected Date */}
        {selectedDate && showtimesByDate[selectedDate] ? (
          <div key={`date-${selectedDate}`} className="mb-12">
            <h3 className="font-semibold text-xl mb-6 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full inline-block">
              {formatDate(selectedDate)}
            </h3>

            {/* Group by cinema */}
            {Array.from(
              new Set(showtimesByDate[selectedDate].map((s) => s.cinema.name))
            ).map((cinemaName, cinemaIndex) => {
              const cinemaShowtimes = showtimesByDate[selectedDate].filter(
                (s) => s.cinema.name === cinemaName
              );

              return (
                <div
                  key={`cinema-${cinemaName}-${cinemaIndex}`}
                  className="mb-8 p-6 rounded bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400"
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
                      {cinemaName}
                    </h4>

                    <Link
                      href={`/showtimes/cinemas/${cinemaShowtimes[0].id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      View Cinema
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {cinemaShowtimes
                      .sort((a, b) =>
                        a.screeningTime.localeCompare(b.screeningTime)
                      )
                      .map((showtime, idx) => (
                        <Link
                          key={`showtime-${showtime.id}-${idx}`}
                          href={`/pre-booking/${showtime.id}`}
                          className="flex flex-col items-center justify-center p-4 rounded border-2 border-transparent bg-gray-50 dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
                        >
                          <span className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                            {formatTime(showtime.screeningTime)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-300">
                            Hall {showtime.hall}
                          </span>
                          <span className="mt-2 text-xs px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
                            Available
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700">
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
              There are currently no scheduled showtimes for this movie on the
              selected date. Please try another date or explore other movies.
            </p>
            <Link
              href="/movies"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Browse Other Movies
            </Link>
          </div>
        )}
      </div>

      {/* Cinema List */}
      {uniqueCinemas.length > 0 && (
        <div className="mt-12 p-8 rounded bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 shadow-sm border border-purple-100 dark:border-purple-800/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-pink-500 dark:text-pink-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Available at these Cinemas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {uniqueCinemas.map((cinema, index) => (
              <Link
                key={`cinema-${cinema.name}-${index}`}
                href={`/showtimes/cinemas/${cinema.id}`}
                className="p-5 bg-white dark:bg-gray-800 rounded shadow-sm hover:shadow-md transition-all duration-300 border border-transparent dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 flex items-start group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 dark:from-blue-500/30 dark:to-purple-600/30 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                    {cinema.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {
                      showtimes.filter((s) => s.cinema.name === cinema.name)
                        .length
                    }{" "}
                    showtimes available
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
