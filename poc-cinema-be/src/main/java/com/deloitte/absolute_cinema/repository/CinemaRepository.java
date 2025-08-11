package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.Cinema;
import com.deloitte.absolute_cinema.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {
    boolean existsByName(String name);
    Optional<Cinema> findByName(String name);
}
