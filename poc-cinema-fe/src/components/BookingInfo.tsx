"use client";

import { useEffect, useState } from "react";
import { getBookingById } from "@/lib/api";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import MoviePoster from "./MoviePoster";

interface BookingInfoProps {
  bookingId: string;
}

// Updated to match the actual API response structure
interface BookingDetails {
  id: number;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  guest: any;
  totalPrice: number;
  status: string;
  createdAt: string;
  bookingSeats: {
    bookingSeatId: number;
    seat: {
      id: number;
      showtime: {
        id: number;
        movie: {
          id: number;
          title: string;
          genre: string;
          posterUrl: string;
          price: number;
        };
        cinema: {
          id: number;
          name: string;
          location: string;
        };
        screeningTime: string;
        hall: number;
      };
      seatNumber: string;
      status: string;
    };
  }[];
}

const BookingInfo: React.FC<BookingInfoProps> = ({ bookingId }) => {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date unavailable";
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 h-80 bg-gray-700 rounded-xl"></div>
          <div className="md:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 ">
        <div className="text-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold mb-2">Error Loading Booking Information</h3>
          <p className="text-gray-300">{error || "Booking information not found."}</p>
        </div>
      </div>
    );
  }

  // Extract movie, cinema, and screening details from the first seat
  // (All seats in a booking are for the same showtime)
  const firstSeat = booking.bookingSeats[0]?.seat;
  const showtime = firstSeat?.showtime;
  const movie = showtime?.movie;
  const cinema = showtime?.cinema;

  // Extract seat numbers from booking
  const seatNumbers = booking.bookingSeats.map(bs => bs.seat.seatNumber).sort();

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8 text-white">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
        Booking Information
      </h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {movie?.posterUrl && (
          <div className="md:w-1/4">
            <div className="relative rounded-xl overflow-hidden aspect-[2/3] shadow-lg">
              <MoviePoster 
                src={movie.posterUrl} 
                alt={movie.title || "Movie poster"}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        )}
        
        <div className="md:w-3/4">
          <h3 className="text-xl font-bold mb-4">{movie?.title}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Booking ID</p>
              <p className="font-medium">#{booking.id}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Customer</p>
              <p className="font-medium">{booking.user?.fullName || "Guest"}</p>
              <p className="text-xs text-gray-400">{booking.user?.email}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Cinema</p>
              <p className="font-medium">{cinema?.name || "Unknown"}</p>
              <p className="text-sm text-purple-400">Hall {showtime?.hall || "N/A"}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Show Date & Time</p>
              <p className="font-medium">{showtime ? formatDate(showtime.screeningTime) : "Not available"}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Booking Date</p>
              <p className="font-medium">{formatDate(booking.createdAt)}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Seats</p>
              <p className="font-medium">
                {seatNumbers.length > 0 
                  ? seatNumbers.join(", ") 
                  : "No seats selected"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total: {seatNumbers.length} seat(s)</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Total Amount</p>
              <p className="font-medium text-2xl text-green-400">
                RM{booking.totalPrice?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-gray-400">
                RM{movie?.price?.toFixed(2) || "0.00"} × {seatNumbers.length} seat(s)
              </p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Booking Status</p>
              <p className={`font-medium ${
                booking.status === "CONFIRMED" 
                  ? "text-green-400" 
                  : booking.status === "PENDING" 
                    ? "text-yellow-400" 
                    : "text-red-400"
              }`}>
                {booking.status || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingInfo;
