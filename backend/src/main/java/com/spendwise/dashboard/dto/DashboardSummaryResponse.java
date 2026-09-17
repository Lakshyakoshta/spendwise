package com.spendwise.dashboard.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        BigDecimal totalSpent,
        BigDecimal thisMonthSpent,
        long transactionCount,
        BigDecimal averageExpense
) {
}