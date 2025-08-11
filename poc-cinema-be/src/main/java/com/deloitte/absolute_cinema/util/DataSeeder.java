package com.deloitte.absolute_cinema.util;

import com.deloitte.absolute_cinema.controller.AuthController;
import com.deloitte.absolute_cinema.entity.*;
import com.deloitte.absolute_cinema.repository.*;
import com.deloitte.absolute_cinema.service.AuthService;
import com.deloitte.absolute_cinema.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.bouncycastle.asn1.pkcs.AuthenticatedSafe;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.IntStream;

@Component
public class DataSeeder implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final Random random = new Random();
    private final AuthService authService;
    private final UserRepository userRepository;

    public DataSeeder(MovieRepository movieRepository, CinemaRepository cinemaRepository,
                      ShowtimeRepository showtimeRepository, SeatRepository seatRepository,
                      AuthService authService, UserRepository userRepository) {
        this.movieRepository = movieRepository;
        this.cinemaRepository = cinemaRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        seedMovies();
        seedCinemas();
        seedShowtimes();
        seedAdmin();
    }

    private void seedAdmin() {
                User user = User.builder()
                        .email("admin@admin")
                        .password("Password123_")
                        .fullName("admin")
                        .username("admin")
                        .phoneNumber("1234")
                        .profilePictureUrl("https://tinyurl.com/3p8vu2ze")
                        .role(Role.ADMIN)
                        .isActive(true)
                        .isVerified(true)
                        .build();

                if (!userRepository.existsByEmail(user.getEmail())){
                    OTPToken otpToken = authService.register(user);
                }

    }


    private void seedMovies() {
        List<Movie> movies = Arrays.asList(
                Movie.builder()
                        .title("Interstellar")
                        .director("Christopher Nolan")  // Added director
                        .genre("Sci-Fi")
                        .duration(169)
                        .language("English")
                        .rating("PG-13")
                        .review(5.0)
                        .description("A mind-bending space exploration movie")
                        .createdAt(LocalDateTime.now())
                        .price(BigDecimal.valueOf(13))
                        .releaseDate(LocalDate.of(2014, 11, 7))
                        .posterUrl("https://shorturl.at/QnXqr")
                        .trailerUrl("https://www.youtube.com/watch?v=zSWdZVtXT7E")  // Added trailer URL
                        .build(),

                Movie.builder()
                        .title("Inception")
                        .director("Christopher Nolan")
                        .genre("Sci-Fi")
                        .duration(148)
                        .language("English")
                        .rating("PG-13")
                        .review(4.5)
                        .description("A thief who enters the dreams of others")
                        .createdAt(LocalDateTime.now())
                        .price(BigDecimal.valueOf(12.5))
                        .releaseDate(LocalDate.of(2010, 7, 16))
                        .posterUrl("https://shorturl.at/jugQI")
                        .trailerUrl("https://www.youtube.com/watch?v=YoHD9XEInc0")
                        .build(),

                Movie.builder()
                        .title("Dune")
                        .director("Denis Villeneuve")
                        .genre("Sci-Fi")
                        .duration(155)
                        .language("English")
                        .rating("PG-13")
                        .review(4.7)
                        .description("A noble family's son must navigate a dangerous desert planet")
                        .createdAt(LocalDateTime.now())
                        .price(BigDecimal.valueOf(14))
                        .releaseDate(LocalDate.of(2021, 10, 22))
                        .posterUrl("https://tinyurl.com/4dkrv9ek")
                        .trailerUrl("https://www.youtube.com/watch?v=n9xhJrPXop4")
                        .build(),

                Movie.builder()
                        .title("Dune Part 2")
                        .director("Denis Villeneuve")
                        .genre("Sci-Fi")
                        .duration(160)
                        .language("English")
                        .rating("PG-13")
                        .review(4.8)
                        .description("The continuation of Paul Atreides' journey")
                        .createdAt(LocalDateTime.now())
                        .price(BigDecimal.valueOf(15))
                        .releaseDate(LocalDate.of(2024, 3, 1))
                        .posterUrl("https://shorturl.at/NkLz1")
                        .trailerUrl("https://www.youtube.com/watch?v=Way9Dexny3w")
                        .build(),

                Movie.builder()
                        .title("Tenet")
                        .director("Christopher Nolan")
                        .genre("Sci-Fi")
                        .duration(150)
                        .language("English")
                        .rating("PG-13")
                        .review(4.3)
                        .description("A time-inverting espionage thriller")
                        .createdAt(LocalDateTime.now())
                        .price(BigDecimal.valueOf(14))
                        .releaseDate(LocalDate.of(2020, 8, 26))
                        .posterUrl("https://tinyurl.com/yrpjsfv8")
                        .trailerUrl("https://www.youtube.com/watch?v=L3pk_TBkihU")
                        .build(),

                Movie.builder()
                        .title("The Dark Knight")
                        .director("Christopher Nolan")
                        .genre("Action")
                        .duration(152)
                        .language("English")
                        .rating("PG-13")
                        .review(4.9)
                        .description("The legendary Batman faces the Joker")
                        .createdAt(LocalDateTime.now())
                        .price(BigDecimal.valueOf(13.5))
                        .releaseDate(LocalDate.of(2008, 7, 18))
                        .posterUrl("https://shorturl.at/Vv1Le")
                        .trailerUrl("https://www.youtube.com/watch?v=EXeTwQWrcwY")
                        .build()
        );

        for (Movie movie : movies) {
            if (!movieRepository.existsByTitle(movie.getTitle())) {
                movieRepository.save(movie);
            }
        }
    }


    private void seedCinemas() {
        List<Cinema> cinemas = Arrays.asList(
                Cinema.builder().name("Absolute Cinema Downtown").location("Downtown").totalScreens(10).build(),
                Cinema.builder().name("Absolute Cinema Uptown").location("Uptown").totalScreens(12).build()
        );

        for (Cinema cinema : cinemas) {
            if (!cinemaRepository.existsByName(cinema.getName())) {
                cinemaRepository.save(cinema);
            }
        }
    }

    private void seedShowtimes() {
        List<Movie> movies = movieRepository.findAll();
        List<Cinema> cinemas = cinemaRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Movie movie : movies) {
            for (Cinema cinema : cinemas) {
                int numberOfDays = random.nextInt(3) + 1; // Random number of days (1 to 3)
                for (int daysAhead = 1; daysAhead <= numberOfDays; daysAhead++) {
                    int hall = random.nextInt(cinema.getTotalScreens()) + 1; // Random hall number
                    for (int i = 0; i < 3; i++) {
                        LocalDateTime screeningTime = now.plusDays(daysAhead)
                                .withHour(10 + random.nextInt(10)) // Random hour between 10 AM and 8 PM
                                .withMinute(random.nextInt(2) * 30); // Random minute (0 or 30)
                        Showtime showtime = showtimeRepository.save(Showtime.builder()
                                .movie(movie)
                                .cinema(cinema)
                                .screeningTime(screeningTime)
                                .totalSeats(100)
                                .hall(hall)
                                .build());
                        insertSeatsForShowtime(showtime);
                    }
                }
            }
        }
    }

    private void insertSeatsForShowtime(Showtime showtime) {
        List<Seat> seats = IntStream.rangeClosed(1, 100)
                .mapToObj(i -> Seat.builder()
                        .seatNumber("S" + i)
                        .status(SeatStatus.AVAILABLE)
                        .seatType(SeatType.STANDARD)
                        .showtime(showtime)
                        .build())
                .toList();

        seatRepository.saveAll(seats);
    }
}
