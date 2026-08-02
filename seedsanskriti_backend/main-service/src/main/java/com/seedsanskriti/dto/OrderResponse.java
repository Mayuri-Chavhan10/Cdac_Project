package com.seedsanskriti.dto;

import java.time.LocalDateTime;

import com.seedsanskriti.enums.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

	private Long orderId;

    private LocalDateTime orderDate;

    private double totalAmount;

    private OrderStatus orderStatus;
}
