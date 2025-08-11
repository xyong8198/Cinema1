package com.deloitte.absolute_cinema.controller;

import com.deloitte.absolute_cinema.entity.Cinema;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    @Operation(summary = "Health Check", description = "Health Check")
    public String getHealth() {
        return "Healthy";
    }
}
