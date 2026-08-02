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
public class SupplierOrderResponse {

    private Long orderId;

    private String customerName;

    private LocalDateTime orderDate;

    private double totalAmount;

    private OrderStatus orderStatus;
}