package com.seedsanskriti.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartResponse {

	private Long cartId;

    private List<CartItemResponse> items;

    private double totalAmount;
}
