package com.seedsanskriti.dto;

import com.seedsanskriti.enums.SupplierStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSupplierStatusRequest {

    @NotNull
    private Long supplierId;

    @NotNull
    private SupplierStatus supplierStatus;

}