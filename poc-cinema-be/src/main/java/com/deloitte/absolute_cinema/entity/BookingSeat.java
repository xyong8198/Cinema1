package com.deloitte.absolute_cinema.entity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_seats")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class BookingSeat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingSeatId;
    @ManyToOne
    @JsonBackReference
    private Booking booking;
    @ManyToOne
    private Seat seat;
}