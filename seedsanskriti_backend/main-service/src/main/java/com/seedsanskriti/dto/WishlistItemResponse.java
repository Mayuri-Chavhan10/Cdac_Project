package com.seedsanskriti.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemResponse {

    private Long wishlistItemId;
    private Long productId;
    private String productName;
    private double price;
    private String imageUrl;
    private Integer stock;
}
