package com.seedsanskriti.dto;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductRequest {

	
	 @NotNull(message = "Product name cannot be blank")
	 private String productName;

	    private String description;

	    @Positive(message = "Price must be greater than zero")
	    private double price;

	    private Integer stock;

	    private String imageUrl;
}
