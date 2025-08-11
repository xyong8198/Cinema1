"use client";

import { useSearchParams } from "next/navigation";
import SeatSelection from "@/components/SeatSelection";

const PreBookingPage = () => {
  const searchParams = useSearchParams();
  const showtimeId = searchParams.get("showtimeId");

  if (!showtimeId) return <p className="text-center text-black">Missing Showtime ID</p>;
  
  return <SeatSelection showtimeId={showtimeId} />;
};

export default PreBookingPage;
