package com.seedsanskriti.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RazorpayOrderResponse {

    private Long orderId;
    private String razorpayOrderId;
    private long amount;
    private String currency;
    private String keyId;
}
