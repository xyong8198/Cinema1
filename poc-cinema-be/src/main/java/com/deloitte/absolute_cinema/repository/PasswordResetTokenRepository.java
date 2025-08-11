package com.deloitte.absolute_cinema.repository;
import com.deloitte.absolute_cinema.entity.PasswordResetToken;
import com.deloitte.absolute_cinema.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByUserAndOtp(User user, String otp);
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);

}