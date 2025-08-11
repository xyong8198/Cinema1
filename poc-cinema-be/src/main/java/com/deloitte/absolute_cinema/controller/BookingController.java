package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.entity.Booking;
import com.deloitte.absolute_cinema.entity.BookingStatus;
import com.deloitte.absolute_cinema.entity.Guest;
import com.deloitte.absolute_cinema.entity.User;
import com.deloitte.absolute_cinema.service.BookingService;
import com.deloitte.absolute_cinema.service.GuestService;
import com.deloitte.absolute_cinema.service.PdfGenerationService;
import com.deloitte.absolute_cinema.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/bookings")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Booking API", description = "Endpoints for managing movie bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final GuestService guestService;
    private final PdfGenerationService pdfGenerationService;

    public BookingController(BookingService bookingService, UserService userService,
                             GuestService guestService, PdfGenerationService pdfGenerationService) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.guestService = guestService;
        this.pdfGenerationService = pdfGenerationService;
    }

    @PostMapping
    @Operation(summary = "Create a new booking", description = "Allows users or guests to create a movie booking")
    public ResponseEntity<?> createBooking(
            HttpServletRequest request,
            @RequestParam(required = false) String guestEmail,
            @RequestParam List<Long> selectedSeatIds) {

        try {
            Booking booking = new Booking();

            String token = userService.extractBearerToken(request);
            if (token != null) {
                return handleUserBooking(token, booking, selectedSeatIds);
            } else if (guestEmail != null) {
                return handleGuestBooking(guestEmail, booking, selectedSeatIds);
            } else {
                return ResponseEntity.badRequest().body("Either authentication token or guest email must be provided.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating booking: " + e.getMessage());
        }
    }



    private ResponseEntity<?> handleUserBooking(String token, Booking booking, List<Long> selectedSeatIds) {
        try {
            User user = userService.getUserIdFromToken(token);
            booking.setUser(user);
            Booking savedBooking = bookingService.createBooking(booking, selectedSeatIds);
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid user authentication: " + e.getMessage());
        }
    }

    private ResponseEntity<?> handleGuestBooking(String guestEmail, Booking booking, List<Long> selectedSeatIds) {
        try {
            Guest guest = guestService.createGuest(guestEmail);
            booking.setGuest(guest);
            Booking savedBooking = bookingService.createBooking(booking, selectedSeatIds);
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating guest booking: " + e.getMessage());
        }
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking details", description = "Fetch details of a booking by its ID")
    public ResponseEntity<?> getBookingDetails(
            HttpServletRequest request,
            @PathVariable Long bookingId) {
        try {
            // Extract token from request
            String token = userService.extractBearerToken(request);

            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            User user = userService.getUserIdFromToken(token);

            Booking booking = bookingService.getBookingById(bookingId);

            // Check if the booking belongs to the authenticated user
            if (!booking.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Not authorized to access this booking.");
            }

            return ResponseEntity.ok(booking);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error obtaining booking: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    @Operation(summary = "Get user bookings", description = "Retrieve all bookings for a specific user")
    public ResponseEntity<List<Booking>> getUserBookings(HttpServletRequest request) {
        String token = userService.extractBearerToken(request);
        List<Booking> bookings = bookingService.getUserBookings(token);
        return ResponseEntity.ok(bookings);
    }

    @DeleteMapping("/{bookingId}")
    @Operation(summary = "Cancel a booking", description = "Allows users to cancel an existing booking")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) {
        bookingService.cancelBooking(bookingId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{bookingId}/resend-confirmation")
    @Operation(summary = "Resend booking confirmation", description = "Resends the confirmation email for a booking")
    public ResponseEntity<Void> resendBookingConfirmation(@PathVariable Long bookingId) {
        bookingService.resendBookingConfirmation(bookingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    @Operation(summary = "Get user booking history",
            description = "Retrieve booking history for the authenticated user with optional date filters")
    public ResponseEntity<List<Booking>> getBookingHistory(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) BookingStatus status) {

        try {
            String token = userService.extractBearerToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = userService.getUserIdFromToken(token);
            List<Booking> bookings = bookingService.getUserBookingHistory(user.getId(), startDate, endDate, status);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get user upcoming bookings",
            description = "Retrieve all upcoming bookings for the authenticated user")
    public ResponseEntity<List<Booking>> getUpcomingBookings(HttpServletRequest request) {
        try {
            String token = userService.extractBearerToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = userService.getUserIdFromToken(token);
            List<Booking> bookings = bookingService.getUserUpcomingBookings(user.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/past")
    @Operation(summary = "Get user past bookings",
            description = "Retrieve all past bookings for the authenticated user")
    public ResponseEntity<List<Booking>> getPastBookings(HttpServletRequest request) {
        try {
            String token = userService.extractBearerToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = userService.getUserIdFromToken(token);
            List<Booking> bookings = bookingService.getUserPastBookings(user.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{bookingId}/e-ticket")
    @Operation(summary = "Download e-ticket",
            description = "Generate and download an e-ticket for a specific booking")
    public void downloadETicket(
            @PathVariable Long bookingId,
            HttpServletResponse response) throws IOException {

        Booking booking = bookingService.getBookingById(bookingId);
        byte[] pdfContent = pdfGenerationService.generateETicket(booking);

        response.setContentType(MediaType.APPLICATION_PDF_VALUE);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=e-ticket-" + bookingId + ".pdf");
        response.setContentLength(pdfContent.length);

        response.getOutputStream().write(pdfContent);
        response.getOutputStream().flush();
    }

    @GetMapping("/{bookingId}/receipt")
    @Operation(summary = "Download receipt",
            description = "Generate and download a receipt for a specific booking")
    public void downloadReceipt(
            @PathVariable Long bookingId,
            HttpServletResponse response) throws IOException {

        Booking booking = bookingService.getBookingById(bookingId);
        byte[] pdfContent = pdfGenerationService.generateReceipt(booking);

        response.setContentType(MediaType.APPLICATION_PDF_VALUE);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=receipt-" + bookingId + ".pdf");
        response.setContentLength(pdfContent.length);

        response.getOutputStream().write(pdfContent);
        response.getOutputStream().flush();
    }
}