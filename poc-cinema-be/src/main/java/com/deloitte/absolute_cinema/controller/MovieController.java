package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.dto.MovieDTO;
import com.deloitte.absolute_cinema.service.MovieService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;
    private final RestTemplate restTemplate;
    private static final String REVIEW_API_URL = "https://www.omdbapi.com/?t=%s&apikey=ebddc771";

    public MovieController(MovieService movieService, RestTemplate restTemplate) {
        this.movieService = movieService;
        this.restTemplate = restTemplate;
    }

    // Get all movies
    @GetMapping("/all")
    public ResponseEntity<List<MovieDTO>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    // Get movie by ID
    @GetMapping("/{id}")
    public ResponseEntity<MovieDTO> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    // Add a new movie
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<MovieDTO> addMovie(@RequestBody MovieDTO movieDTO) {
        return ResponseEntity.ok(movieService.addMovie(movieDTO));
    }

    // Delete a movie
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    // Update a movie
    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<MovieDTO> updateMovie(@PathVariable Long id, @RequestBody MovieDTO movieDTO) {
        return ResponseEntity.ok(movieService.updateMovie(id, movieDTO));
    }

    // Fetch movie review from an external API
    @GetMapping("/review/byId/{id}")
    public ResponseEntity<Map<String, Object>> getMovieReview(@PathVariable Long id) {
        MovieDTO movie = movieService.getMovieById(id);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = movieService.getMovieReviewWithCache(id, movie.getTitle());
        if (response.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    // Fetch movie review by movie name
    @GetMapping("/review/byTitle/{title}")
    public ResponseEntity<Map<String, Object>> getMovieReviewByName(@PathVariable String title) {
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Generate a UUID-based ID for caching purposes
        Long generatedId = UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE;

        Map<String, Object> response = movieService.getMovieReviewWithCache(generatedId, title);
        if (response.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }
}
