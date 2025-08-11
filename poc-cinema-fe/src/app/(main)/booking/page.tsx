"use client";

import { useSearchParams } from "next/navigation";
import SeatSelection from "@/components/SeatSelection";
import BookingInfo from "@/components/BookingInfo";

const BookingPage = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("showtimeId");

  if (!bookingId) return <p className="text-center text-black">Missing Showtime ID</p>;
  
  return <BookingInfo bookingId={bookingId} />;
};

export default BookingPage;
