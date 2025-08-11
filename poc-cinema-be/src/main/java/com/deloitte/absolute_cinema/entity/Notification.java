package com.deloitte.absolute_cinema.entity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private User user;
    @ManyToOne
    private Guest guest;
    private String message;
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;
    private LocalDateTime sentAt = LocalDateTime.now();
}

enum NotificationType { BOOKING_CONFIRMATION, REMINDER }