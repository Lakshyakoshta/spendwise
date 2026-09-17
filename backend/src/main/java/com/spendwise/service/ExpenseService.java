package com.spendwise.service;

import com.spendwise.dto.CreateExpenseRequest;
import com.spendwise.dto.ExpenseResponse;
import com.spendwise.dto.UpdateExpenseRequest;
import com.spendwise.entity.Expense;
import com.spendwise.exception.ExpenseNotFoundException;
import com.spendwise.repository.ExpenseRepository;
import com.spendwise.user.entity.User;
import com.spendwise.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

    public List<ExpenseResponse> getAllExpenses() {

        User user = getCurrentUser();

        return expenseRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
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

        Expense updatedExpense = expenseRepository.save(expense);

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

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

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