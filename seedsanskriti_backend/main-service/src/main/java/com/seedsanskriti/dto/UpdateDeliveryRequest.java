package com.seedsanskriti.dto;

import java.time.LocalDate;

import com.seedsanskriti.enums.DeliveryStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDeliveryRequest {

    @NotNull
    private Long deliveryId;

    @NotBlank
    private String deliveryPartner;

    @NotBlank
    private String trackingNumber;

    @NotNull
    private LocalDate estimatedDeliveryDate;

    @NotNull
    private DeliveryStatus deliveryStatus;
}