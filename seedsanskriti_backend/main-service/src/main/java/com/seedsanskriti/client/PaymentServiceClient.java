package com.seedsanskriti.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.seedsanskriti.client.dto.PaymentInternalRequest;
import com.seedsanskriti.client.dto.PaymentInternalResponse;
import com.seedsanskriti.client.dto.RazorpayOrderInternalRequest;
import com.seedsanskriti.client.dto.RazorpayOrderInternalResponse;
import com.seedsanskriti.client.dto.RazorpayVerifyInternalRequest;

/**
 * Feign client used by the Main Service to talk to the Payment Service.
 *
 * "payment-service" is the Eureka application name the payment-service
 * registers under (see its application.yml -> spring.application.name), so
 * this client is load-balanced and service-discovered rather than pointed at
 * a hardcoded host:port.
 *
 * Every call here corresponds 1:1 with one of the four integration points
 * called out in the migration plan: order placed / payment order created /
 * payment verified / payment status fetched.
 */
@FeignClient(name = "payment-service", path = "/internal/payments", configuration = com.seedsanskriti.config.FeignClientConfig.class)
public interface PaymentServiceClient {

    @PostMapping("/pay")
    PaymentInternalResponse pay(@RequestBody PaymentInternalRequest request);

    @GetMapping("/user/{userId}")
    List<PaymentInternalResponse> getPaymentsForUser(@PathVariable("userId") Long userId);

    @GetMapping("/{paymentId}")
    PaymentInternalResponse getPaymentById(@PathVariable("paymentId") Long paymentId,
                                            @RequestParam("userId") Long userId);

    @PostMapping("/razorpay/create-order")
    RazorpayOrderInternalResponse createRazorpayOrder(@RequestBody RazorpayOrderInternalRequest request);

    @PostMapping("/razorpay/verify")
    PaymentInternalResponse verifyRazorpayPayment(@RequestBody RazorpayVerifyInternalRequest request);

    @PostMapping("/order/{orderId}/refund")
    void markRefunded(@PathVariable("orderId") Long orderId);

    // ---- Admin-facing (no ownership filtering) ----

    @GetMapping
    List<PaymentInternalResponse> getAllPayments();

    @GetMapping("/admin/{paymentId}")
    PaymentInternalResponse getPaymentByIdForAdmin(@PathVariable("paymentId") Long paymentId);

    @GetMapping("/revenue")
    Double getTotalRevenue(@RequestParam("status") String status);
}
