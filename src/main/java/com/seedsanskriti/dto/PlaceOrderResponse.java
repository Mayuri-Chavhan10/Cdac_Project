package com.seedsanskriti.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceOrderResponse {

	 private Long orderId;
	    private double totalAmount;
	    private String message;
}
