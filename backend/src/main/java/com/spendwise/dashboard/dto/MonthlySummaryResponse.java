package com.spendwise.dashboard.dto;

import java.math.BigDecimal;

public record MonthlySummaryResponse(
        String month,
        BigDecimal amount
) {
}