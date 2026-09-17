package com.spendwise.repository;

import com.spendwise.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByUserId(Long userId);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);
}