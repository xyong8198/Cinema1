package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.HallReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HallReservationRepository extends JpaRepository<HallReservation, Long> {
}
