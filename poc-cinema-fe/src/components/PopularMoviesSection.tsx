"use client";

import React, { useState, useEffect } from "react";
import { getPopularMoviesThisWeek } from "@/lib/api";
import { PopularMovie } from "@/types/movie";
import { formatPrice } from "@/utils/price";
import Link from "next/link";

export default function PopularMoviesSection() {
  const [popularMovies, setPopularMovies] = useState<PopularMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPopularMovies() {
      try {
        const data = await getPopularMoviesThisWeek();
        setPopularMovies(data);
      } catch (error) {
        console.error("Failed to fetch popular movies:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPopularMovies();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (popularMovies.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-transparent bg-clip-text">
            Popular This Week
          </h2>
        </div>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Top {popularMovies.length} most booked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popularMovies.map((movie, index) => (
          <Link key={movie.movieId} href={`/movies/${movie.movieId}`}>
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="absolute top-4 left-4 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                  'bg-gradient-to-r from-orange-400 to-orange-600'
                }`}>
                  {index + 1}
                </div>
              </div>

              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={movie.posterUrl || "/placeholder-poster.jpg"}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-4 right-4">
                  <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {movie.bookingCount} booking{movie.bookingCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {movie.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {movie.director} • {movie.genre}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {formatPrice(movie.price)}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                    {movie.rating}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
