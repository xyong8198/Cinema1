package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.dto.PaymentDTO;
import com.deloitte.absolute_cinema.entity.*;
import com.deloitte.absolute_cinema.repository.PaymentRepository;
import com.deloitte.absolute_cinema.service.BookingService;
import com.deloitte.absolute_cinema.service.PaymentService;
import com.deloitte.absolute_cinema.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@SecurityRequirement(name = "Bearer Authentication")
public class PaymentController {
    private final PaymentService paymentService;
    private final UserService userService;
    private final BookingService bookingService;
    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentService paymentService, UserService userService, BookingService bookingService, PaymentRepository paymentRepository) {
        this.paymentService = paymentService;
        this.userService = userService;
        this.bookingService = bookingService;
        this.paymentRepository = paymentRepository;

    }

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(HttpServletRequest request,
                                           @RequestParam Long bookingId) {
        try {
            String token = userService.extractBearerToken(request);
            User user = userService.getUserIdFromToken(token);

            // Ensure the booking belongs to the authenticated user
            Booking booking = bookingService.getBookingById(bookingId);

            if (!booking.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: You are not authorized to create a payment for this booking.");
            }

            PaymentDTO paymentDTO = paymentService.createPayment(bookingId);
            return ResponseEntity.ok(paymentDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/pay")
    public ResponseEntity<?> makePayment(HttpServletRequest request,
                                         @RequestParam Long paymentId,
                                         @RequestParam PaymentMethod paymentMethod,
                                         @RequestParam BigDecimal amount) {
        try {
            String token = userService.extractBearerToken(request);
            User user = userService.getUserIdFromToken(token);

            // Ensure the booking belongs to the authenticated user
            Payment payment = paymentService.getPaymentById(paymentId);
            Booking booking = bookingService.getBookingById(payment.getBooking().getId());

            // Ensure the booking belongs to the authenticated user
            if (!booking.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: You are not authorized to make a payment for this booking.");
            }

            PaymentDTO paymentDTO = paymentService.makePayment(paymentId, paymentMethod, amount);
            return ResponseEntity.ok("Payment successful: " + paymentDTO);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payment failed: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get payment details", description = "Fetch details of a payment by its bookingID")
    public ResponseEntity<?> getPaymentByBookingId(
            HttpServletRequest request,
            @PathVariable Long bookingId) {
        try {
            // Extract token from request
            String token = userService.extractBearerToken(request);

            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            User user = userService.getUserIdFromToken(token);

            // Get booking details to verify ownership
            Booking booking = bookingService.getBookingById(bookingId);
            if (!booking.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Not authorized to access this payment.");
            }

            // Check if a pending payment already exists for this booking
            Optional<Payment> existingPayment = paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING);
            if (existingPayment.isPresent()) {
                return ResponseEntity.ok(existingPayment);
            } else {
                return ResponseEntity.badRequest().body("Error obtaining existing payment for bookingId: " + bookingId);
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error obtaining paymentId from bookingId: " + e.getMessage());
        }
        }

    @PostMapping("/refund")
    public ResponseEntity<String> processRefund(@RequestParam Long paymentId) {
        try{
            PaymentDTO paymentDTO = paymentService.processRefund(paymentId);
            return ResponseEntity.ok("Payment refunded: " + paymentDTO);
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

