"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BookingList from "@/components/bookings/BookingList";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import {
  fetchBookingHistory,
  getFavorites,
  getUser,
  toggleFavorite,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { BookingProps } from "@/components/bookings/BookingCard";
import { motion } from "framer-motion";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types/movie";

// Tab interface for better type safety
interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<BookingProps[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [user, setUser] = useState({} as User);

  const auth = useAuth();

  // Define tabs with icons
  const tabs: TabItem[] = [
    {
      id: "bookings",
      label: "My Bookings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser === null) {
          router.push("/login");
        } else {
          const parsedUser = JSON.parse(storedUser) as User;
          const token = Cookies.get("auth_token");
          if (token) {
            const updatedUser = await getUser(token);
            auth.updateUser(updatedUser);
          }
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();

    // Fetch bookings
    const fetchBookings = async () => {
      try {
        const bookingHistory = await fetchBookingHistory();
        setBookings(bookingHistory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const returnDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Edit Profile Clicked");
    router.push("/profile/edit");
  };

  useEffect(() => {
    // Load favorites when tab changes to "favorites"
    if (activeTab === "favorites") {
      loadFavorites();
    }
  }, [activeTab]);

  // Add this function to load favorites
  const loadFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const favoriteMovies = await getFavorites();
      setFavorites(favoriteMovies);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Add this handler for removing favorites
  const handleRemoveFavorite = async (movieId: number) => {
    try {
      await toggleFavorite(movieId, false);
      // Remove the movie from the local state
      setFavorites(favorites.filter((movie) => movie.id !== movieId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Modern Profile Header with Glass Morphism */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 mb-10 text-white shadow-lg overflow-hidden backdrop-blur-sm">
        {/* Glass morphism effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 backdrop-filter backdrop-blur-lg"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-400 opacity-20 rounded-full -mt-20 -mr-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-800 opacity-20 rounded-full -mb-20 -ml-20 blur-xl"></div>

        {/* Profile content */}
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Profile image with animated border */}
          <div className="relative">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white/50 shadow-lg overflow-hidden">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.username || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <span className="sr-only">Online</span>
            </div>
          </div>

          {/* User details */}
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              {user.fullName || user.username}
            </h1>
            <p className="text-purple-100 mb-1 flex items-center justify-center md:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {user.email}
            </p>
            <p className="text-purple-200 text-sm flex items-center justify-center md:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Member since {returnDate(user.createdAt)}
            </p>
          </div>

          {/* Edit profile button */}
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleEditClick}
              className="cursor-pointer bg-white/20 hover:bg-white/30 text-white transition-colors py-2.5 px-6 rounded-full font-medium backdrop-blur-sm flex items-center group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs with Animated Indicator */}
      <div className="mb-10">
        <div className="relative flex space-x-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative min-w-0 hover: cursor-pointer flex-1 overflow-hidden px-4 py-3 flex items-center justify-center font-medium text-sm whitespace-nowrap transition-all duration-200 ease-in-out
                ${
                  activeTab === tab.id
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                }
              `}
            >
              <span className="flex items-center">
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 dark:bg-purple-400"
                  initial={false}
                ></motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area with Card-based UI */}
      <div>
        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
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
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
                Your Bookings
              </h2>

              {/* Filter dropdown - optional */}
              <div className="relative">
                <button className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Filter
                </button>
              </div>
            </div>

            <BookingList
              bookings={bookings}
              loading={loading}
              formatDate={formatDate}
            />
          </motion.div>
        )}

        {activeTab === "favorites" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-pink-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                Your Favorites
              </h2>
            </div>

            {/* Loading state */}
            {favoritesLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((movie) => (
                  <div key={movie.id} className="relative">
                    <MovieCard
                      movie={movie}
                      colorScheme="pink"
                      onFavoriteToggle={(id, isFav) => {
                        if (!isFav) {
                          setFavorites(favorites.filter((m) => m.id !== id));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-purple-200 dark:text-purple-900/50 mb-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    When you favorite movies, they'll appear here for quick
                    access
                  </p>
                  <Link
                    href="/movies"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-colors"
                  >
                    Explore Movies
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Preferences Tab - Placeholder */}
        {activeTab === "preferences" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
          >
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive booking confirmations and updates
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="email-toggle"
                    defaultChecked
                    className="sr-only"
                  />
                  <div className="block bg-gray-300 dark:bg-gray-600 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Movie Recommendations
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get personalized movie suggestions
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="recommendations-toggle"
                    defaultChecked
                    className="sr-only"
                  />
                  <div className="block bg-gray-300 dark:bg-gray-600 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Special Offers
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Stay updated with discounts and promotions
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="offers-toggle"
                    className="sr-only"
                  />
                  <div className="block bg-gray-300 dark:bg-gray-600 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
