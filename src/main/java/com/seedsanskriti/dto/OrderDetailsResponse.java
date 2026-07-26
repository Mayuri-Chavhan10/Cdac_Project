package com.seedsanskriti.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.seedsanskriti.enums.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailsResponse {

    private Long orderId;

    private LocalDateTime orderDate;

    private double totalAmount;

    private OrderStatus orderStatus;

    private String shippingAddress;
    private String shippingCity;
    private String shippingPincode;
    private String contactPhone;

    private List<OrderItemResponse> items;
}