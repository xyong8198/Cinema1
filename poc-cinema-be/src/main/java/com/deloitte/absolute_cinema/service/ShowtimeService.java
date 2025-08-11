package com.deloitte.absolute_cinema.service;


import com.deloitte.absolute_cinema.dto.ShowtimeBookingDTO;
import com.deloitte.absolute_cinema.dto.ShowtimeDTO;
import com.deloitte.absolute_cinema.dto.ShowtimeLazyDTO;
import com.deloitte.absolute_cinema.entity.Seat;
import com.deloitte.absolute_cinema.entity.SeatStatus;
import com.deloitte.absolute_cinema.entity.SeatType;
import com.deloitte.absolute_cinema.entity.Showtime;
import com.deloitte.absolute_cinema.repository.CinemaRepository;
import com.deloitte.absolute_cinema.repository.MovieRepository;
import com.deloitte.absolute_cinema.repository.SeatRepository;
import com.deloitte.absolute_cinema.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class ShowtimeService {
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;

    @Autowired
    SeatRepository seatRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository, MovieRepository movieRepository, CinemaRepository cinemaRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.cinemaRepository = cinemaRepository;
    }

    public List<ShowtimeDTO> getShowtimesByMovie(Long movieId) {
        return showtimeRepository.findByMovie_Id(movieId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ShowtimeDTO> getShowtimesByCinema(Long cinemaId) {
        return showtimeRepository.findByCinema_IdAndScreeningTimeAfter(cinemaId, LocalDateTime.now())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ShowtimeLazyDTO createShowtime(ShowtimeLazyDTO showtimeDTO) {
        Showtime showtime = new Showtime();
        showtime.setMovie(movieRepository.findByTitle(showtimeDTO.getMovieTitle())
                .orElseThrow(() -> new RuntimeException("Movie not found")));
        showtime.setCinema(cinemaRepository.findByName(showtimeDTO.getCinemaName())
                .orElseThrow(() -> new RuntimeException("Cinema not found")));
        showtime.setScreeningTime(showtimeDTO.getScreeningTime());
        showtime.setHall(showtimeDTO.getHall());

        Showtime savedShowtime = showtimeRepository.save(showtime);

        // Create seats
        List<Seat> seats = IntStream.rangeClosed(1, 100)
                .mapToObj(i -> Seat.builder()
                        .seatNumber("S" + i)
                        .status(SeatStatus.AVAILABLE)
                        .seatType(SeatType.STANDARD)
                        .showtime(showtime)
                        .build())
                .toList();

        seatRepository.saveAll(seats);

        return new ShowtimeLazyDTO(
                savedShowtime.getId(),
                savedShowtime.getMovie().getTitle(),
                savedShowtime.getCinema().getName(),
                savedShowtime.getScreeningTime(),
                savedShowtime.getHall()
        );
    }

    public ShowtimeLazyDTO updateShowtime(Long id, ShowtimeLazyDTO showtimeDTO) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        showtime.setMovie(movieRepository.findByTitle(showtimeDTO.getMovieTitle())
                .orElseThrow(() -> new RuntimeException("Movie not found")));
        showtime.setCinema(cinemaRepository.findByName(showtimeDTO.getCinemaName())
                .orElseThrow(() -> new RuntimeException("Cinema not found")));
        showtime.setScreeningTime(showtimeDTO.getScreeningTime());
        showtime.setHall(showtimeDTO.getHall());

        Showtime updatedShowtime = showtimeRepository.save(showtime);
        return new ShowtimeLazyDTO(
                updatedShowtime.getId(),
                updatedShowtime.getMovie().getTitle(),
                updatedShowtime.getCinema().getName(),
                updatedShowtime.getScreeningTime(),
                updatedShowtime.getHall()
        );
    }

    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        showtimeRepository.delete(showtime);
    }


    private ShowtimeDTO mapToDTO(Showtime showtime) {
        int threshold = (int) Math.ceil(showtime.getTotalSeats() * 0.1);

        return new ShowtimeDTO(
                showtime.getId(),
                showtime.getMovie(),
                showtime.getCinema(),
                showtime.getScreeningTime(),
                showtime.getHall()
        );
    }

    public List<ShowtimeLazyDTO> getAllShowtimes() {
        List<Showtime> showtimes = showtimeRepository.findAll();
        return showtimes.stream()
                .map(showtime -> new ShowtimeLazyDTO(
                        showtime.getId(),
                        showtime.getMovie().getTitle(),
                        showtime.getCinema().getName(),
                        showtime.getScreeningTime(),
                        showtime.getHall()
                ))
                .toList();
    }

    public ShowtimeBookingDTO getShowtimeById(Long showtimeId) {
        return showtimeRepository.findById(showtimeId)
                .map(showtime -> new ShowtimeBookingDTO(
                        showtime.getId(),
                        showtime.getMovie().getTitle(),
                        showtime.getMovie().getPrice(),
                        showtime.getMovie().getPosterUrl(),
                        showtime.getCinema().getName(),
                        showtime.getScreeningTime(),
                        showtime.getHall()
                ))
                .orElse(null);  // Returns null if showtime not found
    }

}
