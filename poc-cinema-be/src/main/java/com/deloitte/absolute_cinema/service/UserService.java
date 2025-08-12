package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.dto.EditProfileDTO;
import com.deloitte.absolute_cinema.entity.Movie;
import com.deloitte.absolute_cinema.entity.User;
import com.deloitte.absolute_cinema.entity.UserFavouriteMovie;
import com.deloitte.absolute_cinema.repository.MovieRepository;
import com.deloitte.absolute_cinema.repository.MovieReviewRepository;
import com.deloitte.absolute_cinema.repository.UserFavouriteMovieRepository;
import com.deloitte.absolute_cinema.repository.UserRepository;
import com.deloitte.absolute_cinema.util.JwtUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final MovieReviewRepository movieReviewRepository;
    private final MovieRepository movieRepository;

    @Autowired
    UserFavouriteMovieRepository userFavouriteMovieRepository;

    @Autowired
    public UserService(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder, MovieReviewRepository movieReviewRepository, MovieRepository movieRepository) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.movieReviewRepository = movieReviewRepository;
        this.movieRepository = movieRepository;
    }

    public User getUserIdFromToken(String token) {
        // Step 1: Extract email from JWT
        String email = jwtUtil.extractEmail(token);

        // Step 2: Return userId using email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public String extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    public User addFavouriteMovie(User user, Long movieId) {
        Optional<Movie> movieOptional = movieRepository.findById(movieId);
        if (movieOptional.isEmpty()) {
            throw new RuntimeException("Movie with ID " + movieId + " does not exist.");
        }

        boolean alreadyFavorited = user.getFavouriteMovies().stream()
                .anyMatch(fav -> fav.getMovieId().equals(movieId));

        if (!alreadyFavorited) {
            UserFavouriteMovie favouriteMovie = new UserFavouriteMovie();
            favouriteMovie.setUser(user);
            favouriteMovie.setMovieId(movieId);
            userFavouriteMovieRepository.save(favouriteMovie);
            user.getFavouriteMovies().add(favouriteMovie);
            return userRepository.save(user);
        }

        return user;
    }

    public User removeFavouriteMovie(User user, Long movieId) {
        List<UserFavouriteMovie> toRemove = user.getFavouriteMovies().stream()
                .filter(favouriteMovie -> favouriteMovie.getMovieId().equals(movieId))
                .toList();

        user.getFavouriteMovies().removeAll(toRemove);
        userFavouriteMovieRepository.deleteAll(toRemove);
        return user;
    }

    public List<Movie> getFavouriteMovies(User user) {
        List<Long> movieIds = userFavouriteMovieRepository.findByUser(user).stream()
                .map(UserFavouriteMovie::getMovieId)
                .toList();

        if (movieIds.isEmpty()) {
            return new ArrayList<>();
        }
        return movieRepository.findAllById(movieIds);
    }

    /**
     * Award loyalty points to a user based on payment amount
     * 1 point per RM1 spent (floored)
     */
    public void awardLoyaltyPoints(User user, BigDecimal paymentAmount) {
        if (user != null && paymentAmount != null) {
            int pointsToAward = paymentAmount.intValue(); // This floors the decimal automatically
            user.setMemberPoints(user.getMemberPoints() + pointsToAward);
            userRepository.save(user);
        }
    }

}
