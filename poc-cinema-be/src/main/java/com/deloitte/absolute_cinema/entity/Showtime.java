package com.deloitte.absolute_cinema.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "showtimes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showtime {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Movie movie;
    @ManyToOne
    private Cinema cinema;
    private LocalDateTime screeningTime;
    private int totalSeats;
    private int hall;



}