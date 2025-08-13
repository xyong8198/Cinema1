package com.deloitte.absolute_cinema.repository;
import com.deloitte.absolute_cinema.entity.Movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByTitle(String title);

    boolean existsByTitle(String title);
    
    List<Movie> findByGenreContainingIgnoreCase(String genre);
    List<Movie> findByLanguageContainingIgnoreCase(String language);
    List<Movie> findByReviewBetween(Double minReview, Double maxReview);
    
    @Query("SELECT DISTINCT m.genre FROM Movie m WHERE m.genre IS NOT NULL ORDER BY m.genre")
    List<String> findDistinctGenres();
    
    @Query("SELECT DISTINCT m.language FROM Movie m WHERE m.language IS NOT NULL ORDER BY m.language")
    List<String> findDistinctLanguages();
}
