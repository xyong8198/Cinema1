package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.entity.*;
import com.deloitte.absolute_cinema.exception.ResourceNotFoundException;
import com.deloitte.absolute_cinema.repository.BookingRepository;
import com.deloitte.absolute_cinema.repository.BookingSeatRepository;
import com.deloitte.absolute_cinema.repository.SeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final SeatService seatService;
    private final SeatRepository seatRepository;
    private final UserService userService;

    public BookingService(BookingRepository bookingRepository, NotificationService notificationService,
                          SeatRepository seatRepository, SeatService seatService, UserService userService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.seatRepository = seatRepository;
        this.seatService = seatService;
        this.userService = userService;
    }

    private boolean isWeekendNight(LocalDateTime screeningTime) {
        DayOfWeek dayOfWeek = screeningTime.getDayOfWeek();
        LocalTime time = screeningTime.toLocalTime();
        LocalTime sixPM = LocalTime.of(18, 0);
        
        return (dayOfWeek == DayOfWeek.FRIDAY || 
                dayOfWeek == DayOfWeek.SATURDAY || 
                dayOfWeek == DayOfWeek.SUNDAY) && 
                (time.isAfter(sixPM) || time.equals(sixPM));
    }

    private BigDecimal calculateTicketPrice(BigDecimal basePrice, LocalDateTime screeningTime) {
        if (isWeekendNight(screeningTime)) {
            BigDecimal markup = basePrice.multiply(BigDecimal.valueOf(0.20));
            return basePrice.add(markup);
        }
        return basePrice;
    }

    @Transactional
    public Booking createBooking(Booking booking, List<Long> selectedSeatIds) {
        // Step 1: Ensure the seats are available before booking
        seatService.selectSeats(selectedSeatIds);

        // Step 2: Fetch seats from the database
        List<Seat> selectedSeats = seatRepository.findAllById(selectedSeatIds);

        // Step 3: Create BookingSeat entries and calculate total price
        List<BookingSeat> bookingSeats = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (Seat seat : selectedSeats) {
            BookingSeat bookingSeat = BookingSeat.builder()
                    .booking(booking)  // Assign Booking
                    .seat(seat)
                    .build();
            bookingSeats.add(bookingSeat);
            BigDecimal ticketPrice = calculateTicketPrice(seat.getShowtime().getMovie().getPrice(), seat.getShowtime().getScreeningTime());
            totalPrice = totalPrice.add(ticketPrice);
        }

        // Step 4: Assign BookingSeats and total price to Booking
        booking.setBookingSeats(bookingSeats);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        // Step 5: Save the Booking first - will cascade save to BookingSeat
        return bookingRepository.save(booking);
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + bookingId + " not found"));
    }

    public List<Booking> getUserBookings(String token) {
        User user = userService.getUserIdFromToken(token);
        List<Booking> bookings = bookingRepository.findByUserId(user.getId());
        if (bookings.isEmpty()) {
            throw new ResourceNotFoundException("No bookings found for user ID " + user.getId());
        }
        return bookings;
    }

    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + bookingId + " not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        notificationService.sendCancellationEmail(booking);
    }

    public void resendBookingConfirmation(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + bookingId + " not found"));

        notificationService.sendReminder(booking);
        System.out.println("Resent confirmation email for booking ID: " + bookingId);
    }

    public List<Booking> getUserBookingHistory(Long userId, LocalDate startDate, LocalDate endDate, BookingStatus status) {
        List<Booking> allBookings = bookingRepository.findByUserId(userId);

        // Apply filters
        List<Booking> filteredBookings = allBookings.stream()
                .filter(booking -> {
                    // Filter by date range if provided
                    boolean dateMatch = true;
                    if (startDate != null) {
                        dateMatch = !booking.getCreatedAt().toLocalDate().isBefore(startDate);
                    }
                    if (endDate != null && dateMatch) {
                        dateMatch = !booking.getCreatedAt().toLocalDate().isAfter(endDate);
                    }

                    // Filter by status if provided
                    boolean statusMatch = true;
                    if (status != null) {
                        statusMatch = booking.getStatus() == status;
                    }

                    return dateMatch && statusMatch;
                })
                .collect(Collectors.toList());

        return filteredBookings;
    }

    public List<Booking> getUserUpcomingBookings(Long userId) {
        List<Booking> allBookings = bookingRepository.findByUserId(userId);
        LocalDateTime now = LocalDateTime.now();

        return allBookings.stream()
                .filter(booking -> {
                    // Get the showtime date from the first seat (all seats have the same showtime)
                    if (!booking.getBookingSeats().isEmpty()) {
                        LocalDateTime showtimeDate = booking.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime();
                        return showtimeDate.isAfter(now) && booking.getStatus() != BookingStatus.CANCELLED;
                    }
                    return false;
                })
                .sorted((b1, b2) -> {
                    LocalDateTime time1 = b1.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime();
                    LocalDateTime time2 = b2.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime();
                    return time1.compareTo(time2);
                })
                .collect(Collectors.toList());
    }

    public List<Booking> getUserPastBookings(Long userId) {
        List<Booking> allBookings = bookingRepository.findByUserId(userId);
        LocalDateTime now = LocalDateTime.now();

        return allBookings.stream()
                .filter(booking -> {
                    // Get the showtime date from the first seat (all seats have the same showtime)
                    if (!booking.getBookingSeats().isEmpty()) {
                        LocalDateTime showtimeDate = booking.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime();
                        return showtimeDate.isBefore(now) || booking.getStatus() == BookingStatus.CANCELLED;
                    }
                    return false;
                })
                .sorted((b1, b2) -> {
                    LocalDateTime time1 = b1.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime();
                    LocalDateTime time2 = b2.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime();
                    return time2.compareTo(time1); // Newest first
                })
                .collect(Collectors.toList());
    }
}
