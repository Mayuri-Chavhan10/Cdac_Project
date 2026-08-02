package com.seedsanskriti.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RazorpayOrderRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private Long userId;

    @NotNull
    @Positive
    private Double amount;
}
