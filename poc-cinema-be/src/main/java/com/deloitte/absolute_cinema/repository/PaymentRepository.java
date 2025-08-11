package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.Payment;
import com.deloitte.absolute_cinema.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStatusAndCreatedAtBefore(PaymentStatus status, LocalDateTime time);
    // Find a payment by booking ID and status
    Optional<Payment> findByBookingIdAndStatus(Long bookingId, PaymentStatus status);
    Optional<Payment> findByBookingId(Long bookingId);

}