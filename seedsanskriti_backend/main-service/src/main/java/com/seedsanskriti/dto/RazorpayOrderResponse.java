package com.seedsanskriti.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Everything the frontend's Razorpay Checkout widget needs to open the
 * payment modal for a given order. {@code keyId} is the public Razorpay key
 * (safe to expose to the browser) - the secret never leaves the backend.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {

    private Long orderId;

    private String razorpayOrderId;

    /** Amount in the smallest currency unit (paise for INR), as required by Razorpay. */
    private long amount;

    private String currency;

    private String keyId;
}
