package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.MovieReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface MovieReviewRepository extends JpaRepository<MovieReview, Long> {
    Optional<MovieReview> findByMovieId(Long movieId);

    @Query(value = "SELECT r.review_json FROM movie_reviews r WHERE r.movie_id = :movieId", nativeQuery = true)
    Optional<String> findReviewJsonByMovieId(@Param("movieId") Long movieId);

    @Query(value = "SELECT r.review_json FROM movie_reviews r WHERE r.title = :movieTitle", nativeQuery = true)
    Optional<String> findReviewJsonByMovieTitle(@Param("movieTitle") String movieTitle);

    @Modifying
    @Query(value = "INSERT INTO movie_reviews (movie_id, title, review_json, last_updated) " +
            "VALUES (:movieId, :title, :reviewJson, :lastUpdated) " +
            "ON CONFLICT (movie_id) DO UPDATE " +
            "SET title = EXCLUDED.title, review_json = EXCLUDED.review_json, last_updated = EXCLUDED.last_updated",
            nativeQuery = true)
    void saveReview(
            @Param("movieId") Long movieId,
            @Param("title") String title,
            @Param("reviewJson") String reviewJson,
            @Param("lastUpdated") LocalDateTime lastUpdated);
}
