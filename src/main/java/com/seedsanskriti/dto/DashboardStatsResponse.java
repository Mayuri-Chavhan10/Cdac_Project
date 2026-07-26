package com.seedsanskriti.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalCustomers;
    private long totalSuppliers;
    private long pendingSupplierApprovals;
    private long totalProducts;
    private long totalOrders;
    private double totalRevenue;
    private Map<String, Long> ordersByStatus;
}
