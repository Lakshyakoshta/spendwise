package com.spendwise.service;

import com.spendwise.dto.CreateExpenseRequest;
import com.spendwise.dto.ExpenseResponse;
import com.spendwise.entity.Expense;
import com.spendwise.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

import com.spendwise.dto.UpdateExpenseRequest;
import com.spendwise.exception.ExpenseNotFoundException;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public ExpenseResponse createExpense(CreateExpenseRequest request) {

        Expense expense = new Expense(
                request.amount(),
                request.category(),
                request.description(),
                request.expenseDate(),
                Instant.now()
        );

        Expense savedExpense = expenseRepository.save(expense);

        return new ExpenseResponse(
                savedExpense.getId(),
                savedExpense.getAmount(),
                savedExpense.getCategory(),
                savedExpense.getDescription(),
                savedExpense.getExpenseDate(),
                savedExpense.getCreatedAt()
        );
    }
    public List<ExpenseResponse> getAllExpenses() {
    
        return expenseRepository.findAll()
                .stream()
                .map(expense -> new ExpenseResponse(
                        expense.getId(),
                        expense.getAmount(),
                        expense.getCategory(),
                        expense.getDescription(),
                        expense.getExpenseDate(),
                        expense.getCreatedAt()
                ))
                .toList();
    }
    
    public ExpenseResponse getExpenseById(Long id) {
    
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDescription(),
                expense.getExpenseDate(),
                expense.getCreatedAt()
        );
    }

    
    public ExpenseResponse updateExpense(
            Long id,
            UpdateExpenseRequest request
    ) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException(id));
    
        expense.setAmount(request.amount());
        expense.setCategory(request.category());
        expense.setDescription(request.description());
        expense.setExpenseDate(request.expenseDate());
    
        Expense updatedExpense = expenseRepository.save(expense);
    
        return new ExpenseResponse(
                updatedExpense.getId(),
                updatedExpense.getAmount(),
                updatedExpense.getCategory(),
                updatedExpense.getDescription(),
                updatedExpense.getExpenseDate(),
                updatedExpense.getCreatedAt()
        );
    }
    
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException(id));
    
        expenseRepository.delete(expense);
    }
}
