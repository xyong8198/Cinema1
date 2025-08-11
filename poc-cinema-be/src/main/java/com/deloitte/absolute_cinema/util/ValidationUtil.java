package com.deloitte.absolute_cinema.util;

import com.deloitte.absolute_cinema.entity.User;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

public class ValidationUtil {

    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    public static void validateUserRegistration(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null.");
        }
        validateEmail(user.getEmail());
        validatePassword(user.getPassword()); // Ensure password meets security criteria
        if (!StringUtils.hasText(user.getFullName())) {
            throw new IllegalArgumentException("Full name cannot be empty.");
        }
    }

    public static void validateEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format.");
        }
    }

    public static void validatePassword(String password) {
        if (!StringUtils.hasText(password)) {
            throw new IllegalArgumentException("Password cannot be empty.");
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long.");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter.");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter.");
        }
        if (!password.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Password must contain at least one number.");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character (e.g., !@#$%^&*).");
        }
    }

    public static void validateOTP(String otp) {
        if (!StringUtils.hasText(otp) || otp.length() != 6) {
            throw new IllegalArgumentException("Invalid OTP format.");
        }
    }

    public static void validateLogin(String email, String password) {
        validateEmail(email);
        if (!StringUtils.hasText(password)) {
            throw new IllegalArgumentException("Password cannot be empty.");
        }
    }
}
