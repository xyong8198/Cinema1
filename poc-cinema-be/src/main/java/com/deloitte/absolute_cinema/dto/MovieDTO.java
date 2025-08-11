package com.deloitte.absolute_cinema.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieDTO {
    private Long id;
    private String title;
    private String genre;
    private int duration;
    private String language;
    private String rating;
    private String description;
    private String posterUrl;
    private LocalDate releaseDate;
    private double review;
    private String director;
    private String trailerUrl;
    private BigDecimal price;
}

