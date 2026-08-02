package com.seedsanskriti.payment.entity;

import java.time.LocalDateTime;

import com.seedsanskriti.payment.enums.PaymentMethod;
import com.seedsanskriti.payment.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payment record, owned entirely by this service.
 *
 * There is deliberately NO JPA relationship to Order or User here (those
 * entities live in main-service's database, which this service must never
 * reach into directly). orderId/userId are plain foreign-key-by-value
 * columns - the boundary is enforced at the application layer instead of
 * the database layer, which is the standard trade-off when splitting a
 * monolith's single database across services.
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Previously a @OneToOne JPA relationship to Order. Order now lives in
    // main-service's database, so this is a plain id reference - uniqueness
    // is enforced with a DB unique constraint to preserve the original
    // "one payment per order" invariant.
    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    // Previously derived via payment.getOrder().getUser().getId(). Main
    // Service passes this explicitly on every call since we can no longer
    // navigate the entity graph to reach it.
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "amount", nullable = false)
    private double amount;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    // Populated only for payments made through Razorpay; null for other
    // methods (e.g. Cash on Delivery).
    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_signature", length = 512)
    private String razorpaySignature;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
