package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    List<BookingSeat> findByBookingId(long Id);
}
