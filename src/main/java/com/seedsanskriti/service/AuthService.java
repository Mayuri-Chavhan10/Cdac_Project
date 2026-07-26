package com.seedsanskriti.service;

import com.seedsanskriti.dto.ForgotPasswordRequest;
import com.seedsanskriti.dto.LoginRequest;
import com.seedsanskriti.dto.RegisiterCustomerRequest;
import com.seedsanskriti.dto.RegisterSupplierRequest;
import com.seedsanskriti.dto.ResetPasswordRequest;

public interface AuthService {
	
	
	String registerCustomer(RegisiterCustomerRequest request);
	
	String registerSupplier(RegisterSupplierRequest request);
	
	String login(LoginRequest request);

	String forgotPassword(ForgotPasswordRequest request);

	String resetPassword(ResetPasswordRequest request);
	    
	}


