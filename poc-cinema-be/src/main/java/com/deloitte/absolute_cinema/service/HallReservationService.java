package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.entity.HallReservation;
import com.deloitte.absolute_cinema.repository.HallReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HallReservationService {
    @Autowired
    private HallReservationRepository hallReservationRepository;

    private static final String HALLS_FILE = "C:/Users/xiong/Downloads/halls.txt";

    public List<Map<String, String>> getAvailableHalls() {
        List<Map<String, String>> halls = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(HALLS_FILE))) {
            String line;
            while ((line = br.readLine()) != null) {
                // Assume format: HallName,Time
                String[] parts = line.split(",");
                if (parts.length == 2) {
                    Map<String, String> hall = new HashMap<>();
                    hall.put("hallName", parts[0].trim());
                    hall.put("time", parts[1].trim());
                    halls.add(hall);
                }
            }
        } catch (IOException e) {
            // Log or handle error
        }
        return halls;
    }

    public void reserveHall(String hallName, String time, String username) {
        HallReservation reservation = new HallReservation(hallName, time, username);
        hallReservationRepository.save(reservation);
    }

    public List<HallReservation> getAllReservations() {
        return hallReservationRepository.findAll();
    }
}
