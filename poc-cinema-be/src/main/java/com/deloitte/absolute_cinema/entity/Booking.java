package com.deloitte.absolute_cinema.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Setter
@Table(name = "bookings")
@Getter
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private User user;
    @ManyToOne
    private Guest guest;
    private BigDecimal totalPrice;
    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<BookingSeat> bookingSeats;

    @Override
    public String toString() {
        return "Booking{" +
                "bookingId=" + id +
                ", user=" + (user != null ? user.getId() : "null") +
                ", guest=" + (guest != null ? guest.getId() : "null") +
                ", totalPrice=" + totalPrice +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", bookingSeats=" + (bookingSeats != null ? bookingSeats.size() : "null") +
                '}';
    }
}

