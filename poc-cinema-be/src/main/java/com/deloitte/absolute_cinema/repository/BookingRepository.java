package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.dto.PopularMovieDTO;
import com.deloitte.absolute_cinema.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long Id);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING'")
    List<Booking> findAllActiveBookings();

    @Query("""
        SELECT new com.deloitte.absolute_cinema.dto.PopularMovieDTO(
            m.id, m.title, m.director, m.genre, m.posterUrl, m.rating, m.price, COUNT(b.id)
        )
        FROM Booking b 
        JOIN b.bookingSeats bs 
        JOIN bs.seat s 
        JOIN s.showtime st 
        JOIN st.movie m 
        WHERE b.createdAt >= :startOfWeek AND b.createdAt < :endOfWeek 
        AND b.status = 'CONFIRMED'
        GROUP BY m.id, m.title, m.director, m.genre, m.posterUrl, m.rating, m.price
        ORDER BY COUNT(b.id) DESC
    """)
    List<PopularMovieDTO> findPopularMoviesThisWeek(@Param("startOfWeek") LocalDateTime startOfWeek, @Param("endOfWeek") LocalDateTime endOfWeek);
}
