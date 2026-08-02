package com.seedsanskriti.payment.dto;

import com.seedsanskriti.payment.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

/**
 * Internal request from main-service's PaymentServiceClient. Carries a
 * trusted snapshot of the order (main-service has already validated
 * ownership/status) since this service has no direct access to Orders.
 */
@Getter
@Setter
public class PaymentRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private Long userId;

    @NotNull
    @Positive
    private Double amount;

    @NotNull
    private PaymentMethod paymentMethod;
}
