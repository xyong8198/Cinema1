"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BookingInfo from "@/components/BookingInfo";
import Link from "next/link";
import { getBookingById } from "@/lib/api";

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch booking info
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const data = await getBookingById(bookingId);
        setBooking(data);
        
        // Redirect to booking page if payment is still pending
        if (data.status === "PENDING") {
          router.push(`/booking/${bookingId}`);
        }
      } catch (error: any) {
        console.error("Failed to fetch booking details:", error);
        setError(error.message || "Failed to load booking information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Booking Not Found</h1>
            <p className="text-gray-300 mb-6">
              {"We couldn't find the booking you're looking for."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg">
                Return to Home
              </Link>
              <Link href="/my-bookings" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg">
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show success content if booking exists and is confirmed
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Only show success message if booking is confirmed */}
        {booking.status === "CONFIRMED" ? (
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                Payment Successful!
              </span>
            </h1>
            <p className="text-gray-300 mt-3 text-lg">Your payment has been confirmed and your tickets are ready.</p>
          </div>
        ) : (
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Booking Details
              </span>
            </h1>
            <p className="text-gray-300 mt-3 text-lg">Current status: <span className="font-semibold">{booking.status}</span></p>
          </div>
        )}
        
        {/* Reusing BookingInfo component */}
        <BookingInfo bookingId={bookingId} />

        {/* E-ticket section - only show for confirmed bookings */}
        {booking.status === "CONFIRMED" && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Your E-Tickets
            </h2>
            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span className="font-semibold text-xl">E-Ticket #{booking.id}</span>
                </div>
                <span className="bg-green-800 px-3 py-1 rounded-full text-sm font-medium text-green-200">
                  CONFIRMED
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                Present this confirmation page or your ticket ID at the cinema counter to collect your physical tickets.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                  <p className="text-sm text-gray-400">Ticket ID</p>
                  <p className="font-mono text-lg font-bold">{booking.id}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                  <p className="text-sm text-gray-400">Booking Ref</p>
                  <p className="font-mono text-lg font-bold">AC-{booking.id.toString().padStart(6, '0')}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-green-400 font-bold">Ready for Collection</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show completion buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/" 
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg transition-colors text-center"
          >
            Return to Home
          </Link>
          <Link href="/my-bookings"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition-colors text-center"
          >
            View All My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}