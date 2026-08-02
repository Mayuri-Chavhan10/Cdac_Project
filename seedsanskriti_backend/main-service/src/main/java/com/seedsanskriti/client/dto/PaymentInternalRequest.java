package com.seedsanskriti.client.dto;

import com.seedsanskriti.enums.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request sent from the Main Service to the Payment Service's internal API.
 * Carries a trusted snapshot of the order (id, owning user, amount) since the
 * Payment Service no longer has direct database access to the Orders table -
 * Main Service is the source of truth for orders and has already validated
 * that this order exists, belongs to this user, and is payable.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInternalRequest {

    private Long orderId;
    private Long userId;
    private double amount;
    private PaymentMethod paymentMethod;
}
