package com.spendwise.controller;

import com.spendwise.dto.CreateExpenseRequest;
import com.spendwise.dto.ExpensePageResponse;
import com.spendwise.dto.ExpenseResponse;
import com.spendwise.dto.UpdateExpenseRequest;
import com.spendwise.entity.ExpenseCategory;
import com.spendwise.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(
            ExpenseService expenseService) {

        this.expenseService = expenseService;
    }

    @PostMapping
    public ExpenseResponse createExpense(
            @Valid @RequestBody CreateExpenseRequest request) {

        return expenseService.createExpense(request);
    }

    @GetMapping
    public ExpensePageResponse getExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expenseDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) ExpenseCategory category,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateTo,
            @RequestParam(required = false) String search) {

        return expenseService.getExpenses(
                page,
                size,
                sortBy,
                sortDirection,
                category,
                dateFrom,
                dateTo,
                search
        );
    }

    @GetMapping("/{id}")
    public ExpenseResponse getExpenseById(
            @PathVariable Long id) {

        return expenseService.getExpenseById(id);
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExpenseRequest request) {

        return expenseService.updateExpense(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(
            @PathVariable Long id) {

        expenseService.deleteExpense(id);
    }
}