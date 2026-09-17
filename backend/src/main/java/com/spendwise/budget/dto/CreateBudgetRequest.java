package com.spendwise.budget.dto;

import com.spendwise.entity.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBudgetRequest(

        @NotNull
        ExpenseCategory category,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amountLimit,

        @NotNull
        LocalDate budgetMonth
) {
}