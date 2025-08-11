import React, { useEffect } from 'react';
import Link from 'next/link';
import BookingCard, { BookingProps } from './BookingCard';
import BookingLoadingState from './BookingLoadingState';
import BookingEmptyState from './BookingEmptyState';
import { fetchBookingHistory } from '@/lib/api';


interface BookingListProps {
  bookings: BookingProps[];
  loading: boolean;
  formatDate: (date: string) => string;
}

const BookingList = ({ bookings, loading, formatDate }: BookingListProps) => {
  if (loading) {
    return <BookingLoadingState />;
  }

  if (!bookings || bookings.length === 0) {
    return <BookingEmptyState />;
  }


  return (
    <div className="space-y-6">
      {bookings.map(booking => (
        <BookingCard 
          key={booking.id} 
          booking={booking} 
          formatDate={formatDate} 
        />
      ))}
      
      <div className="text-center py-6">
        <Link 
          href="/showtimes" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          Book More Movies
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default BookingList;