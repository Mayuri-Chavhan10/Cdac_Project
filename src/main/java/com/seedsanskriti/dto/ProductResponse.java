package com.seedsanskriti.dto;


import com.seedsanskriti.enums.Category;

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
public class ProductResponse {

	    private Long id;

	    private String productName;

	    private String description;

	    private double price;

	    private Integer stock;

	    private String imageUrl;

	    private Category category;

	    private String supplierName;

	    private Double averageRating;

	    private Long reviewCount;
	    
	  

	    	
}
