package com.seedsanskriti;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Main Service - owns Authentication, Users, Customers, Suppliers, Products,
 * Categories, Cart, Wishlist, Orders, Reviews, Delivery and Admin.
 *
 * Payment processing (Razorpay) lives in the separate payment-service and is
 * reached from here through the Feign client in the com.seedsanskriti.client
 * package - see PaymentServiceClient.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.seedsanskriti.client")
public class SeedSanskritiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SeedSanskritiApplication.class, args);
	}

}
