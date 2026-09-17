package com.spendwise.service;

import com.spendwise.dto.CreateExpenseRequest;
import com.spendwise.dto.ExpensePageResponse;
import com.spendwise.dto.ExpenseResponse;
import com.spendwise.dto.UpdateExpenseRequest;
import com.spendwise.entity.Expense;
import com.spendwise.entity.ExpenseCategory;
import com.spendwise.exception.ExpenseNotFoundException;
import com.spendwise.repository.ExpenseRepository;
import com.spendwise.user.entity.User;
import com.spendwise.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            UserRepository userRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public ExpenseResponse createExpense(CreateExpenseRequest request) {

        User user = getCurrentUser();

        Expense expense = new Expense(
                request.amount(),
                request.category(),
                request.description(),
                request.expenseDate(),
                Instant.now(),
                user
        );

        Expense savedExpense = expenseRepository.save(expense);

        return toResponse(savedExpense);
    }

    public ExpensePageResponse getExpenses(
            int page,
            int size,
            String sortBy,
            String sortDirection,
            ExpenseCategory category,
            LocalDate dateFrom,
            LocalDate dateTo,
            String search) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page must be greater than or equal to 0");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Size must be between 1 and 100");
        }

        String normalizedSortBy = normalizeSortField(sortBy);

        Sort.Direction direction =
                "asc".equalsIgnoreCase(sortDirection)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, normalizedSortBy)
        );

        User user = getCurrentUser();

        Page<Expense> expensePage =
                expenseRepository.searchExpenses(
                        user.getId(),
                        category,
                        dateFrom,
                        dateTo,
                        normalizeSearch(search),
                        pageable
                );

        List<ExpenseResponse> content =
                expensePage.getContent()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return new ExpensePageResponse(
                content,
                expensePage.getNumber(),
                expensePage.getSize(),
                expensePage.getTotalElements(),
                expensePage.getTotalPages()
        );
    }

    public ExpenseResponse getExpenseById(Long id) {

        User user = getCurrentUser();

        Expense expense = expenseRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new ExpenseNotFoundException(id));

        return toResponse(expense);
    }

    public ExpenseResponse updateExpense(
            Long id,
            UpdateExpenseRequest request) {

        User user = getCurrentUser();

        Expense expense = expenseRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new ExpenseNotFoundException(id));

        expense.update(
                request.amount(),
                request.category(),
                request.description(),
                request.expenseDate()
        );

        Expense updatedExpense =
                expenseRepository.save(expense);

        return toResponse(updatedExpense);
    }

    public void deleteExpense(Long id) {

        User user = getCurrentUser();

        Expense expense = expenseRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new ExpenseNotFoundException(id));

        expenseRepository.delete(expense);
    }

    private String normalizeSortField(String sortBy) {

        if (sortBy == null || sortBy.isBlank()) {
            return "expenseDate";
        }

        return switch (sortBy) {
            case "amount" -> "amount";
            case "category" -> "category";
            case "expenseDate" -> "expenseDate";
            case "createdAt" -> "createdAt";
            default -> throw new IllegalArgumentException(
                    "Invalid sort field: " + sortBy);
        };
    }

    private String normalizeSearch(String search) {

        if (search == null || search.isBlank()) {
            return null;
        }

        return search.trim();
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

    private ExpenseResponse toResponse(Expense expense) {

        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDescription(),
                expense.getExpenseDate(),
                expense.getCreatedAt()
        );
    }
}