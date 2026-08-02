package com.seedsanskriti.client.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RazorpayOrderInternalResponse {

    private Long orderId;
    private String razorpayOrderId;
    private long amount;
    private String currency;
    private String keyId;
}
