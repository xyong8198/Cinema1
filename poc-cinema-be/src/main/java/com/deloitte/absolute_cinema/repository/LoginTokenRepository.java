package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.LoginToken;
import com.deloitte.absolute_cinema.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginTokenRepository extends JpaRepository<LoginToken, Long> {
    Optional<LoginToken> findByToken(String token);
    Optional<LoginToken> findByUser(User user);
}

