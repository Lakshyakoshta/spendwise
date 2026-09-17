package com.spendwise.budget.service;

import com.spendwise.budget.dto.BudgetResponse;
import com.spendwise.budget.dto.CreateBudgetRequest;
import com.spendwise.budget.dto.UpdateBudgetRequest;
import com.spendwise.budget.entity.Budget;
import com.spendwise.budget.repository.BudgetRepository;
import com.spendwise.entity.ExpenseCategory;
import com.spendwise.repository.ExpenseRepository;
import com.spendwise.user.entity.User;
import com.spendwise.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            ExpenseRepository expenseRepository,
            UserRepository userRepository) {

        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public BudgetResponse createBudget(
            CreateBudgetRequest request) {

        User user = getCurrentUser();

        LocalDate budgetMonth =
                normalizeMonth(request.budgetMonth());

        if (budgetRepository
                .existsByUserIdAndCategoryAndBudgetMonth(
                        user.getId(),
                        request.category(),
                        budgetMonth)) {

            throw new IllegalArgumentException(
                    "Budget already exists for this category and month");
        }

        Budget budget = new Budget(
                user,
                request.category(),
                request.amountLimit(),
                budgetMonth,
                Instant.now()
        );

        Budget savedBudget =
                budgetRepository.save(budget);

        return toResponse(savedBudget);
    }

    public List<BudgetResponse> getBudgets() {

        User user = getCurrentUser();

        return budgetRepository
                .findAllByUserIdOrderByBudgetMonthDescCategoryAsc(
                        user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BudgetResponse getBudgetById(Long id) {

        User user = getCurrentUser();

        Budget budget = budgetRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Budget not found"));

        return toResponse(budget);
    }

    public BudgetResponse updateBudget(
            Long id,
            UpdateBudgetRequest request) {

        User user = getCurrentUser();

        Budget budget = budgetRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Budget not found"));

        budget.update(request.amountLimit());

        Budget updatedBudget =
                budgetRepository.save(budget);

        return toResponse(updatedBudget);
    }

    public void deleteBudget(Long id) {

        User user = getCurrentUser();

        Budget budget = budgetRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Budget not found"));

        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget) {

        LocalDate startDate =
                budget.getBudgetMonth();

        LocalDate endDate =
                startDate.plusMonths(1);

        BigDecimal spent =
                expenseRepository
                        .sumAmountByUserIdAndDateRange(
                                budget.getUser().getId(),
                                startDate,
                                endDate
                        );

        /*
         * The dashboard should calculate spending
         * for the budget's specific category.
         *
         * This method currently gets the total monthly
         * spending. We'll improve this query immediately
         * below.
         */

        BigDecimal categorySpent =
                calculateCategorySpent(
                        budget.getUser().getId(),
                        budget.getCategory(),
                        startDate,
                        endDate
                );

        BigDecimal remaining =
                budget.getAmountLimit()
                        .subtract(categorySpent);

        BigDecimal percentageUsed =
                BigDecimal.ZERO;

        if (budget.getAmountLimit().compareTo(
                BigDecimal.ZERO) > 0) {

            percentageUsed =
                    categorySpent
                            .multiply(BigDecimal.valueOf(100))
                            .divide(
                                    budget.getAmountLimit(),
                                    2,
                                    RoundingMode.HALF_UP
                            );
        }

        return new BudgetResponse(
                budget.getId(),
                budget.getCategory(),
                budget.getAmountLimit(),
                budget.getBudgetMonth(),
                categorySpent,
                remaining,
                percentageUsed
        );
    }

    private BigDecimal calculateCategorySpent(
            Long userId,
            ExpenseCategory category,
            LocalDate startDate,
            LocalDate endDate) {

        return expenseRepository
                .sumAmountByUserIdAndDateRangeAndCategory(
                        userId,
                        category,
                        startDate,
                        endDate
                );
    }

    private LocalDate normalizeMonth(LocalDate date) {

        return date.withDayOfMonth(1);
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated user not found"));
    }
}