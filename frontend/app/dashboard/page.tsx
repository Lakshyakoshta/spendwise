"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/api";
import {
  CategoryBreakdown,
  DashboardSummary,
  MonthlySummary,
} from "@/types/dashboard";

const categoryLabels: Record<string, string> = {
  FOOD: "Food",
  TRANSPORT: "Transport",
  SHOPPING: "Shopping",
  ENTERTAINMENT: "Entertainment",
  BILLS: "Bills",
  HEALTH: "Health",
  EDUCATION: "Education",
  TRAVEL: "Travel",
  OTHER: "Other",
};

const chartColors = [
  "#111827",
  "#374151",
  "#4B5563",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#1F2937",
  "#52525B",
  "#71717A",
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          categoryResponse,
          monthlyResponse,
        ] = await Promise.all([
          api.get<DashboardSummary>("/dashboard/summary"),
          api.get<CategoryBreakdown[]>(
            "/dashboard/category-breakdown"
          ),
          api.get<MonthlySummary[]>(
            "/dashboard/monthly-summary"
          ),
        ]);

        setSummary(summaryResponse.data);
        setCategoryData(categoryResponse.data);
        setMonthlyData(monthlyResponse.data);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function formatCurrency(value: number) {
    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatMonth(value: string) {
    const date = new Date(`${value}-01T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }

  const pieData = categoryData.map((item) => ({
    name: categoryLabels[item.category] ?? item.category,
    value: item.amount,
  }));

  const barData = monthlyData.map((item) => ({
    month: formatMonth(item.month),
    amount: item.amount,
  }));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Here's an overview of your spending.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Spent"
          value={formatCurrency(summary?.totalSpent ?? 0)}
        />

        <SummaryCard
          title="This Month"
          value={formatCurrency(summary?.thisMonthSpent ?? 0)}
        />

        <SummaryCard
          title="Transactions"
          value={(summary?.transactionCount ?? 0).toLocaleString(
            "en-IN"
          )}
        />

        <SummaryCard
          title="Average Expense"
          value={formatCurrency(summary?.averageExpense ?? 0)}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Category chart */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold">Spending by Category</h2>
            <p className="mt-1 text-sm text-gray-500">
              Distribution of your expenses.
            </p>
          </div>

          {pieData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              No expense data available.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={2}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Spent",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      chartColors[index % chartColors.length],
                  }}
                />

                <span className="text-gray-600">
                  {item.name}
                </span>

                <span className="ml-auto font-medium">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly chart */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold">Monthly Spending</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your spending trend over time.
            </p>
          </div>

          {barData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              No monthly data available.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Spent",
                    ]}
                  />

                  <Bar
                    dataKey="amount"
                    fill="#111827"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category summary */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Category Summary</h2>
        </div>

        {categoryData.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No expenses recorded yet.
          </div>
        ) : (
          <div className="divide-y">
            {categoryData.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between px-5 py-4"
              >
                <span className="text-sm text-gray-600">
                  {categoryLabels[item.category] ?? item.category}
                </span>

                <span className="font-medium">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}