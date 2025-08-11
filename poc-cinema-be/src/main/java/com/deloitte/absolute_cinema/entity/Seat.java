package com.deloitte.absolute_cinema.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "seats")
public class Seat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Showtime showtime;
    private String seatNumber;
    @Enumerated(EnumType.STRING)
    private SeatType seatType = SeatType.STANDARD;
    @Enumerated(EnumType.STRING)
    private SeatStatus status = SeatStatus.AVAILABLE;
    private LocalDateTime reservedAt;
}