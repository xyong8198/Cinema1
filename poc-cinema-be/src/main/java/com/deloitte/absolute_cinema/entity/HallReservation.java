package com.deloitte.absolute_cinema.entity;

import jakarta.persistence.*;

@Entity
public class HallReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String hallName;
    private String time;
    private String username;

    public HallReservation() {
    }

    public HallReservation(String hallName, String time, String username) {
        this.hallName = hallName;
        this.time = time;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public String getHallName() {
        return hallName;
    }

    public void setHallName(String hallName) {
        this.hallName = hallName;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
