package com.deloitte.absolute_cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ShowtimeBookingDTO {
    Long id;
    String movieTitle;
    BigDecimal moviePrice;
    String posterUrl;
    String cinemaName;
    LocalDateTime screeningTime;
    int hall;

}
