package com.spendwise.budget.controller;

import com.spendwise.budget.dto.BudgetResponse;
import com.spendwise.budget.dto.CreateBudgetRequest;
import com.spendwise.budget.dto.UpdateBudgetRequest;
import com.spendwise.budget.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(
            BudgetService budgetService) {

        this.budgetService = budgetService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetResponse createBudget(
            @Valid @RequestBody CreateBudgetRequest request) {

        return budgetService.createBudget(request);
    }

    @GetMapping
    public List<BudgetResponse> getBudgets() {

        return budgetService.getBudgets();
    }

    @GetMapping("/{id}")
    public BudgetResponse getBudgetById(
            @PathVariable Long id) {

        return budgetService.getBudgetById(id);
    }

    @PutMapping("/{id}")
    public BudgetResponse updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetRequest request) {

        return budgetService.updateBudget(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBudget(
            @PathVariable Long id) {

        budgetService.deleteBudget(id);
    }
}