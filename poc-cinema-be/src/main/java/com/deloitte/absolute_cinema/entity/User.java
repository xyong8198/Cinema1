package com.deloitte.absolute_cinema.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private boolean isVerified = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String phoneNumber;

    @Column(unique = true)
    private String username;

    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    private Role role;  // User roles: ADMIN, CUSTOMER, STAFF

    private boolean isActive = true; // To deactivate a user if needed

    private LocalDateTime lastLoginAt; // Stores last login timestamp

    private Integer memberPoints = 0; // Loyalty points earned from bookings

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserFavouriteMovie> favouriteMovies = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
