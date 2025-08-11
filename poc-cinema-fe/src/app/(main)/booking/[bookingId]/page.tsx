"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import BookingInfo from "@/components/BookingInfo";
import PaymentForm from "@/components/PaymentForm";
import {
  getBookingById,
  getPaymentByBookingId,
  createPayment,
} from "@/lib/api";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [paymentExpiry, setPaymentExpiry] = useState<Date | null>(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handlePaymentSuccess = () => {
    router.push(`/booking/confirmation/${bookingId}`);
  };

  const handleInitiatePayment = async () => {
    try {
      setPaymentError(null);
      setLoading(true);

      // Create a new payment for this booking
      await createPayment(parseInt(bookingId, 10));

      // Refresh booking data
      const bookingData = await getBookingById(bookingId);
      setBooking(bookingData);

      try {
        const paymentData = await getPaymentByBookingId(bookingId);
        if (paymentData && paymentData.expiryTime) {
          setPaymentExpiry(new Date(paymentData.expiryTime));
        }
      } catch (err) {
        console.error("Error fetching payment after creation:", err);
      }

      // Show the payment form
      setShowPayment(true);
    } catch (error: any) {
      console.error("Failed to initiate payment:", error);
      setPaymentError(
        error.message || "Failed to initiate payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-10 text-center">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Ticket Payment
          </span>
        </h1>

        <BookingInfo bookingId={bookingId} />

        {paymentError && (
          <div className="my-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            <p>{paymentError}</p>
          </div>
        )}

        {!showPayment ? (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-bold text-white ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500"
              } transition-colors`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Initiate Payment"
              )}
            </button>
          </div>
        ) : (
          <PaymentForm bookingId={bookingId} onSuccess={handlePaymentSuccess} />
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import BookingInfo from "@/components/BookingInfo";
// import PaymentForm from "@/components/PaymentForm";
// import { getBookingById, getPaymentByBookingId, createPayment } from "@/lib/api";

// export default function BookingDetailsPage() {
//   const params = useParams();
//   const bookingId = params.bookingId as string;

//   return (
//     <div className="min-h-screen bg-gray-900 py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-4xl font-bold mb-10 text-center">
//           <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
//             Ticket Payment
//           </span>
//         </h1>

//         <BookingInfo bookingId={bookingId}/>
//         <PaymentForm bookingId={bookingId}/>

//       </div>
//     </div>

//   );
// }
