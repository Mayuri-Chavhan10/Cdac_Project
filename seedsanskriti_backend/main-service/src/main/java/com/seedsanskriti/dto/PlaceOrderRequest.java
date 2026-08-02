package com.seedsanskriti.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Optional shipping override for an order. Any field left blank falls back
 * to the customer's profile address at the time the order is placed.
 */
@Getter
@Setter
public class PlaceOrderRequest {

    private String shippingAddress;
    private String shippingCity;
    private String shippingPincode;
    private String contactPhone;
}
