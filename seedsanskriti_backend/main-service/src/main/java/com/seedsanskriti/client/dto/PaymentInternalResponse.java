package com.seedsanskriti.client.dto;

import java.time.LocalDateTime;

import com.seedsanskriti.enums.PaymentMethod;
import com.seedsanskriti.enums.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentInternalResponse {

    private Long paymentId;
    private Long orderId;
    private double amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionId;
    private LocalDateTime paymentDate;
    private String razorpayOrderId;
}
