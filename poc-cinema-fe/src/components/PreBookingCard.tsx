"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { getShowtimeDetails } from "@/lib/api";
import MoviePoster from "./MoviePoster";

// Type definition for the showtime data structure
interface ShowtimeDetails {
  id: number;
  movieTitle: string;
  moviePrice: number;
  posterUrl: string;
  cinemaName: string;
  screeningTime: string;
  hall: number;
}

interface BookingCardProps {
  showtimeId: string;
}

const BookingCard: React.FC<BookingCardProps> = ({ showtimeId }) => {
    const [loading, setLoading] = useState(true);
    const [showtime, setShowtime] = useState<ShowtimeDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchShowtimeDetails = async () => {
        try {
          setLoading(true);
          const data = await getShowtimeDetails(showtimeId);
          setShowtime(data);
        } catch (err) {
          console.error("Error fetching showtime:", err);
          setError("Failed to load booking details. Please try again.");
        } finally {
          setLoading(false);
        }
      };
  
      if (showtimeId) {
        fetchShowtimeDetails();
      }
    }, [showtimeId]);
  
    // Format the date and time for display
    const formatScreeningDate = (dateString: string): { date: string; time: string } => {
      try {
        const date = parseISO(dateString);
        return {
          date: format(date, "EEEE, MMMM d, yyyy"),
          time: format(date, "h:mm a")
        };
      } catch (e) {
        return { date: "Invalid date", time: "Invalid time" };
      }
    };
  
    if (loading) {
      return (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 h-80 bg-gray-700 rounded-xl"></div>
            <div className="md:w-3/4">
              <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
  
    if (error || !showtime) {
      return (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="text-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">Error Loading Booking Information</h3>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      );
    }
  
    const { date, time } = formatScreeningDate(showtime.screeningTime);  

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Movie Poster */}
        <div className="md:w-1/4">
          <div className="relative rounded-xl overflow-hidden aspect-[2/3] shadow-lg">
            <MoviePoster 
              src={showtime.posterUrl} 
              alt={showtime.movieTitle}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        
        {/* Movie Details */}
        <div className="md:w-3/4">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            {showtime.movieTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Date & Time</p>
              <p className="font-medium">{date}</p>
              <p className="font-bold text-lg text-purple-400">{time}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Cinema</p>
              <p className="font-medium">{showtime.cinemaName}</p>
              <p className="text-sm text-purple-400">Hall {showtime.hall}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-300">Ticket Price Per Seat</p>
              <p className="font-medium text-2xl text-green-400">
                RM{showtime.moviePrice.toFixed(2)} 
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/20 rounded-xl">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-purple-300 text-sm">
                Please select your seats below to complete your booking. Selected seats are reserved for 10 minutes during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
