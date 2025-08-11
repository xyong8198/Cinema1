package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.dto.PaymentDTO;
import com.deloitte.absolute_cinema.entity.*;
import com.deloitte.absolute_cinema.exception.ResourceNotFoundException;
import com.deloitte.absolute_cinema.repository.BookingRepository;
import com.deloitte.absolute_cinema.repository.PaymentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository, NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public PaymentDTO createPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Booking has expired or is already processed.");
        }

        // Check if a pending payment already exists for this booking
        Optional<Payment> existingPayment = paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING);
        if (existingPayment.isPresent()) {
            throw new IllegalStateException("A pending payment already exists for this booking. Please complete the payment.");
        }

        // Auto-assign the correct amount from the booking
        BigDecimal amount = booking.getTotalPrice();

        // Create Payment (Initially PENDING)
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentMethod(null); // Not provided yet
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());

        return mapToDTO(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentDTO makePayment(Long paymentId, PaymentMethod paymentMethod, BigDecimal amount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment is already processed or expired.");
        }

        // Ensure payment hasn't expired (Handled by @Scheduled job too)
        if (LocalDateTime.now().isAfter(payment.getCreatedAt().plusSeconds(120))) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new IllegalStateException("Payment has expired.");
        }

        // Validate amount
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        if (amount.compareTo(payment.getAmount()) != 0) {
            throw new IllegalArgumentException("Incorrect payment amount. Please pay exactly: " + payment.getAmount());
        }

        // Mark as successful
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus(PaymentStatus.SUCCESSFUL);

        // Update booking status
        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CONFIRMED);

        // Update seat status
        booking.getBookingSeats().forEach(seat -> seat.getSeat().setStatus(SeatStatus.BOOKED));

        // Handle both registered users and guest users
        String recipientEmail = null;

        if (payment.getBooking().getUser() != null) {
            recipientEmail = payment.getBooking().getUser().getEmail();
        } else if (payment.getBooking().getGuest() != null) {
            recipientEmail = payment.getBooking().getGuest().getEmail();
        }

        if (recipientEmail != null) {
            notificationService.sendPaymentConfirmation(recipientEmail, paymentId);
        }
        // Send confirmation notification
        notificationService.sendBookingConfirmation(booking);

        // Save all updates
        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return mapToDTO(payment);
    }

    /**
     * Scheduled Task: Expires pending payments older than 120 seconds
     */
    @Scheduled(fixedRate = 10000) // Runs every 1 minute
    @Transactional
    public void expirePendingPayments() {
        LocalDateTime expirationThreshold = LocalDateTime.now().minusSeconds(120);
        List<Payment> expiredPayments = paymentRepository.findByStatusAndCreatedAtBefore(PaymentStatus.PENDING, expirationThreshold);

        for (Payment payment : expiredPayments) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
    }


    @Transactional
    public PaymentDTO processRefund(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        // Get the related booking/show information
        List<BookingSeat> bookingSeats = payment.getBooking().getBookingSeats();
        BookingSeat bookingSeat = bookingSeats.get(0);
        Showtime showtime = bookingSeat.getSeat().getShowtime();
        LocalDateTime screeningTime = showtime.getScreeningTime();
        LocalDateTime now = LocalDateTime.now();

        // Check if cancellation is at least 24 hours before showtime
        if (now.plusHours(24).isBefore(screeningTime)) {
            payment.setStatus(PaymentStatus.REFUNDED);
            payment = paymentRepository.save(payment);

            // Handle both registered users and guest users
            String recipientEmail = null;

            if (payment.getBooking().getUser() != null) {
                recipientEmail = payment.getBooking().getUser().getEmail();
            } else if (payment.getBooking().getGuest() != null) {
                recipientEmail = payment.getBooking().getGuest().getEmail();
            }

            if (recipientEmail != null) {
                notificationService.sendRefundNotification(recipientEmail, paymentId);
            }

            return mapToDTO(payment);
        } else {
            throw new IllegalStateException("Refunds are only allowed if cancellation occurs at least 24 hours before showtime");
        }
    }

    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + paymentId + " not found"));
    }

//    public Payment getPaymentByBookingId(Long bookingId) {
//        return paymentRepository.findByBookingId(bookingId)
//                .orElseThrow(() -> new ResourceNotFoundException("Payment with Booking ID " + bookingId + " not found"));
//    }

    private PaymentDTO mapToDTO(Payment payment) {
        return new PaymentDTO(
                payment.getId(),
                payment.getBooking().getId(),
                payment.getPaymentMethod(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getCreatedAt()
        );
    }
}
