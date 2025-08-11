import Link from 'next/link';
import React from 'react';

const BookingEmptyState = () => {
  return (
    <div className="text-center py-20">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
      <p className="text-gray-500 mb-6">You haven't booked any movies yet</p>
      <Link 
        href="/showtimes" 
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
      >
        Book Now
      </Link>
    </div>
  );
};

export default BookingEmptyState;