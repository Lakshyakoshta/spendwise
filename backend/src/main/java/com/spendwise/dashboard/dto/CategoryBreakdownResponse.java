package com.spendwise.dashboard.dto;

import com.spendwise.entity.ExpenseCategory;

import java.math.BigDecimal;

public record CategoryBreakdownResponse(
        ExpenseCategory category,
        BigDecimal amount
) {
}