package com.spendwise.budget.entity;

import com.spendwise.entity.ExpenseCategory;
import com.spendwise.user.entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "budget",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_budget_user_category_month",
                        columnNames = {
                                "user_id",
                                "category",
                                "budget_month"
                        }
                )
        }
)
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseCategory category;

    @Column(
            name = "amount_limit",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal amountLimit;

    @Column(name = "budget_month", nullable = false)
    private LocalDate budgetMonth;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Budget() {
    }

    public Budget(
            User user,
            ExpenseCategory category,
            BigDecimal amountLimit,
            LocalDate budgetMonth,
            Instant createdAt) {

        this.user = user;
        this.category = category;
        this.amountLimit = amountLimit;
        this.budgetMonth = budgetMonth;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public BigDecimal getAmountLimit() {
        return amountLimit;
    }

    public LocalDate getBudgetMonth() {
        return budgetMonth;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void update(BigDecimal amountLimit) {
        this.amountLimit = amountLimit;
    }
}