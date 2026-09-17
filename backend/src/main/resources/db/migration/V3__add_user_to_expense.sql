ALTER TABLE expense
ADD COLUMN user_id BIGINT;

UPDATE expense
SET user_id = (
    SELECT id
    FROM users
    ORDER BY id
    LIMIT 1
);

ALTER TABLE expense
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE expense
ADD CONSTRAINT fk_expense_user
FOREIGN KEY (user_id)
REFERENCES users(id);