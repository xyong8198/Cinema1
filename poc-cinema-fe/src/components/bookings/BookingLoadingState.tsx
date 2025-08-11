import React from 'react';

const BookingLoadingState = () => {
  return (
    <div className="flex justify-center py-20">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-spin mb-4"></div>
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    </div>
  );
};

export default BookingLoadingState;