package com.spendwise.entity;

import com.spendwise.user.entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "expense")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseCategory category;

    @Column(length = 500)
    private String description;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    protected Expense() {
    }

    public Expense(
            BigDecimal amount,
            ExpenseCategory category,
            String description,
            LocalDate expenseDate,
            Instant createdAt,
            User user) {

        this.amount = amount;
        this.category = category;
        this.description = description;
        this.expenseDate = expenseDate;
        this.createdAt = createdAt;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public User getUser() {
        return user;
    }

    public void update(
            BigDecimal amount,
            ExpenseCategory category,
            String description,
            LocalDate expenseDate) {

        this.amount = amount;
        this.category = category;
        this.description = description;
        this.expenseDate = expenseDate;
    }
}