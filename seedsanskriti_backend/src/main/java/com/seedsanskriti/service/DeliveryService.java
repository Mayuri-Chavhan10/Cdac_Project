package com.seedsanskriti.service;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.DeliveryResponse;
import com.seedsanskriti.dto.UpdateDeliveryRequest;

public interface DeliveryService {

	  DeliveryResponse trackDelivery(
	            Long orderId,
	            Authentication authentication);

	    DeliveryResponse updateDelivery(
	            UpdateDeliveryRequest request);
}