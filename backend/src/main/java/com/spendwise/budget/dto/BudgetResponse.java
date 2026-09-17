package com.spendwise.budget.dto;

import com.spendwise.entity.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetResponse(
        Long id,
        ExpenseCategory category,
        BigDecimal amountLimit,
        LocalDate budgetMonth,
        BigDecimal spent,
        BigDecimal remaining,
        BigDecimal percentageUsed
) {
}