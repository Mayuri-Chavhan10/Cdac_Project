package com.seedsanskriti.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Sent by the frontend after Razorpay Checkout completes on the client side.
 * The signature is verified server-side (using the Razorpay key secret)
 * before the order/payment/delivery records are ever updated.
 */
@Getter
@Setter
public class RazorpayVerifyRequest {

    @NotNull(message = "Order Id is required")
    private Long orderId;

    @NotBlank(message = "Razorpay order id is required")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment id is required")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay signature is required")
    private String razorpaySignature;
}
