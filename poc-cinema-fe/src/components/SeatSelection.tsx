"use client";

import { createBooking, fetchSeats } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Seat {
  id: string;
  status: string; 
  row: string;  // Ensure API returns this
  number: number; // Ensure API returns this
}

interface SeatSelectionProps {
  showtimeId: string;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ showtimeId }) => {
  const router = useRouter(); // Initialize the router
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);


  useEffect(() => {
    const loadSeats = async () => {
      try {
        const data: Seat[] = await fetchSeats(showtimeId);

        // **Sort seats by ID before arranging them in grid**
        const sortedSeats = data.sort((a, b) => parseInt(a.id) - parseInt(b.id));

        // **Arrange seats into 10x10 grid (A-J rows, 1-10 per row)**
        const arrangedSeats = sortedSeats.map((seat, index) => ({
          ...seat,
          row: String.fromCharCode(65 + Math.floor(index / 10)), // A-J
          number: (index % 10) + 1,
        }));

        setSeats(arrangedSeats);
      } catch (error) {
        console.error("Error fetching seats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [showtimeId]);

  const toggleSeatSelection = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleConfirmSelection = async () => {
    if (selectedSeats.length === 0) return;
  
    try {
      setIsProcessing(true);
      // Then create a booking
      const booking = await createBooking(selectedSeats);
      
      // Navigate to payment page with selected seats and booking ID
      router.push(`/booking/${booking.id}`);
      
    } catch (error: any) {
      alert("Error: " + error.message);
      setIsProcessing(false);
    }
  };
  

  if (loading) return <p className="text-center text-white">Loading...</p>;

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);
  
  // Ensure seats within each row are sorted correctly
  Object.keys(groupedSeats).forEach((row) => {
    groupedSeats[row] = groupedSeats[row].sort((a, b) => a.number - b.number);
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">Select Your Seats</h1>
      <div className="p-6 bg-gray-800 rounded-lg space-y-4">
        <div className="w-full font-bold text-lg max-w-3xl bg-gray-700 text-white text-center py-2 rounded-md mb-6 shadow-lg">
            SCREEN
        </div>
        {/* Seat grid rendering */}
        {Object.entries(groupedSeats).map(([row, seats]) => (
            <div key={row} className="flex items-center space-x-4">
                <span className="w-8 text-lg font-semibold text-center">{row}</span>
                <div className="grid grid-cols-10 gap-2">
                    {seats
                    .sort((a, b) => a.number - b.number)
                    .map((seat) => (
                        <button
                        key={seat.id}
                        onClick={() => toggleSeatSelection(seat.id)}
                        className={`w-12 h-12 flex items-center justify-center rounded-md text-lg font-semibold
                            transition-all duration-200 cursor-pointer
                            ${
                            seat.status === "BOOKED" || seat.status === "UNCONFIRMED" 
                                ? "bg-red-500 text-white cursor-not-allowed"
                                : selectedSeats.includes(seat.id)
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white hover:bg-green-400"
                            }`}
                        disabled={seat.status === "BOOKED" || seat.status === "UNCONFIRMED"}
                        >
                        {seat.number}
                        </button>
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      {/* Confirm button with loading state */}
      <button
        onClick={handleConfirmSelection}
        disabled={selectedSeats.length === 0 || isProcessing}
        className="mt-6 px-6 py-3 bg-orange-500 text-white text-lg font-semibold rounded-md 
                 hover:bg-orange-400 disabled:bg-gray-500 transition-all cursor-pointer"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
        ) : (
          `Confirm Selection${selectedSeats.length > 0 ? ` (${selectedSeats.length})` : ''}`
        )}
      </button>
    </div>
  );
};

export default SeatSelection;
