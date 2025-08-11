package com.deloitte.absolute_cinema.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SeatSelectionDTO {
    private List<Long> seatIds;
}
