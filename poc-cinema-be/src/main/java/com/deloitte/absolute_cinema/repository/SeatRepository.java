package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.Seat;
import com.deloitte.absolute_cinema.entity.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    // Find available seats for a given showtime
    List<Seat> findByShowtime_Id(Long showtimeId);

    List<Seat> findByIdIn(List<Long> seatIds);
   // Find expired reserved seats for a given showtime
    List<Seat> findByShowtime_IdAndStatusAndReservedAtBefore(Long showtimeId, SeatStatus status, LocalDateTime time);
}