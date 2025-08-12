import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Movie } from "@/types/movie";
import { formatPrice } from "@/utils/price";
import { useAuth } from "@/contexts/AuthContext";
import { checkIsFavorite, toggleFavorite } from "@/lib/api";
import toast from "react-hot-toast";
import MoviePoster from "./MoviePoster";

// Define color scheme variants
const colorSchemes = {
  pink: {
    gradient: "from-pink-500 to-pink-700",
    overlayGradient: "from-pink-700/80 to-pink-900/80",
    shadowColor: "shadow-pink-500/10",
    darkShadowColor: "dark:shadow-pink-700/20",
    hoverShadowColor: "hover:shadow-pink-500/30",
    darkHoverShadowColor: "dark:hover:shadow-pink-700/40",
    badge: "bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  },
  purple: {
    gradient: "from-purple-500 to-purple-700",
    overlayGradient: "from-purple-700/80 to-purple-900/80",
    shadowColor: "shadow-purple-500/10",
    darkShadowColor: "dark:shadow-purple-700/20",
    hoverShadowColor: "hover:shadow-purple-500/30",
    darkHoverShadowColor: "dark:hover:shadow-purple-700/40",
    badge:
      "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  blue: {
    gradient: "from-blue-500 to-blue-700",
    overlayGradient: "from-blue-700/80 to-blue-900/80",
    shadowColor: "shadow-blue-500/10",
    darkShadowColor: "dark:shadow-blue-700/20",
    hoverShadowColor: "hover:shadow-blue-500/30",
    darkHoverShadowColor: "dark:hover:shadow-blue-700/40",
    badge: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  green: {
    gradient: "from-green-500 to-green-700",
    overlayGradient: "from-green-700/80 to-green-900/80",
    shadowColor: "shadow-green-500/10",
    darkShadowColor: "dark:shadow-green-700/20",
    hoverShadowColor: "hover:shadow-green-500/30",
    darkHoverShadowColor: "dark:hover:shadow-green-700/40",
    badge: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  yellow: {
    gradient: "from-yellow-500 to-yellow-700",
    overlayGradient: "from-yellow-700/80 to-yellow-900/80",
    shadowColor: "shadow-yellow-500/10",
    darkShadowColor: "dark:shadow-yellow-700/20",
    hoverShadowColor: "hover:shadow-yellow-500/30",
    darkHoverShadowColor: "dark:hover:shadow-yellow-700/40",
    badge:
      "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  orange: {
    gradient: "from-orange-500 to-orange-700",
    overlayGradient: "from-orange-700/80 to-orange-900/80",
    shadowColor: "shadow-orange-500/10",
    darkShadowColor: "dark:shadow-orange-700/20",
    hoverShadowColor: "hover:shadow-orange-500/30",
    darkHoverShadowColor: "dark:hover:shadow-orange-700/40",
    badge:
      "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
};

interface MovieCardProps {
  movie: Movie;
  colorScheme?: keyof typeof colorSchemes;
  onFavoriteToggle?: (movieId: number, isFavorited: boolean) => void;
}

export default function MovieCard({
  movie,
  colorScheme = "purple",
  onFavoriteToggle,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const colors = colorSchemes[colorScheme];
  const { user } = useAuth();

  // Format release date
  const releaseDate = new Date(movie.releaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Load favorite status on component mount
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (user) {
        try {
          // First check if the movie already has isFavorite property set
          if (movie.isFavourite !== undefined) {
            setIsFavorite(!!movie.isFavourite);
            return;
          }

          // Otherwise fetch from API
          setIsProcessing(true);
          const isFav = await checkIsFavorite(movie.id);
          setIsFavorite(isFav);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    loadFavoriteStatus();
  }, [movie.id, user, movie.isFavourite]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent navigation
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const newFavoriteState = !isFavorite;

      // Call API to toggle favorite status
      await toggleFavorite(movie.id, newFavoriteState);

      // Update local state
      setIsFavorite(newFavoriteState);

      // Notify parent component if callback provided
      if (onFavoriteToggle) {
        onFavoriteToggle(movie.id, newFavoriteState);
      }

      // Show success message
      toast.success(
        newFavoriteState ? "Added to favorites!" : "Removed from favorites"
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Link href={`/movies/${movie.id}`}>
      <div
        className={`h-full rounded-2xl overflow-hidden shadow-lg ${colors.shadowColor} ${colors.darkShadowColor} ${colors.hoverShadowColor} ${colors.darkHoverShadowColor} transition-all duration-300 transform hover:scale-[1.03] bg-white dark:bg-gray-800`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Poster Image */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <MoviePoster
            src={movie.posterUrl}
            alt={movie.title}
            useNextImage={false}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              colors.overlayGradient
            } opacity-0 transition-opacity duration-300 ${
              isHovered ? "opacity-40" : ""
            }`}
          ></div>

          {/* Top Info */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}
            >
              {movie.genre}
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-yellow-400 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {movie.review || "4.5"}
              </span>
            </div>
          </div>

          {/* Bottom Action - Show on hover */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 text-center transition-all duration-300 transform ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <span
              className={`inline-block px-4 py-2 bg-gradient-to-r ${colors.gradient} text-white rounded-full text-sm font-medium`}
            >
              View Details
            </span>
          </div>
        </div>

        {/* Card Content */}
        {/* Card Content */}
        <div className="p-4">
          {/* Title and Heart on the same line */}
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 pr-2 flex-1">
              {movie.title}
            </h3>

            {/* Favorite Heart Button - MOVED TO TOP RIGHT */}
            <button
              onClick={handleFavoriteClick}
              disabled={isProcessing}
              className={`hover: cursor-pointer group relative flex-shrink-0 p-1.5 rounded-full ${
                isFavorite
                  ? "bg-pink-100 dark:bg-pink-900/50"
                  : "hover:bg-pink-50 dark:hover:bg-pink-900/30"
              } transition-all duration-200 transform ${
                isProcessing ? "opacity-70 cursor-wait" : ""
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-5 w-5 transition-all duration-300 ${
                  isFavorite
                    ? "text-pink-500 dark:text-pink-400 scale-110"
                    : "text-gray-600 dark:text-gray-300 group-hover:text-pink-500 dark:group-hover:text-pink-400"
                } ${isProcessing ? "animate-pulse" : ""}`}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>

              {/* Tooltip on hover */}
              <span className="absolute -top-8 right-0 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </span>
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {movie.director || "Unknown Director"} • {releaseDate}
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
  );
}
