package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long Id);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING'")
    List<Booking> findAllActiveBookings();
}
