package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.entity.Movie;
import com.deloitte.absolute_cinema.entity.User;
import com.deloitte.absolute_cinema.service.MovieService;
import com.deloitte.absolute_cinema.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavouriteController {

    @Autowired
    private UserService userService;

    @Autowired
    private MovieService movieService;

    /**
     * Add movie to favourites
     */
    @Operation(summary = "Add movie to favourites")
    @PostMapping("/add/{movieId}")
    public ResponseEntity<User> addFavouriteMovie(HttpServletRequest request, @PathVariable Long movieId) {
        try {
            String token = userService.extractBearerToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            User user = userService.getUserIdFromToken(token);
            return ResponseEntity.ok(userService.addFavouriteMovie(user, movieId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * Remove movie from favourites
     */
    @Operation(summary = "Remove movie from favourites")
    @PostMapping("/remove/{movieId}")
    public ResponseEntity<User> removeFavouriteMovie(HttpServletRequest request, @PathVariable Long movieId) {
        try {
            String token = userService.extractBearerToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            User user = userService.getUserIdFromToken(token);
            return ResponseEntity.ok(userService.removeFavouriteMovie(user, movieId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * Get user's favourite movies
     */
    @Operation(summary = "Get user's favourite movies")
    @GetMapping
    public ResponseEntity<List<Movie>> getFavouriteMovies(HttpServletRequest request) {
        try {
            String token = userService.extractBearerToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            User user = userService.getUserIdFromToken(token);
            List<Movie> favouriteMovies = userService.getFavouriteMovies(user);
            return ResponseEntity.ok(favouriteMovies);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
