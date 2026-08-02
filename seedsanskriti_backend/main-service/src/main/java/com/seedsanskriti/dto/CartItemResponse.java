package com.seedsanskriti.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemResponse {

	private Long id; 
	 private Long productId;

	    private String productName;

	    private String imageUrl;

	    private double price;

	    private Integer quantity;

	    private double subtotal;
}
