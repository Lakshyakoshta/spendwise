CREATE TABLE budget (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount_limit NUMERIC(19, 2) NOT NULL,
    budget_month DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT chk_budget_amount
        CHECK (amount_limit > 0),

    CONSTRAINT uq_budget_user_category_month
        UNIQUE (user_id, category, budget_month)
);

CREATE INDEX idx_budget_user_month
    ON budget(user_id, budget_month);