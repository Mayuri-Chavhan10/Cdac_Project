package com.seedsanskriti.client.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderInternalRequest {

    private Long orderId;
    private Long userId;
    private double amount;
}
