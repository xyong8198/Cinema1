package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.entity.Booking;
import com.deloitte.absolute_cinema.entity.BookingSeat;
import com.deloitte.absolute_cinema.entity.BookingStatus;
import com.deloitte.absolute_cinema.entity.SeatStatus;
import com.deloitte.absolute_cinema.repository.BookingRepository;
import com.deloitte.absolute_cinema.repository.BookingSeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingCleanupService {
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;

    public BookingCleanupService(BookingRepository bookingRepository, BookingSeatRepository bookingSeatRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void cancelUnconfirmedBookings() {
        List<Booking> bookings = bookingRepository.findAllActiveBookings(); // Implement this query

        for (Booking booking : bookings) {
            List<BookingSeat> seats = bookingSeatRepository.findByBookingId(booking.getId());

            boolean allUnconfirmed = seats.stream()
                    .allMatch(seat -> seat.getSeat().getStatus() == SeatStatus.AVAILABLE);

            if (allUnconfirmed) {
                booking.setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(booking);
                System.out.println("Cancelled booking: " + booking.getId());
            }
        }
    }
}
