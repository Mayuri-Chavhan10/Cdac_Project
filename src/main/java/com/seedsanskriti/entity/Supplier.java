package com.seedsanskriti.entity;

import com.seedsanskriti.enums.SupplierStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;

import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier extends BaseEntity{
	

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "gst_number", unique = true)
    private String gstNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "supplier_status")
    private SupplierStatus supplierStatus;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
