package com.seedsanskriti.dto;

import com.seedsanskriti.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

    @NotNull(message = "Order Id is required")
    private Long orderId;

    @NotNull(message = "Payment Method is required")
    private PaymentMethod paymentMethod;
}