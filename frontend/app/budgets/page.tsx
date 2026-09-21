"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import {
  CreateBudgetRequest,
  Budget,
  UpdateBudgetRequest,
} from "@/types/budget";
import { ExpenseCategory } from "@/types/expense";

const categories: ExpenseCategory[] = [
  "FOOD",
  "TRANSPORT",
  "SHOPPING",
  "ENTERTAINMENT",
  "BILLS",
  "HEALTH",
  "EDUCATION",
  "TRAVEL",
  "OTHER",
];

const categoryLabels: Record<ExpenseCategory, string> = {
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

function currentMonth() {
  return new Date().toISOString().slice(0, 7) + "-01";
}

const emptyForm = {
  category: "FOOD" as ExpenseCategory,
  amountLimit: "",
  budgetMonth: currentMonth(),
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);

  async function loadBudgets() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Budget[]>("/budgets");

      setBudgets(response.data);
    } catch {
      setError("Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, []);

  function openAddForm() {
    setEditingBudget(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(budget: Budget) {
    setEditingBudget(budget);

    setForm({
      category: budget.category,
      amountLimit: budget.amountLimit.toString(),
      budgetMonth: budget.budgetMonth,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingBudget(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingBudget) {
        const request: UpdateBudgetRequest = {
          category: form.category,
          amountLimit: Number(form.amountLimit),
          budgetMonth: form.budgetMonth,
        };

        await api.put(`/budgets/${editingBudget.id}`, request);
      } else {
        const request: CreateBudgetRequest = {
          category: form.category,
          amountLimit: Number(form.amountLimit),
          budgetMonth: form.budgetMonth,
        };

        await api.post("/budgets", request);
      }

      closeForm();
      await loadBudgets();
    } catch {
      setError(
        editingBudget
          ? "Failed to update budget."
          : "Failed to create budget."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/budgets/${id}`);

      await loadBudgets();
    } catch {
      setError("Failed to delete budget.");
    }
  }

  function formatCategory(category: ExpenseCategory) {
    return categoryLabels[category];
  }

  function formatMonth(date: string) {
    return new Date(`${date.slice(0, 7)}-01T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  function getProgressPercentage(budget: Budget) {
    return Math.min(Math.max(budget.percentageUsed, 0), 100);
  }

  function getProgressClass(budget: Budget) {
    if (budget.percentageUsed >= 100) {
      return "bg-red-500";
    }

    if (budget.percentageUsed >= 80) {
      return "bg-yellow-500";
    }

    return "bg-black";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="mt-1 text-gray-500">
            Set monthly spending limits by category.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Budget
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-500">
          Loading budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <h2 className="font-semibold text-gray-800">
            No budgets yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first monthly category budget.
          </p>

          <button
            onClick={openAddForm}
            className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">
                    {formatCategory(budget.category)}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatMonth(budget.budgetMonth)}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEditForm(budget)}
                    className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-500">Spent</p>
                  <p className="mt-1 text-2xl font-bold">
                    ₹{budget.spent.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Limit</p>
                  <p className="mt-1 font-semibold">
                    ₹{budget.amountLimit.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-gray-500">
                    {budget.percentageUsed.toFixed(1)}% used
                  </span>

                  <span
                    className={
                      budget.remaining >= 0
                        ? "font-medium text-gray-700"
                        : "font-medium text-red-600"
                    }
                  >
                    ₹{Math.abs(budget.remaining).toLocaleString("en-IN")}{" "}
                    {budget.remaining >= 0 ? "remaining" : "over"}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressClass(
                      budget
                    )}`}
                    style={{
                      width: `${getProgressPercentage(budget)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingBudget ? "Edit Budget" : "Add Budget"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Set a monthly spending limit.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category
                </label>

                <select
                  required
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value as ExpenseCategory,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Monthly Limit
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amountLimit}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amountLimit: event.target.value,
                    })
                  }
                  placeholder="8000"
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Month
                </label>

                <input
                  type="month"
                  required
                  value={form.budgetMonth.slice(0, 7)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      budgetMonth: `${event.target.value}-01`,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingBudget
                      ? "Update Budget"
                      : "Add Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}