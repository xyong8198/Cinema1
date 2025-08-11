package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.dto.EditProfileDTO;
import com.deloitte.absolute_cinema.dto.RegisterRequest;
import com.deloitte.absolute_cinema.entity.*;
import com.deloitte.absolute_cinema.repository.UserRepository;
import com.deloitte.absolute_cinema.service.AuthService;
import com.deloitte.absolute_cinema.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and management")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final UserRepository userRepository;



    @Operation(summary = "Register a new user", description = "Creates a new user and returns OTP for verification.")
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Check if email or username already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Registration failed: Email already exists.");
            }

            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Registration failed: Username already exists.");
            }

            // Convert RegisterRequest to User entity
            User user = User.builder()
                    .email(request.getEmail())
                    .password(request.getPassword()) // Hash password before saving in service layer
                    .fullName(request.getFullName())
                    .username(request.getUsername())
                    .phoneNumber(request.getPhoneNumber())
                    .profilePictureUrl(request.getProfilePictureUrl())
                    .role(Role.CUSTOMER) // Default role for new users
                    .isActive(true)
                    .isVerified(false)
                    .build();

            OTPToken otpToken = authService.register(user);
            return ResponseEntity.ok(otpToken);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Registration failed: Email or Username already exists.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Register a new admin", description = "Creates a new admin and returns OTP for verification.")
    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            // Convert RegisterRequest to User entity
            User user = User.builder()
                    .email(request.getEmail())
                    .password(request.getPassword()) // Hash password before saving in service layer
                    .fullName(request.getFullName())
                    .username(request.getUsername())
                    .phoneNumber(request.getPhoneNumber())
                    .profilePictureUrl(request.getProfilePictureUrl())
                    .role(Role.ADMIN) // Default role for new users
                    .isActive(true)
                    .isVerified(false)
                    .build();

            OTPToken otpToken = authService.register(user);
            return ResponseEntity.ok(otpToken);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Registration failed: Email or Username already exists.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }


    @Operation(summary = "User login", description = "Authenticates user and returns a login token.")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        try {
            String token = authService.login(email, password);
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Generate OTP for Account Verification", description = "Generates OTP for user to verify its account to login, else user will not be able to login.")
    @PostMapping("/generate-otp")
    public ResponseEntity<String> generateOtp(@RequestParam String email, @RequestParam String password) {
        try {
            String otp = String.valueOf((authService.generateOtp(email, password).getOtp()));
            return ResponseEntity.ok("OTP generated successfully: " + otp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP generation failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Verify OTP for Account Verification", description = "Verifies the user's account to login.")
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOTP(@RequestParam String email, @RequestParam String otp) {
        try {
            String result = authService.verifyOTP(email, otp);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP verification failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Generate OTP for password reset token", description = "Generates OTP for password reset token.")
    @PostMapping("/otp-password-reset-token")
    public ResponseEntity<?> generateOtpForResetPasswordToken(@RequestParam String email) {
        try {
            String OTP = authService.generateOtpForResetPasswordToken(email);
            return ResponseEntity.ok(OTP);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request for OTP for password reset failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Verify OTP and get password reset token", description = "Verifies the OTP and provides the reset token.")
    @PostMapping("/verify-password-reset-otp")
    public ResponseEntity<?> verifyOtpAndGetResetToken(@RequestParam String email, @RequestParam String otp) {
        try {
            String resetToken = authService.verifyOtpAndGetResetToken(email, otp);
            return ResponseEntity.ok(resetToken);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP verification failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Reset password with token", description = "Resets the user's password using a valid reset token.")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
                                        @RequestParam String email,
                                        @RequestParam String token,
                                        @RequestParam String newPassword) {
        try {
            String response = authService.resetPassword(email, token, newPassword);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) { // Handle validation errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reset password failed: " + e.getMessage());
        } catch (RuntimeException e) { // Handle expired/invalid token or other errors
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reset password failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Update User Details", description = "Allows users to update their profile information.")
    @PutMapping("/update")
    public ResponseEntity<User> updateUser(@RequestParam Long id, @RequestBody EditProfileDTO editProfileDTO) {
        User updatedUser = authService.updateUserDetails(id, editProfileDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Get User Details", description = "Retrieves user details based on the user token.")
    @GetMapping("/user")
    public ResponseEntity<User> getUserById(HttpServletRequest request) {
        try {
            String token = userService.extractBearerToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            User user = userService.getUserIdFromToken(token);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Global Exception Handler for Validation Errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}