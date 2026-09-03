package com.spendwise.dto;

import com.spendwise.entity.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateExpenseRequest(

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amount,

        @NotNull
        ExpenseCategory category,

        @Size(max = 500)
        String description,

        @NotNull
        LocalDate expenseDate
) {
}