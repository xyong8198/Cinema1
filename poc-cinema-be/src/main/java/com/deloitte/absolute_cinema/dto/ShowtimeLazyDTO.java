package com.deloitte.absolute_cinema.dto;

import com.deloitte.absolute_cinema.entity.Cinema;
import com.deloitte.absolute_cinema.entity.Movie;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ShowtimeLazyDTO {
    private Long id;
    private String movieTitle;
    private String cinemaName;
    private LocalDateTime screeningTime;
    private int hall;

}

