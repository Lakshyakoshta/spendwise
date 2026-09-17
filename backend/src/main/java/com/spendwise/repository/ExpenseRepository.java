package com.spendwise.repository;

import com.spendwise.entity.Expense;
import com.spendwise.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByUserId(Long userId);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.user.id = :userId
            """)
    BigDecimal sumAmountByUserId(
            @Param("userId") Long userId);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.user.id = :userId
              AND e.expenseDate >= :startDate
              AND e.expenseDate < :endDate
            """)
    BigDecimal sumAmountByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countByUserId(Long userId);

    @Query("""
            SELECT e.category, COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.user.id = :userId
            GROUP BY e.category
            ORDER BY SUM(e.amount) DESC
            """)
    List<Object[]> sumAmountByCategory(
            @Param("userId") Long userId);

    @Query("""
            SELECT
                EXTRACT(YEAR FROM e.expenseDate),
                EXTRACT(MONTH FROM e.expenseDate),
                COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.user.id = :userId
            GROUP BY
                EXTRACT(YEAR FROM e.expenseDate),
                EXTRACT(MONTH FROM e.expenseDate)
            ORDER BY
                EXTRACT(YEAR FROM e.expenseDate),
                EXTRACT(MONTH FROM e.expenseDate)
            """)
    List<Object[]> sumAmountByMonth(
            @Param("userId") Long userId);
}