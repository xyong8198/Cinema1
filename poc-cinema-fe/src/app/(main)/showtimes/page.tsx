"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Movie, Cinema, Showtime, LazyShowtime } from "@/types/movie";
import { getAllCinemas, getAllMovies, getAllShowtimes } from "@/lib/api";
import MoviePoster from "@/components/MoviePoster";

interface DateOption {
  day: string;
  date: string;
  value: string;
  displayDate: string;
}

export default function ShowtimesPage() {
  // State for storing data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<LazyShowtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for date selection
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);

  // Filtered data based on selected date
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);

  const [isDateLoading, setIsDateLoading] = useState(true);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [moviesRes, cinemasRes, showtimesRes] = await Promise.all([
          getAllMovies(),
          getAllCinemas(),
          getAllShowtimes(),
        ]);

        // Set state for all data
        setMovies(moviesRes);
        setCinemas(cinemasRes);
        setShowtimes(showtimesRes);

        // Generate date options from the fetched showtimes
        const dateOpts = generateDateOptions(showtimesRes);

        // Make sure to set the date options in state
        setDateOptions(dateOpts);

        // If we have dates, select the first one and filter using the actual data
        if (dateOpts.length > 0) {
          setSelectedDate(dateOpts[0].value);
          filterByDate(dateOpts[0].value, showtimesRes, moviesRes, cinemasRes);
        }

        setIsDateLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate date options from showtimes
  const generateDateOptions = (showtimesData: LazyShowtime[]): DateOption[] => {
    const uniqueDates = Array.from(
      new Set(
        showtimesData.map((showtime) => {
          const date = new Date(showtime.screeningTime);
          return date.toISOString().split("T")[0];
        })
      )
    ).sort();

    const options = uniqueDates.map((dateString) => {
      const date = new Date(dateString);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: `${date.toLocaleDateString("en-US", {
          month: "short",
        })} ${date.getDate()}`,
        value: dateString,
        displayDate: date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      };
    });

    setDateOptions(options);
    return options;
  };

  // Filter data by selected date
  const filterByDate = (
    date: string,
    showtimesData = showtimes,
    moviesData = movies,
    cinemasData = cinemas
  ) => {
    // Filter showtimes for selected date
    const showtimesForDate = showtimesData.filter((showtime) => {
      // Convert both dates to local timezone for comparison
      const showtimeDate = new Date(showtime.screeningTime);
      const targetDate = new Date(date);

      return (
        showtimeDate.getFullYear() === targetDate.getFullYear() &&
        showtimeDate.getMonth() === targetDate.getMonth() &&
        showtimeDate.getDate() === targetDate.getDate()
      );
    });

    // Debug logging
    console.log("Selected date:", date);
    console.log("Found showtimes:", showtimesForDate.length);
    console.log("Sample showtime:", showtimesForDate[0]?.screeningTime);

    // Get unique movie titles and cinema names from filtered showtimes
    const movieTitles = new Set(showtimesForDate.map((st) => st.movieTitle));
    const cinemaNames = new Set(showtimesForDate.map((st) => st.cinemaName));

    // Filter movies and cinemas
    const filteredMoviesResult = moviesData.filter((movie) =>
      movieTitles.has(movie.title)
    );
    const filteredCinemasResult = cinemasData.filter((cinema) =>
      cinemaNames.has(cinema.name)
    );

    setFilteredMovies(filteredMoviesResult);
    setFilteredCinemas(filteredCinemasResult);
  };

  // Handle date selection
  const handleDateSelect = async (date: string) => {
    try {
      setIsDateLoading(true);
      setSelectedDate(date);

      // Wait for a microtask to ensure state is updated
      await Promise.resolve();

      filterByDate(date, showtimes, movies, cinemas);
    } finally {
      setIsDateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-4xl font-bold mb-10 text-center">
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Movie Showtimes
        </span>
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading showtimes...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Date selection - Interactive Cards */}
          <div className="flex overflow-x-auto space-x-3 pb-4 mb-10 scrollbar-hide pt-5 pl-5">
            {isDateLoading ? (
              // Loading skeleton for date options
              <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex-shrink-0 p-4 w-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              dateOptions.map((date) => (
                <div
                  key={date.value}
                  onClick={() => handleDateSelect(date.value)}
                  className={`flex-shrink-0 p-4 w-24 rounded-2xl shadow-sm border transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                    selectedDate === date.value
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-transparent"
                      : "bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700 border-gray-100 dark:border-gray-700"
                  }`}
                >
                  <p
                    className={`text-center font-medium ${
                      selectedDate === date.value
                        ? "text-blue-100"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {date.day}
                  </p>
                  <p
                    className={`text-center text-lg ${
                      selectedDate === date.value
                        ? "font-bold"
                        : "font-semibold text-gray-900 dark:text-white"
                    }`}
                  >
                    {date.date}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Selected date display */}
          <div className="text-center mb-8">
            <p className="text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {filteredMovies.length} movies
              </span>{" "}
              at{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {filteredCinemas.length} cinemas
              </span>{" "}
              on{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {dateOptions.find((d) => d.value === selectedDate)
                  ?.displayDate || selectedDate}
              </span>
            </p>
          </div>

          {/* Browse by movie - Filtered Movies */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-purple-500"
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
              Movies Playing Today
            </h2>

            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {filteredMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/showtimes/movies/${movie.id}?date=${selectedDate}`}
                    className="block group"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-[2/3] mb-3 shadow-lg dark:shadow-gray-900/50 group-hover:shadow-xl dark:group-hover:shadow-gray-900/70 transition-all duration-500">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                      <MoviePoster
                        src={movie.posterUrl}
                        alt={movie.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* View showtimes button */}
                      <div className="absolute bottom-3 left-0 right-0 text-center z-10 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-purple-700 rounded-full text-xs font-medium">
                          View Showtimes
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-center truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-gray-900 dark:text-white">
                      {movie.title}
                    </h3>
                  </Link>
                ))}
                <Link
                  href="/movies"
                  className="flex flex-col items-center justify-center rounded-2xl aspect-[2/3] transition-all duration-500 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-900/40 dark:hover:to-blue-900/40 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="mt-4 font-medium text-sm text-purple-700 dark:text-purple-400">
                    View All Movies
                  </span>
                </Link>
              </div>
            ) : (
              <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  No Movies Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  There are no movies showing on this date. Please try another
                  date.
                </p>
              </div>
            )}
          </div>

          {/* Browse by cinema - Filtered Cinemas */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Cinemas Playing Today
              </span>
            </h2>

            {filteredCinemas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {filteredCinemas.map((cinema) => (
                  <Link
                    key={cinema.id}
                    href={`/showtimes/cinemas/${cinema.id}?date=${selectedDate}`}
                    className="group relative overflow-hidden rounded-3xl shadow-lg dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 transition-all duration-500 transform hover:scale-[1.02] border border-transparent dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800"
                  >
                    {/* Enhanced background with pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-500/20 dark:from-blue-400/5 dark:to-purple-500/10 opacity-100 group-hover:opacity-90 transition-opacity duration-500">
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_#ccc_1px,_transparent_1px)] [background-size:12px_12px]"></div>
                    </div>

                    {/* Cinema card content with improved spacing */}
                    <div className="relative p-7 backdrop-blur-sm h-full flex flex-col">
                      {/* Icon at the top */}
                      <div className="mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 dark:from-blue-500/30 dark:to-purple-600/30 flex items-center justify-center">
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
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-700 dark:text-white dark:group-hover:text-purple-400 transition-colors duration-300">
                        {cinema.name}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 mb-5 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                        {cinema.location}
                      </p>

                      <div className="mt-auto flex flex-col gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium w-fit">
                          {cinema.totalScreens} Screens
                        </span>

                        {/* Showtimes badge with count */}
                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full font-medium w-fit mb-2">
                          {
                            showtimes.filter(
                              (s) =>
                                s.cinemaName === cinema.name &&
                                new Date(s.screeningTime)
                                  .toISOString()
                                  .split("T")[0] === selectedDate
                            ).length
                          }{" "}
                          Showtimes Today
                        </span>

                        {/* Improved button with arrow animation - now below screen count */}
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center justify-center bg-white/70 dark:bg-black/20 backdrop-blur-sm px-3.5 py-2 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 w-full">
                          View Showtimes
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>

                      {/* Decorative element in the corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 -mt-6 -mr-6 bg-gradient-to-br from-blue-400/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-500/5 rounded-full blur-2xl"></div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  No Cinemas Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  There are no cinemas showing movies on this date. Please try
                  another date.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
