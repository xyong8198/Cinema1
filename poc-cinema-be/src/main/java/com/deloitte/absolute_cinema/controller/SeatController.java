package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.dto.SeatSelectionDTO;
import com.deloitte.absolute_cinema.entity.Seat;
import com.deloitte.absolute_cinema.service.SeatService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@SecurityRequirement(name = "Bearer Authentication")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

//    @GetMapping("/{showtimeId}")
//    public ResponseEntity<List<Seat>> getAvailableSeats(@PathVariable Long showtimeId) {
//        List<Seat> availableSeats = seatService.getAvailableSeats(showtimeId);
//        return ResponseEntity.ok(availableSeats);
//    }

    @GetMapping("/{showtimeId}")
    public ResponseEntity<List<Seat>> getAllSeats(@PathVariable Long showtimeId) {
        List<Seat> availableSeats = seatService.getAllSeats(showtimeId);
        return ResponseEntity.ok(availableSeats);
    }

    @PostMapping("/select")
    public ResponseEntity<?> selectSeats(@RequestBody SeatSelectionDTO request) {
        try {
            List<Seat> selectedSeats = seatService.selectSeats(request.getSeatIds());
            return ResponseEntity.ok(selectedSeats);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/release/{showtimeId}")
    public ResponseEntity<String> releaseSeats(@PathVariable Long showtimeId) {
        seatService.releaseUnconfirmedSeats(showtimeId);
        return ResponseEntity.ok("Unconfirmed seats released");
    }
}
