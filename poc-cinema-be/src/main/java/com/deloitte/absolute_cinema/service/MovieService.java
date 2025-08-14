package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.dto.MovieDTO;
import com.deloitte.absolute_cinema.dto.PopularMovieDTO;
import com.deloitte.absolute_cinema.entity.Movie;
import com.deloitte.absolute_cinema.exception.ResourceNotFoundException;
import com.deloitte.absolute_cinema.repository.BookingRepository;
import com.deloitte.absolute_cinema.repository.MovieRepository;
import com.deloitte.absolute_cinema.repository.MovieReviewRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MovieService {
    
    private final MovieRepository movieRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    private MovieReviewRepository reviewRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RestTemplate restTemplate;

    private static final long CACHE_EXPIRY_HOURS = 24;

    private static final String REVIEW_API_URL = "https://www.omdbapi.com/?t=%s&apikey=ebddc771";

    public MovieService(MovieRepository movieRepository, BookingRepository bookingRepository) {
        this.movieRepository = movieRepository;
        this.bookingRepository = bookingRepository;
    }

    // Convert Entity to DTO
    private MovieDTO mapToDTO(Movie movie) {
        return new MovieDTO(
                movie.getId(),
                movie.getTitle(),
                movie.getGenre(),
                movie.getDuration(),
                movie.getLanguage(),
                movie.getRating(),
                movie.getDescription(),
                movie.getPosterUrl(),
                movie.getReleaseDate(),
                movie.getReview(),
                movie.getDirector(),
                movie.getTrailerUrl(),
                movie.getPrice()
        );
    }

    // Convert DTO to Entity
    private Movie mapToEntity(MovieDTO movieDTO) {
        return Movie.builder()
                .title(movieDTO.getTitle())
                .genre(movieDTO.getGenre())
                .duration(movieDTO.getDuration())
                .language(movieDTO.getLanguage())
                .rating(movieDTO.getRating())
                .description(movieDTO.getDescription())
                .posterUrl(movieDTO.getPosterUrl())
                .releaseDate(movieDTO.getReleaseDate())
                .review(movieDTO.getReview())
                .director(movieDTO.getDirector())
                .trailerUrl(movieDTO.getTrailerUrl())
                .price(movieDTO.getPrice())
                .build();
    }

    // Get all movies
    public List<MovieDTO> getAllMovies() {
        return movieRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MovieDTO> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreContainingIgnoreCase(genre)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MovieDTO> getMoviesByLanguage(String language) {
        return movieRepository.findByLanguageContainingIgnoreCase(language)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MovieDTO> getMoviesByRatingRange(String ratingRange) {
        Double[] range = parseRatingRange(ratingRange);
        return movieRepository.findByReviewBetween(range[0], range[1])
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<String> getAvailableGenres() {
        return movieRepository.findDistinctGenres();
    }
    
    public List<String> getAvailableLanguages() {
        return movieRepository.findDistinctLanguages();
    }
    
    public List<String> getAvailableRatingRanges() {
        return Arrays.asList("4.5-5.0", "4.0-4.5", "3.5-4.0", "3.0-3.5", "2.5-3.0", "2.0-2.5");
    }
    
    private Double[] parseRatingRange(String ratingRange) {
        String[] parts = ratingRange.split("-");
        return new Double[]{Double.parseDouble(parts[0]), Double.parseDouble(parts[1])};
    }

    // Get movie by ID
    public MovieDTO getMovieById(Long id) {
        return movieRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Movie with ID " + id + " not found"));
    }

    // Add a new movie
    public MovieDTO addMovie(MovieDTO movieDTO) {
        Movie savedMovie = movieRepository.save(mapToEntity(movieDTO));
        return mapToDTO(savedMovie);
    }

    // Delete a movie
    @Transactional
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Movie with ID " + id + " not found");
        }
        movieRepository.deleteById(id);
    }

    // Update a movie
    public MovieDTO updateMovie(Long id, MovieDTO movieDTO) {
        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + id));

        // Update only if the new values are provided
        if (movieDTO.getTitle() != null) existingMovie.setTitle(movieDTO.getTitle());
        if (movieDTO.getGenre() != null) existingMovie.setGenre(movieDTO.getGenre());
        if (movieDTO.getDuration() > 0) existingMovie.setDuration(movieDTO.getDuration());
        if (movieDTO.getLanguage() != null) existingMovie.setLanguage(movieDTO.getLanguage());
        if (movieDTO.getRating() != null) existingMovie.setRating(movieDTO.getRating());
        if (movieDTO.getReview() > 0) existingMovie.setReview(movieDTO.getReview());
        if (movieDTO.getDescription() != null) existingMovie.setDescription(movieDTO.getDescription());
        if (movieDTO.getPosterUrl() != null) existingMovie.setPosterUrl(movieDTO.getPosterUrl());
        if (movieDTO.getPrice() != null) existingMovie.setPrice(movieDTO.getPrice());
        if (movieDTO.getReleaseDate() != null) existingMovie.setReleaseDate(movieDTO.getReleaseDate());
        if (movieDTO.getDirector() != null) existingMovie.setDirector(movieDTO.getDirector());
        if (movieDTO.getTrailerUrl() != null) existingMovie.setTrailerUrl(movieDTO.getTrailerUrl());

        movieRepository.save(existingMovie);
        return mapToDTO(existingMovie);
    }

    /**
     * Get movie review with caching
     */
    @Transactional
    public Map<String, Object> getMovieReviewWithCache(Long movieId, String movieTitle) {
        Optional<String> cachedJsonOpt = reviewRepository.findReviewJsonByMovieTitle(movieTitle);

        if (cachedJsonOpt.isPresent() && !cachedJsonOpt.get().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readValue(cachedJsonOpt.get(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.error("Error parsing cached JSON: {}", e.getMessage());
            }
        }

        return fetchAndCacheReview(movieId, movieTitle);
    }


    /**
     * Fetch from API and update cache
     */
    @Transactional
    protected Map<String, Object> fetchAndCacheReview(Long movieId, String movieTitle) {
        try {
            String url = String.format(REVIEW_API_URL, URLEncoder.encode(movieTitle, StandardCharsets.UTF_8.toString()));
            ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
            String jsonResponse = responseEntity.getBody();

            if (jsonResponse != null && !jsonResponse.isEmpty()) {
                // Parse JSON for return value
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> responseMap = mapper.readValue(jsonResponse,
                        new TypeReference<Map<String, Object>>() {});

                log.info("Storing JSON response (length: {}): {}",
                        jsonResponse.length(),
                        jsonResponse.substring(0, Math.min(100, jsonResponse.length())) + "...");

                // Check if record exists
                Long existingId = jdbcTemplate.query(
                        "SELECT id FROM movie_reviews WHERE title = ?",
                        new Object[]{movieTitle},
                        (rs, rowNum) -> rs.getLong("id")
                ).stream().findFirst().orElse(null);

                if (existingId != null) {
                    // Update existing record
                    jdbcTemplate.update(
                            "UPDATE movie_reviews SET title = ?, review_json = ?, last_updated = ? WHERE id = ?",
                            movieTitle, jsonResponse, LocalDateTime.now(), existingId
                    );
                } else {
                    // Insert new record
                    jdbcTemplate.update(
                            "INSERT INTO movie_reviews (movie_id, title, review_json, last_updated) VALUES (?, ?, ?, ?)",
                            movieId, movieTitle, jsonResponse, LocalDateTime.now()
                    );
                }

                return responseMap;
            }
        } catch (Exception e) {
            log.error("Error fetching or caching movie review: " + e.getMessage(), e);
        }

        return new HashMap<>();
    }

    public List<PopularMovieDTO> getPopularMoviesThisWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfWeek = startOfWeek.plusWeeks(1);
        
        List<PopularMovieDTO> popularMovies = bookingRepository.findPopularMoviesThisWeek(startOfWeek, endOfWeek);
        return popularMovies.stream().limit(3).collect(Collectors.toList());
    }

}
