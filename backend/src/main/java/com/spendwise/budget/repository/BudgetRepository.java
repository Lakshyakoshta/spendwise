package com.spendwise.budget.repository;

import com.spendwise.budget.entity.Budget;
import com.spendwise.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository
        extends JpaRepository<Budget, Long> {

    List<Budget> findAllByUserIdOrderByBudgetMonthDescCategoryAsc(
            Long userId);

    Optional<Budget> findByIdAndUserId(
            Long id,
            Long userId);

    boolean existsByUserIdAndCategoryAndBudgetMonth(
            Long userId,
            ExpenseCategory category,
            LocalDate budgetMonth);
}