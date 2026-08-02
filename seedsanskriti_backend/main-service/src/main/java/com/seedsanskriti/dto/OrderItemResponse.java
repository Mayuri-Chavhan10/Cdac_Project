package com.seedsanskriti.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
	 private Long productId;

	    private String productName;

	    private String imageUrl;

	    private Integer quantity;

	    private double price;

	    private double subtotal;
}
