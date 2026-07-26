package com.seedsanskriti.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisiterCustomerRequest {
	
	    @NotBlank(message = "Name is required")
	    private String name;

	    @NotBlank(message = "Email is required")
	    @Email(message = "Email must be valid")
	    private String email;

	    @NotBlank(message = "Password is required")
	    @Size(min = 8, message = "Password must be at least 8 characters")
	    private String password;

	    @NotBlank(message = "Phone number is required")
	    private String phoneNumber;

	    private String address;

	    @NotBlank(message = "City is required")
	    private String city;

	    @NotBlank(message = "Pincode is required")
	    private String pincode;

	    
	}

