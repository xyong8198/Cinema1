package com.deloitte.absolute_cinema.repository;
import com.deloitte.absolute_cinema.entity.Movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByTitle(String title);

    boolean existsByTitle(String title);
}
