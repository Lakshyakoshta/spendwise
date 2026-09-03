package com.spendwise.dto;

import com.spendwise.entity.ExpenseCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        BigDecimal amount,
        ExpenseCategory category,
        String description,
        LocalDate expenseDate,
        Instant createdAt
) {
}