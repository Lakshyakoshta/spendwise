import { ExpenseCategory } from "@/types/expense";

export interface Budget {
  id: number;
  category: ExpenseCategory;
  amountLimit: number;
  budgetMonth: string;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface CreateBudgetRequest {
  category: ExpenseCategory;
  amountLimit: number;
  budgetMonth: string;
}

export interface UpdateBudgetRequest {
  category: ExpenseCategory;
  amountLimit: number;
  budgetMonth: string;
}