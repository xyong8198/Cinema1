import Link from "next/link";
import { getAllMovies } from "@/lib/api";

export const revalidate = 3600; // Revalidate at most once per hour

// Define inline styles with dark mode alternatives
const styles = {
  pastelButton: {
    borderRadius: "9999px",
    fontWeight: 500,
    padding: "0.5rem 1.5rem",
    transition: "all 300ms",
    transformOrigin: "center",
  },
  primaryButton: {
    background: "linear-gradient(to right, #ec4899, #9333ea)",
    color: "white",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(4px)",
  },
  ctaPrimaryButton: {
    backgroundColor: "white",
    color: "#9333ea",
  },
  ctaSecondaryButton: {
    backgroundColor: "transparent",
    border: "2px solid white",
  },
  sectionTitle: {
    fontSize: "1.875rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
    color: "transparent",
    backgroundClip: "text",
    backgroundImage: "linear-gradient(to right, #8b5cf6, #3b82f6)",
  },
  featureIcon: {
    width: "4rem",
    height: "4rem",
    marginBottom: "1rem",
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },
};

export default async function Home() {
  const movies = await getAllMovies();
  const featuredMovies = movies.slice(0, 3);

  return (
    <div className="dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section - Improved with gradient and svg shapes */}
      <section className="relative overflow-hidden">
        {/* Gradient overlay with better color combination */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-pink-700/90 z-0"></div>

        {/* Abstract geometric shapes */}
        <div className="absolute inset-0 z-0">
          {/* Large circle */}
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-500/20 to-purple-500/20 blur-xl"></div>
          {/* Medium circle */}
          <div className="absolute bottom-10 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-xl"></div>
          {/* Small circles for visual interest */}
          <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-pink-400/30 blur-md"></div>
          <div className="absolute bottom-1/4 left-1/3 w-16 h-16 rounded-full bg-purple-300/20 blur-sm"></div>

          {/* Film strip inspired elements */}
          <svg
            className="absolute -bottom-10 right-0 text-white/5 w-72 h-72"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M10,10 L40,10 L40,40 L10,40 Z M50,10 L80,10 L80,40 L50,40 Z M90,10 L120,10 L120,40 L90,40 Z M130,10 L160,10 L160,40 L130,40 Z M170,10 L190,10 L190,40 L170,40 Z"></path>
            <path d="M10,50 L40,50 L40,80 L10,80 Z M50,50 L80,50 L80,80 L50,80 Z M90,50 L120,50 L120,80 L90,80 Z M130,50 L160,50 L160,80 L130,80 Z M170,50 L190,50 L190,80 L170,80 Z"></path>
            <path d="M10,90 L40,90 L40,120 L10,120 Z M50,90 L80,90 L80,120 L50,120 Z M90,90 L120,90 L120,120 L90,120 Z M130,90 L160,90 L160,120 L130,120 Z M170,90 L190,90 L190,120 L170,120 Z"></path>
          </svg>

          <svg
            className="absolute -left-10 top-20 text-white/5 w-64 h-64"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <circle cx="20" cy="20" r="15"></circle>
            <circle cx="60" cy="20" r="15"></circle>
            <circle cx="100" cy="20" r="15"></circle>
            <circle cx="140" cy="20" r="15"></circle>
            <circle cx="180" cy="20" r="15"></circle>
            <circle cx="20" cy="60" r="15"></circle>
            <circle cx="60" cy="60" r="15"></circle>
            <circle cx="100" cy="60" r="15"></circle>
            <circle cx="140" cy="60" r="15"></circle>
            <circle cx="180" cy="60" r="15"></circle>
          </svg>
        </div>

        <div className="relative h-[70vh] md:h-[80vh]">
          <div className="absolute inset-0 flex items-center z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  Discover &amp; Book Your{" "}
                  <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Favorite Movies
                  </span>
                </h1>
                <p className="text-lg mb-8 text-white/90">
                  The easiest way to find movies and book tickets at your
                  favorite cinemas
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/movies"
                    className="inline-block rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Browse Movies
                  </Link>
                  <Link
                    href="/showtimes"
                    className="inline-block rounded-full bg-white/20 backdrop-blur-sm text-white font-medium px-6 py-3 hover:bg-white/30 transition-colors duration-300"
                  >
                    View Showtimes
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements to add depth */}
          <div className="hidden md:block absolute right-8 bottom-8 z-10 transform rotate-6">
            <div className="w-48 h-64 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-md rounded-xl shadow-2xl"></div>
          </div>
          <div className="hidden md:block absolute right-40 bottom-32 z-10 transform -rotate-3">
            <div className="w-32 h-48 bg-gradient-to-tl from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl shadow-xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Why Choose Absolute Cinema?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Booking",
                description:
                  "Book your favorite movies with just a few clicks, anytime, anywhere.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
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
                gradient: "linear-gradient(to right, #a78bfa, #7c3aed)",
              },
              {
                title: "Best Experience",
                description:
                  "Discover the best movies and theaters for an unforgettable experience.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                ),
                gradient: "linear-gradient(to right, #f472b6, #db2777)",
              },
              {
                title: "Detailed Info",
                description:
                  "Get all the information you need about movies, showtimes, and cinemas.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                ),
                gradient: "linear-gradient(to right, #93c5fd, #3b82f6)",
              },
            ].map((feature, index) => (
              <div
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md transform hover:scale-105 transition-all duration-300 dark:shadow-purple-900/20"
                key={`feature-${index}`}
              >
                <div
                  style={{
                    background: feature.gradient,
                  }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg"
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Exploring?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Find the perfect movie and book your tickets now for an amazing
            cinema experience
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/movies"
              className="inline-block rounded-full bg-white text-purple-700 font-medium px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Browse Movies
            </Link>
            <Link
              href="/showtimes"
              className="inline-block rounded-full border-2 border-white text-white font-medium px-6 py-3 hover:bg-white/10 transition-colors duration-300"
            >
              Find Showtimes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
