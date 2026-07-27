package com.seedsanskriti.dto;

import com.seedsanskriti.enums.OrderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private OrderStatus orderStatus;

}