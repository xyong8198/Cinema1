package com.deloitte.absolute_cinema.controller;
import com.deloitte.absolute_cinema.dto.ShowtimeBookingDTO;
import com.deloitte.absolute_cinema.dto.ShowtimeDTO;
import com.deloitte.absolute_cinema.dto.ShowtimeLazyDTO;
import com.deloitte.absolute_cinema.service.ShowtimeService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@SecurityRequirement(name = "Bearer Authentication")
public class ShowtimeController {
    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping("/movies/{movieId}")
    public ResponseEntity<Object> getShowtimesByMovie(@PathVariable Long movieId) {
        try{
            List<ShowtimeDTO> showtimes = showtimeService.getShowtimesByMovie(movieId);
            if(showtimes.isEmpty()){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No showtimes found for movie with ID: " + movieId);
            }
            return ResponseEntity.ok(showtimes);
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/cinemas/{cinemaId}")
    public ResponseEntity<Object> getShowtimesByCinema(@PathVariable Long cinemaId) {
        try {
            List<ShowtimeDTO> showtimes = showtimeService.getShowtimesByCinema(cinemaId);
            if(showtimes.isEmpty()){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No showtimes found for movies in this cinema: " + cinemaId);
            }
            return ResponseEntity.ok(showtimes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Object> getAllShowtimes() {
        try {
            List<ShowtimeLazyDTO> showtimes = showtimeService.getAllShowtimes();
            if (showtimes.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No showtimes available.");
            }
            return ResponseEntity.ok(showtimes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Object> createShowtime(@RequestBody ShowtimeLazyDTO showtimeDTO) {
        try {
            ShowtimeLazyDTO createdShowtime = showtimeService.createShowtime(showtimeDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdShowtime);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShowtimeLazyDTO> updateShowtime(@PathVariable Long id, @RequestBody ShowtimeLazyDTO showtimeDTO) {
        return ResponseEntity.ok(showtimeService.updateShowtime(id, showtimeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("showtime/{showtimeId}")
    public ResponseEntity<Object> getShowtimeByShowtimeId(@PathVariable Long showtimeId) {
        try {
            ShowtimeBookingDTO showtime = showtimeService.getShowtimeById(showtimeId);
            if (showtime == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Showtime not found.");
            }
            return ResponseEntity.ok(showtime);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


}
