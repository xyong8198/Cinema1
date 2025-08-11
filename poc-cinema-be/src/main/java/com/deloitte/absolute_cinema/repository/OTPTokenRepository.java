package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.OTPToken;
import com.deloitte.absolute_cinema.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OTPTokenRepository extends JpaRepository<OTPToken, Long> {
    Optional<OTPToken> findByUserAndOtp(User user, String otp);
    Optional<OTPToken> findByUser(User user);}

