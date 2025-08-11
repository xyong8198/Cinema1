package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.entity.Seat;
import com.deloitte.absolute_cinema.entity.SeatStatus;
import com.deloitte.absolute_cinema.repository.SeatRepository;
import com.deloitte.absolute_cinema.repository.ShowtimeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;

    public SeatService(SeatRepository seatRepository, ShowtimeRepository showtimeRepository) {
        this.seatRepository = seatRepository;
        this.showtimeRepository = showtimeRepository;
    }

    public List<Seat> getAllSeats(Long showtimeId) {
        return seatRepository.findByShowtime_Id(showtimeId);
    }

    @Transactional
    public List<Seat> selectSeats(List<Long> seatIds) {
        List<Seat> seats = seatRepository.findByIdIn(seatIds);

        // Check if any seat does not exist
        List<Long> foundSeatIds = seats.stream().map(Seat::getId).toList();
        List<Long> missingSeats = seatIds.stream()
                .filter(id -> !foundSeatIds.contains(id))
                .toList();

        if (!missingSeats.isEmpty()) {
            throw new IllegalStateException("The following seats do not exist: " + missingSeats);
        }

        // Check if any seat is already booked
        List<Long> bookedSeats = seats.stream()
                .filter(seat -> seat.getStatus() == SeatStatus.BOOKED)
                .map(Seat::getId)
                .toList();

        if (!bookedSeats.isEmpty()) {
            throw new IllegalStateException("The following seats are already booked: " + bookedSeats);
        }

        // Check if any seat is already unconfirmed
        List<Long> unconfirmedSeats = seats.stream()
                .filter(seat -> seat.getStatus() == SeatStatus.UNCONFIRMED)
                .map(Seat::getId)
                .toList();

        if (!unconfirmedSeats.isEmpty()) {
            throw new IllegalStateException("The following seats are already selected and pending confirmation: " + unconfirmedSeats);
        }

        // Mark seats as UNCONFIRMED (reserved)
        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.UNCONFIRMED);
            seat.setReservedAt(LocalDateTime.now());
        }

        seatRepository.saveAll(seats);
        return seats;
    }

    @Transactional
    @Scheduled(fixedRate = 10000)
    public void releaseUnconfirmedSeatsForAllShowtimes() {
        List<Long> showtimeIds = showtimeRepository.findAllShowtimeIds();

        for (Long showtimeId : showtimeIds) {
            releaseUnconfirmedSeats(showtimeId);
        }
    }

    @Transactional
    public void releaseUnconfirmedSeats(Long showtimeId) {
        List<Seat> seats = seatRepository.findByShowtime_IdAndStatusAndReservedAtBefore(
                showtimeId, SeatStatus.UNCONFIRMED, LocalDateTime.now().minusMinutes(10)
        );

        if (!seats.isEmpty()) {
            System.out.println("SEATS NOT EMPTY");
            for (Seat seat : seats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setReservedAt(null);
                System.out.println("Released unconfirmed seats with ID: " + seat.getId() + " at " + LocalDateTime.now());
                seatRepository.saveAll(seats);
            }
        }

    }
}
