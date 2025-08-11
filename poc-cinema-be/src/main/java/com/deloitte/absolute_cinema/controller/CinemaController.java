package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.entity.Cinema;
import com.deloitte.absolute_cinema.repository.CinemaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cinemas")
@Tag(name = "Cinema Controller", description = "Endpoints for managing cinemas")
public class CinemaController {

    private final CinemaRepository cinemaRepository;

    public CinemaController(CinemaRepository cinemaRepository) {
        this.cinemaRepository = cinemaRepository;
    }

    @GetMapping
    @Operation(summary = "Get all cinemas", description = "Returns a list of all cinemas available in the database")
    public List<Cinema> getAllCinemas() {
        return cinemaRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get cinema by ID", description = "Fetches a cinema using its unique ID")
    public ResponseEntity<Cinema> getCinemaById(@PathVariable Long id) {
        Optional<Cinema> cinema = cinemaRepository.findById(id);
        return cinema.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
