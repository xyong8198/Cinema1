"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMovieById, getMovieDetailsById } from "@/lib/api";
import { DetailedMovie, Movie } from "@/types/movie";
import { formatPrice } from "@/utils/price";
import MoviePoster from "@/components/MoviePoster";

export default function MovieDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState({
    showtime: false,
    cta: false,
  });
  const [movieDetails, setMovieDetails] = useState<DetailedMovie>();

  useEffect(() => {
    async function loadMovie() {
      try {
        const movieId = parseInt(params.id);
        const data = await getMovieById(movieId);
        setMovie(data as Movie);
        const reviews = await getMovieDetailsById(movieId);
        setMovieDetails(reviews);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load movie details"
        );
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [params.id]);

  function getRatingSourceLogo(source: string) {
    switch (source) {
      case "Internet Movie Database":
        return "https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg";
      case "Rotten Tomatoes":
        return "https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg";
      case "Metacritic":
        return "https://upload.wikimedia.org/wikipedia/commons/2/20/Metacritic.svg";
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
            Loading movie details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-red-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
            {error || "Unable to load movie"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please try again later or check another movie
          </p>
          <Link
            href="/movies"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Back button with subtle animation */}
      <Link
        href="/movies"
        className="inline-flex items-center mb-8 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300"
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Movies
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Movie Poster with subtle hover effect */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <div className="relative w-full h-[450px] lg:h-auto aspect-[2/3] rounded-3xl overflow-hidden shadow-xl dark:shadow-pink-900/20 transform transition-all duration-500 hover:shadow-2xl dark:hover:shadow-pink-900/30">
              <MoviePoster
                src={movie.posterUrl || movieDetails?.Poster}
                alt={movie.title || movieDetails?.Title}
                fill
                className="object-cover"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>

              {/* Rating badge */}
              <div className="absolute top-4 right-4 bg-yellow-400 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 font-bold px-3 py-1 rounded-full text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {movie.review || 4.5}
              </div>

              {/* Bottom genre badge */}
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
                  {movie.genre || movieDetails?.Genre?.split(",")[0]}
                </span>
              </div>
            </div>

            {/* Modern, elevated button with animation */}
            <Link
              href={`/showtimes/movies/${movie.id}`}
              className={`
                flex items-center justify-center gap-2 
                w-full mt-6 py-4 rounded-full 
                text-white font-semibold text-lg tracking-wide
                bg-gradient-to-r from-pink-500 to-purple-600 
                shadow-lg shadow-purple-500/30 dark:shadow-purple-900/40
                transition-all duration-300 transform
                ${
                  hovered.showtime
                    ? "translate-y-[-5px] shadow-xl shadow-purple-500/40 dark:shadow-purple-900/50"
                    : ""
                }
              `}
              onMouseEnter={() => setHovered({ ...hovered, showtime: true })}
              onMouseLeave={() => setHovered({ ...hovered, showtime: false })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              View Showtimes
            </Link>
          </div>
        </div>

        {/* Movie Details with enhanced styling */}
        <div className="w-full lg:w-2/3">
          {/* Movie metadata tags */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1.5 bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 rounded-full text-sm font-medium">
              {movie.genre || movieDetails?.Genre?.split(",")[0]}
            </span>
            <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
              {movie.rating || movieDetails?.Rated}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {movie.language || movieDetails?.Language}
            </span>
            <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              {formatPrice(movie.price)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900 dark:text-white">
            {movie.title || movieDetails?.Title}
          </h1>

          {/* Movie details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300 mb-8">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{movie.duration || movieDetails?.Runtime} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                Release Date:{" "}
                {new Date(
                  movie.releaseDate || movieDetails?.Released
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span>Director: {movie.director || movieDetails?.Director}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span>
                Language:{" "}
                {movie.language || movieDetails?.Language || "Not Available"}
              </span>
            </div>
          </div>

          {/* Description card with modernized design */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-8 rounded-3xl mb-10 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {movie.description || movieDetails?.Plot}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-8 rounded-3xl mb-10 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Ratings & Details
            </h2>

            {/* Ratings with platform logos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {movieDetails?.Ratings?.map((rating: any, index: number) => {
                const logoSrc = getRatingSourceLogo(rating.Source);
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center gap-4"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={rating.Source}
                          width={30}
                          height={35}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-2xl font-bold">
                          {rating.Source.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rating.Source}
                      </p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {rating.Value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Movie Details with icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9 7.5A.75.75 0 0 0 9 9h1.5c.69 0 1.25.56 1.25 1.25v.25h1.5v-.25c0-.69.56-1.25 1.25-1.25H16a.75.75 0 0 0 0-1.5h-1.5c-.69 0-1.25-.56-1.25-1.25V6h-1.5v.25C11.75 6.94 11.19 7.5 10.5 7.5H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Box Office
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {movieDetails?.BoxOffice || "Not Available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Country
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {movieDetails?.Country || "Not Available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-3.873 8.703a4.126 4.126 0 017.746 0 .75.75 0 01-.351.92 7.47 7.47 0 01-3.522.877 7.47 7.47 0 01-3.522-.877.75.75 0 01-.351-.92zM15 8.25a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H15zM14.25 12a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H15z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Actors
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {movieDetails?.Actors || "Not Available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                    <path
                      fillRule="evenodd"
                      d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Awards
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {movieDetails?.Awards || "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {movie.trailerUrl && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Trailer
              </h2>
              <div
                className="relative w-full rounded-3xl overflow-hidden shadow-lg dark:shadow-pink-900/20"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  src={movie.trailerUrl.replace("watch?v=", "embed/")}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                  title={`${movie.title} trailer`}
                />
              </div>
            </div>
          )}

          {/* Call-to-action with modern design */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-8 rounded-3xl shadow-sm border border-pink-100 dark:border-pink-800/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  Ready to watch?
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Book your tickets now starting from {formatPrice(movie.price)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {movie.review.toFixed(1) || "4.5"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  User Rating
                </div>
              </div>
            </div>
            <Link
              href={`/showtimes/movies/${movie.id}`}
              className={`
                inline-flex items-center justify-center gap-2 
                px-8 py-3 rounded-full 
                text-white font-semibold 
                bg-gradient-to-r from-pink-500 to-purple-600 
                shadow-lg shadow-purple-500/30 dark:shadow-purple-900/40
                transition-all duration-300 transform
                ${
                  hovered.cta
                    ? "translate-y-[-5px] shadow-xl shadow-purple-500/40 dark:shadow-purple-900/50"
                    : ""
                }
              `}
              onMouseEnter={() => setHovered({ ...hovered, cta: true })}
              onMouseLeave={() => setHovered({ ...hovered, cta: false })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              Book Tickets Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
