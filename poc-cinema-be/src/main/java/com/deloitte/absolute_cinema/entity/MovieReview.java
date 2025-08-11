package com.deloitte.absolute_cinema.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "movie_reviews")
public class MovieReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long movieId;

    // Store the movie title for reference
    @Column(nullable = false)
    private String title;

    // Store the entire JSON response
    @Column(columnDefinition = "TEXT")
    @Lob
    private String reviewJson;

    @Column(nullable = false)
    private LocalDateTime lastUpdated;
}