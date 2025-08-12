import React from "react";
import { format } from "date-fns";
import { fetchBookingReceipt, fetchBookingTicket } from "@/lib/api";
import { Showtime } from "@/types/movie";
import MoviePoster from "../MoviePoster";

// Update the props interface to match the actual API response structure
export interface BookingProps {
  id: number;
  totalPrice: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  bookingSeats: {
    bookingSeatId: number;
    seat: {
      id: number;
      seatNumber: string;
      seatType: string;
      status: string;
      showtime: {
        id: number;
        screeningTime: string;
        hall: number;
        movie: {
          id: number;
          title: string;
          posterUrl: string;
          price: number;
          duration: number;
          rating: string;
        };
        cinema: {
          id: number;
          name: string;
          location: string;
        };
      };
    };
  }[];
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  guest?: any;
}

interface BookingCardProps {
  booking: BookingProps;
  formatDate?: (date: string) => string;
}

const BookingCard = ({ booking, formatDate }: BookingCardProps) => {
  // Extract movie data from the first booking seat (all seats should have the same movie)
  const movie = booking.bookingSeats[0]?.seat.showtime.movie;
  const cinema = booking.bookingSeats[0]?.seat.showtime.cinema;
  const showtime = booking.bookingSeats[0]?.seat.showtime;

  // Get seat numbers as an array
  const seatNumbers = booking.bookingSeats.map((bs) => bs.seat.seatNumber);

  // Format dates - use passed formatDate function or default to this format
  const formatDateStr = (dateStr: string) => {
    if (formatDate) return formatDate(dateStr);
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
  };

  // Format screening time
  const showtimeFormatted = showtime
    ? formatDateStr(showtime.screeningTime)
    : "N/A";

  // Format booking date
  const bookingDateFormatted = formatDateStr(booking.createdAt);

  // Define status badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100/80 dark:bg-green-800/80 text-green-800 dark:text-green-200";
      case "PENDING":
        return "bg-yellow-100/80 dark:bg-yellow-800/80 text-yellow-800 dark:text-yellow-200";
      case "CANCELLED":
        return "bg-red-100/80 dark:bg-red-800/80 text-red-800 dark:text-red-200";
      case "COMPLETED":
        return "bg-blue-100/80 dark:bg-blue-800/80 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Movie Poster - MADE SMALLER */}
        <div className="sm:w-1/6 h-48 sm:h-auto relative">
          <MoviePoster
            src={movie?.posterUrl}
            alt={movie?.title || "Movie poster"}
            useNextImage={false}
            className="w-full h-full object-cover"
          />

          {/* Status badge overlaid on the poster */}
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status}
          </div>
        </div>

        {/* Booking Details - NOW WIDER */}
        <div className="flex-1 p-5 sm:p-6 dark:text-gray-100">
          <div className="flex flex-wrap justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {movie?.title || "No title available"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                {cinema?.name || "No cinema available"} • Hall{" "}
                {showtime?.hall || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                ${booking.totalPrice?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Booking ID: {booking.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Show Date & Time
              </p>
              <p className="font-medium text-base dark:text-gray-100">
                {showtimeFormatted}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Seats
              </p>
              <p className="font-medium flex flex-wrap gap-1.5">
                {seatNumbers.map((seat) => (
                  <span
                    key={seat}
                    className="inline-flex px-2.5 py-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md font-medium"
                  >
                    {seat}
                  </span>
                ))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Booking Date
              </p>
              <p className="font-medium text-base dark:text-gray-100">
                {bookingDateFormatted}
              </p>
            </div>
          </div>

          {/* Optional: Add movie details if space allows */}
          <div className="hidden sm:block mb-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Movie Details
            </p>
            <div className="flex gap-5 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
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
                {movie?.duration} mins
              </div>
              <div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-xs">
                  {movie?.rating || "Not Rated"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              className="px-5 py-2 text-sm font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors hover: cursor-pointer"
              onClick={async () => await fetchBookingTicket(booking.id)}
            >
              View E-Tickets
            </button>
            <button
              className="px-5 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors hover: cursor-pointer"
              onClick={async () => await fetchBookingReceipt(booking.id)}
            >
              Get Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
