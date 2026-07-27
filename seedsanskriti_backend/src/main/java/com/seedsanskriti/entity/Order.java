package com.seedsanskriti.entity;


import java.time.LocalDateTime;

import com.seedsanskriti.enums.OrderStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Shipping details are snapshotted onto the order at the time it is
    // placed, so a later change to the customer's profile address doesn't
    // retroactively change where an already-placed order is being shipped.
    @Column(name = "shipping_address", length = 255)
    private String shippingAddress;

    @Column(name = "shipping_city", length = 50)
    private String shippingCity;

    @Column(name = "shipping_pincode", length = 12)
    private String shippingPincode;

    @Column(name = "contact_phone", length = 15)
    private String contactPhone;
}

