package com.deloitte.absolute_cinema.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingDTO {
    private Long userId;
    private double totalPrice;
    private List<Long> selectedSeatIds;
    private String guestEmail;
}
