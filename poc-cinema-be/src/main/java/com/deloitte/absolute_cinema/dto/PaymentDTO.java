package com.deloitte.absolute_cinema.dto;

import com.deloitte.absolute_cinema.entity.PaymentMethod;
import com.deloitte.absolute_cinema.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentDTO(
        Long paymentId,
        Long bookingId,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        PaymentStatus status,
        LocalDateTime createdAt
) {}

