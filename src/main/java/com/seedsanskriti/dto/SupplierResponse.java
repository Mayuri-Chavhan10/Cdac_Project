package com.seedsanskriti.dto;

import com.seedsanskriti.enums.SupplierStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierResponse {

    private Long supplierId;

    private String businessName;

    private String gstNumber;

    private String address;

    private String city;

    private SupplierStatus supplierStatus;

    private Long userId;

    private String ownerName;

    private String email;

    private String phoneNumber;
}