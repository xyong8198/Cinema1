package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.service.HallReservationService;
import com.deloitte.absolute_cinema.entity.HallReservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hall-reservation")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class HallReservationController {
    @Autowired
    private HallReservationService hallReservationService;

    // GET /hall-reservation: get available halls from halls.txt
    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getAvailableHalls() {
        return ResponseEntity.ok(hallReservationService.getAvailableHalls());
    }

    // POST /hall-reservation/reservations: save reservation to DB
    @PostMapping("/reservations")
    public ResponseEntity<String> reserveHall(@RequestBody Map<String, String> request) {
        String hallName = request.get("hallName");
        String time = request.get("time");
        String username = request.get("username");
        hallReservationService.reserveHall(hallName, time, username);
        return ResponseEntity.ok("Reservation successful");
    }

    // GET /hall-reservation/reservations: get all reservations from DB
    @GetMapping("/reservations")
    public ResponseEntity<List<HallReservation>> getAllReservations() {
        return ResponseEntity.ok(hallReservationService.getAllReservations());
    }
}
