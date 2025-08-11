package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.entity.Booking;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String getRecipientEmail(Booking booking) {
        if (booking.getUser() != null) {
            return booking.getUser().getEmail();
        } else if (booking.getGuest() != null) {
            return booking.getGuest().getEmail();
        } else {
            // Log an error or handle the case where neither user nor guest is set
            return null; // Or throw an exception
        }
    }

    // For /api/bookings
    public void sendBookingConfirmation(Booking booking) {
        // Get movie title
        String movieName = booking.getBookingSeats().get(0).getSeat().getShowtime().getMovie().getTitle();

        // Get show time
        String showTime = booking.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime().toString();

        // Get user email - handle both user and guest cases
        String recipientEmail = getRecipientEmail(booking);

        // Get seat numbers
        List<String> seatNumbers = booking.getBookingSeats()
                .stream()
                .map(bookingSeat -> bookingSeat.getSeat().getSeatNumber())
                .toList();

        String formattedSeats = seatNumbers.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(", "));

        String subject = "Booking Confirmation - " + booking.getId();
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>📅 Showtime:</strong> " + formatShowTime(showTime) + "</p>" +
                "<p><strong>🎥 Movie:</strong> " + movieName + "</p>" +
                "<p><strong>💺 Seats:</strong> " + formattedSeats + "</p></div>";

        String message = generateEmailTemplate("🎟️ Booking Confirmed!", "Your reservation for <strong>" + movieName + "</strong> is confirmed.", details, "View Ticket");

        sendEmail(recipientEmail, subject, message);
    }

    // For /api/bookings/{bookingId}/resend-confirmation
    public void sendReminder(Booking booking) {
        String movieName = booking.getBookingSeats().get(0).getSeat().getShowtime().getMovie().getTitle();
        String showTime = booking.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime().toString();

        String recipientEmail = getRecipientEmail(booking);

        String subject = "Reminder: Upcoming Movie - " + movieName;
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>📅 Showtime:</strong> " + formatShowTime(showTime) + "</p>" +
                "<p><strong>🎥 Movie:</strong> " + movieName + "</p></div>";

        String message = generateEmailTemplate("⏳ Movie Reminder", "Don't forget your movie <strong>" + movieName + "</strong> at " + showTime + ".", details, "View Details");

        sendEmail(recipientEmail, subject, message);
    }

    public void sendCancellationEmail(Booking booking) {
        String movieName = booking.getBookingSeats().get(0).getSeat().getShowtime().getMovie().getTitle();
        String showTime = booking.getBookingSeats().get(0).getSeat().getShowtime().getScreeningTime().toString();

        String recipientEmail = getRecipientEmail(booking);

        String subject = "Cancellation Notice: " + movieName;
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>📅 Showtime:</strong> " + formatShowTime(showTime) + "</p>" +
                "<p><strong>🎥 Movie:</strong> " + movieName + "</p></div>";

        String message = generateEmailTemplate("❌ Booking Cancelled", "Your reservation for <strong>" + movieName + "</strong> has been cancelled.", details, "Contact Support");

        sendEmail(recipientEmail, subject, message);
    }

    // Authentication Emails
    public void sendLoginNotification(String userEmail) {
        String subject = "Login Notification";
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p>If this wasn't you, please reset your password immediately.</p>";
        String message = generateEmailTemplate("Login Notification", "You have successfully logged into your account.", details, "Reset Password");

        sendEmail(userEmail, subject, message);
    }

    public void sendRegistrationOtp(String userEmail, String otp) {
        String subject = "Complete Your Registration - OTP Verification";
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>🔑 Your OTP Code:</strong> " + otp + "</p>" +
                "<p>This OTP is valid for 5 minutes.</p>" +
                "<p>If you did not register, please ignore this email.</p></div>";

        String message = generateEmailTemplate("🎉 Welcome to Absolute Cinema!",
                "To complete your registration, please verify your email using the OTP below.", details, "Verify Now");

        sendEmail(userEmail, subject, message);
    }

    public void sendPasswordResetOtp(String userEmail, String otp) {
        String subject = "Password Reset Request";
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>🔑 OTP Code:</strong> " + otp + "</p>" +
                "<p>This OTP is valid for 15 minutes.</p>" +
                "<p>If you did not request a password reset, please ignore this email.</p></div>";

        String message = generateEmailTemplate("🔄 Password Reset Request",
                "We received a request to reset your password. Use the OTP below to proceed.", details, "Reset Password");

        sendEmail(userEmail, subject, message);
    }

    public void sendOtpNotification(String userEmail, String otp) {
        String subject = "Your OTP Code";
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>🔑 OTP Code:</strong> " + otp + "</p>" +
                "<p>This code is valid for 5 minutes.</p>" +
                "<p>If you did not request this, please ignore this email.</p></div>";

        String message = generateEmailTemplate("🔐 OTP Notification",
                "Here is your One-Time Password (OTP).", details, "Use OTP");

        sendEmail(userEmail, subject, message);
    }

    public void sendPasswordResetConfirmation(String userEmail) {
        String subject = "Password Reset Successful";
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p>Your password has been successfully reset.</p>" +
                "<p>If you did not request this change, please contact our support team immediately.</p></div>";

        String message = generateEmailTemplate("✅ Password Reset Successful",
                "You can now log in with your new password.", details, "Login Now");

        sendEmail(userEmail, subject, message);
    }


    public void sendUserDetailsUpdateNotification(String userEmail) {
        String subject = "Your Account Details Have Been Updated";
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p>Your account details have been successfully updated.</p>" +
                "<p>If you did not make this change, please contact our support team immediately.</p></div>";

        String message = generateEmailTemplate("🔄 Account Update Notification",
                "Your account details have been updated successfully.", details, "View Account");

        sendEmail(userEmail, subject, message);
    }

    // Payment emails
    public void sendPaymentConfirmation(String userEmail, Long paymentId) {
        String subject = "Payment Confirmation - #" + paymentId;
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>💰 Payment ID:</strong> " + paymentId + "</p>" +
                "<p>Your payment has been successfully processed.</p>" +
                "<p>Thank you for your purchase!</p></div>";

        String message = generateEmailTemplate("💳 Payment Confirmation",
                "Your payment has been successfully processed.", details, "View Receipt");

        sendEmail(userEmail, subject, message);
    }

    public void sendRefundNotification(String userEmail, Long paymentId) {
        String subject = "Refund Processed Successfully";
        String details = "<div style='background-color: #292929; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                "<p><strong>💵 Refund ID:</strong> " + paymentId + "</p>" +
                "<p>Your refund has been successfully processed.</p>" +
                "<p>If you have any questions, please contact support.</p></div>";

        String message = generateEmailTemplate("🔄 Refund Processed",
                "Your refund has been successfully processed.", details, "Contact Support");

        sendEmail(userEmail, subject, message);
    }

    private String generateEmailTemplate(String header, String bodyMessage, String details, String buttonText) {
        return "<html><body style='font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: auto; background-color: #1e1e1e; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);'>" +
                "<div style='text-align: center; padding-bottom: 10px;'>" +
                "<img src='https://i.imgur.com/QAErof7.png' alt='Cinema Logo' style='max-width: 150px;'>" +
                "</div>" +
                "<h2 style='color: #ffcc00; text-align: center;'>" + header + "</h2>" +
                "<p style='color: #ddd; text-align: center; font-size: 18px;'>" + bodyMessage + "</p>" +
                details +
                "<p style='text-align: center; margin-top: 20px;'><a href='#' style='background-color: #ffcc00; color: #121212; padding: 10px 15px; text-decoration: none; font-weight: bold; border-radius: 5px;'>" + buttonText + "</a></p>" +
                "<p style='color: #aaa; text-align: center; margin-top: 20px; font-size: 14px;'>Enjoy your movie! 🎬</p>" +
                "<p style='color: #666; text-align: center; font-size: 12px;'>Absolute Cinema &copy; 2025</p>" +
                "</div></body></html>";
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String formatShowTime(String showTime) {
        LocalDateTime dateTime = LocalDateTime.parse(showTime);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a");
        return dateTime.format(formatter);
    }
}