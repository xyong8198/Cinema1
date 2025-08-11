"use client";

import { useParams } from 'next/navigation';
import SeatSelection from "@/components/SeatSelection";
import BookingCard from "@/components/PreBookingCard";

const PreBookingPage = () => {
  const params = useParams();
  const showtimeId = params.showtimeId as string;
  
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-10 text-center">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Book Your Tickets
          </span>
        </h1>
        
        {/* Movie details card */}
        <BookingCard showtimeId={showtimeId} />
        
        {/* Seat selection component */}
        <SeatSelection showtimeId={showtimeId} />
      </div>
    </div>
  );
};

export default PreBookingPage;