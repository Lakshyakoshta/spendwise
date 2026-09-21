export interface DashboardSummary {
  totalSpent: number;
  thisMonthSpent: number;
  transactionCount: number;
  averageExpense: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
}

export interface MonthlySummary {
  month: string;
  amount: number;
}