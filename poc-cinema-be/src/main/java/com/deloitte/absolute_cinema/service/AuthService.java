package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.dto.EditProfileDTO;
import com.deloitte.absolute_cinema.entity.*;
import com.deloitte.absolute_cinema.repository.*;
import com.deloitte.absolute_cinema.util.JwtUtil;
import com.deloitte.absolute_cinema.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OTPTokenRepository otpTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final LoginTokenRepository loginTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    public String generateOTP() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public String generatePRToken() {
        return UUID.randomUUID().toString();
    }

    public OTPToken register(User user) {
        ValidationUtil.validateUserRegistration(user); // Apply validation

        user.setPassword(passwordEncoder.encode(user.getPassword())); // Encrypt password
        userRepository.save(user);

        String otp = generateOTP();
        OTPToken otpToken = OTPToken.builder()
                .user(user)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        otpTokenRepository.save(otpToken);
        notificationService.sendRegistrationOtp(user.getEmail(), otp);

        return otpToken;
    }

    public OTPToken generateOtp(String email, String password) {
        ValidationUtil.validateLogin(email, password); // Validate input

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        otpTokenRepository.findByUser(user).ifPresent(otpTokenRepository::delete);

        String otp = generateOTP();
        OTPToken otpToken = OTPToken.builder()
                .user(user)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        otpTokenRepository.save(otpToken);
        notificationService.sendOtpNotification(user.getEmail(), otp);
        return otpToken;
    }



    public String verifyOTP(String email, String otp) {
        ValidationUtil.validateEmail(email); // Validate email format
        ValidationUtil.validateOTP(otp); // Validate OTP format

        // Find the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retrieve OTP linked to the user
        Optional<OTPToken> otpToken = otpTokenRepository.findByUserAndOtp(user, otp);

        if (otpToken.isPresent() && otpToken.get().getExpiryTime().isAfter(LocalDateTime.now())) {
            // Mark user as verified
            user.setVerified(true);
            userRepository.save(user);

            // Delete the OTP after successful verification
            otpTokenRepository.delete(otpToken.get());

            return "OTP verified successfully.";
        }
        return "Invalid or expired OTP.";
    }


    public String login(String email, String password) {
        ValidationUtil.validateLogin(email, password); // Validate input

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure only verified users can log in
        if (!user.isVerified()) {
            throw new RuntimeException("User is not verified. Please verify your email first.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(email);

        // **DELETE EXISTING TOKEN BEFORE INSERTING A NEW ONE**
        loginTokenRepository.findByUser(user).ifPresent(loginTokenRepository::delete);

        // Store new login token in DB
        LoginToken loginToken = LoginToken.builder()
                .user(user)
                .token(token)
                .expiryTime(LocalDateTime.now().plusDays(1)) // Set expiry time
                .build();
        loginTokenRepository.save(loginToken);

        notificationService.sendLoginNotification(user.getEmail());

        return token; // Return new token
    }

    public String generateOtpForResetPasswordToken(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if an existing token exists and delete it
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        String otp = generateOTP();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .otp(otp)
                .token(generatePRToken())
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        passwordResetTokenRepository.save(resetToken);

        notificationService.sendPasswordResetOtp(user.getEmail(), otp);

        return resetToken.getOtp();
    }

    public String verifyOtpAndGetResetToken(String email, String otp) {
        ValidationUtil.validateEmail(email); // Validate email format
        ValidationUtil.validateOTP(otp); // Validate OTP format

        // Find the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retrieve PasswordResetToken linked to the user
        PasswordResetToken resetToken = passwordResetTokenRepository.findByUserAndOtp(user, otp)
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP."));

        // Check if the token is expired
        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired.");
        }

        return resetToken.getToken(); // Return only the token as a string
    }

    public String resetPassword(String email, String token, String newPassword) {
        ValidationUtil.validateEmail(email); // Validate email format

        // Find the password reset token
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        // Check if the token belongs to the provided email
        User user = resetToken.getUser();
        if (!user.getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("The provided email does not match the reset token.");
        }

        // Check if the token is expired
        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired. Please request a new one.");
        }

        // Validate new password
        ValidationUtil.validatePassword(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword)); // Encrypt new password
        userRepository.save(user);

        // Delete the used reset token
        passwordResetTokenRepository.delete(resetToken);

        notificationService.sendPasswordResetConfirmation(user.getEmail());

        return "Password reset successfully. You can now log in with your new password.";
    }

    public User updateUserDetails(Long id, EditProfileDTO editProfileDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePictureUrl(editProfileDTO.getProfilePictureUrl());

        // Validate new email (if changed)
        if (editProfileDTO.getEmail() != null && !editProfileDTO.getEmail().equals(user.getEmail())) {
            Optional<User> existingUser = userRepository.findByEmail(editProfileDTO.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                throw new RuntimeException("Email already in use.");
            }
            user.setEmail(editProfileDTO.getEmail());
        }

        // Update full name (if provided)
        if (editProfileDTO.getFullName() != null && !editProfileDTO.getFullName().isEmpty()) {
            user.setFullName(editProfileDTO.getFullName());
        }

        if (editProfileDTO.getUsername() != null && !editProfileDTO.getUsername().equals(user.getUsername())) {
            Optional<User> existingUser = userRepository.findByUsername(editProfileDTO.getUsername());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                throw new RuntimeException("Email already in use.");
            }
            user.setEmail(editProfileDTO.getEmail());
        }

        // Validate phone number (if changed)
        if (editProfileDTO.getPhoneNumber() != null && !editProfileDTO.getPhoneNumber().equals(user.getPhoneNumber())) {
            Optional<User> existingUser = userRepository.findByPhoneNumber(editProfileDTO.getPhoneNumber());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                throw new RuntimeException("Phone number already in use.");
            }
            user.setPhoneNumber(editProfileDTO.getPhoneNumber());
        }

        if (editProfileDTO.getPassword() != null && !editProfileDTO.getPassword().isEmpty()) {
            ValidationUtil.validatePassword(editProfileDTO.getPassword());
            user.setPassword(passwordEncoder.encode(editProfileDTO.getPassword()));
        }

        user.setUsername(editProfileDTO.getUsername());

        notificationService.sendUserDetailsUpdateNotification(user.getEmail());
        return userRepository.save(user);
    }



}
