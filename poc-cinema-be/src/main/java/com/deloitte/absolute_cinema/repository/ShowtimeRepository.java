package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.Cinema;
import com.deloitte.absolute_cinema.entity.Movie;
import com.deloitte.absolute_cinema.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowtimeRepository extends JpaRepository<Showtime,Long> {
    List<Showtime> findByMovie_IdAndScreeningTimeAfter(Long movieId, LocalDateTime now);
    List<Showtime> findByCinema_IdAndScreeningTimeAfter(Long cinemaId, LocalDateTime now);

    boolean existsByMovieAndCinemaAndScreeningTime(Movie movie, Cinema cinema, LocalDateTime screeningTime);

    boolean existsByMovieAndCinema(Movie movie, Cinema cinema);

    List<Showtime> findByMovie_Id(Long movieId);

    @Query("SELECT s.id FROM Showtime s WHERE s.screeningTime >= CURRENT_TIMESTAMP")
    List<Long> findAllShowtimeIds();
}
