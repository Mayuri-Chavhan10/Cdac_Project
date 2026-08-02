package com.seedsanskriti.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RazorpayOrderRequest {

    @NotNull(message = "Order Id is required")
    private Long orderId;
}
