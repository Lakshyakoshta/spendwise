package com.spendwise.dashboard.service;

import com.spendwise.dashboard.dto.CategoryBreakdownResponse;
import com.spendwise.dashboard.dto.DashboardSummaryResponse;
import com.spendwise.dashboard.dto.MonthlySummaryResponse;
import com.spendwise.entity.ExpenseCategory;
import com.spendwise.repository.ExpenseRepository;
import com.spendwise.user.entity.User;
import com.spendwise.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public DashboardService(
            ExpenseRepository expenseRepository,
            UserRepository userRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public DashboardSummaryResponse getSummary() {

        User user = getCurrentUser();

        Long userId = user.getId();

        BigDecimal totalSpent =
                expenseRepository.sumAmountByUserId(userId);

        LocalDate today = LocalDate.now();

        LocalDate startOfMonth =
                today.withDayOfMonth(1);

        LocalDate startOfNextMonth =
                startOfMonth.plusMonths(1);

        BigDecimal thisMonthSpent =
                expenseRepository.sumAmountByUserIdAndDateRange(
                        userId,
                        startOfMonth,
                        startOfNextMonth
                );

        long transactionCount =
                expenseRepository.countByUserId(userId);

        BigDecimal averageExpense = BigDecimal.ZERO;

        if (transactionCount > 0) {
            averageExpense = totalSpent.divide(
                    BigDecimal.valueOf(transactionCount),
                    2,
                    RoundingMode.HALF_UP
            );
        }

        return new DashboardSummaryResponse(
                totalSpent,
                thisMonthSpent,
                transactionCount,
                averageExpense
        );
    }

    public List<CategoryBreakdownResponse> getCategoryBreakdown() {

        User user = getCurrentUser();

        return expenseRepository
                .sumAmountByCategory(user.getId())
                .stream()
                .map(row -> new CategoryBreakdownResponse(
                        (ExpenseCategory) row[0],
                        (BigDecimal) row[1]
                ))
                .toList();
    }

    public List<MonthlySummaryResponse> getMonthlySummary() {

        User user = getCurrentUser();

        return expenseRepository
                .sumAmountByMonth(user.getId())
                .stream()
                .map(row -> {

                    Number year =
                            (Number) row[0];

                    Number month =
                            (Number) row[1];

                    BigDecimal amount =
                            (BigDecimal) row[2];

                    String formattedMonth =
                            String.format(
                                    "%04d-%02d",
                                    year.intValue(),
                                    month.intValue()
                            );

                    return new MonthlySummaryResponse(
                            formattedMonth,
                            amount
                    );
                })
                .toList();
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