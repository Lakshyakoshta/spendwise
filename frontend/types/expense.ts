export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "BILLS"
  | "HEALTH"
  | "EDUCATION"
  | "TRAVEL"
  | "OTHER";

export interface Expense {
  id: number;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expenseDate: string;
  createdAt: string;
}

export interface ExpensePageResponse {
  content: Expense[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expenseDate: string;
}

export interface UpdateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expenseDate: string;
}