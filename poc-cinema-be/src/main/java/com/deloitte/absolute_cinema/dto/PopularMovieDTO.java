package com.deloitte.absolute_cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PopularMovieDTO {
    private Long movieId;
    private String title;
    private String director;
    private String genre;
    private String posterUrl;
    private String rating;
    private BigDecimal price;
    private Long bookingCount;
}
