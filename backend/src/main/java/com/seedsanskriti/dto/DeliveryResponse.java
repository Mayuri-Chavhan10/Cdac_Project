package com.seedsanskriti.dto;

import java.time.LocalDate;

import com.seedsanskriti.enums.DeliveryStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeliveryResponse {

    private Long deliveryId;

    private Long orderId;

    private String deliveryPartner;

    private String trackingNumber;

    private LocalDate estimatedDeliveryDate;

    private DeliveryStatus deliveryStatus;
}