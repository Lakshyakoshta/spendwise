"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import {
  CreateExpenseRequest,
  Expense,
  ExpenseCategory,
  ExpensePageResponse,
  UpdateExpenseRequest,
} from "@/types/expense";

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

const emptyForm = {
  amount: "",
  category: "FOOD" as ExpenseCategory,
  description: "",
  expenseDate: new Date().toISOString().split("T")[0],
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("expenseDate");
  const [sortDirection, setSortDirection] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadExpenses() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ExpensePageResponse>("/expenses", {
        params: {
          page,
          size: 10,
          search: search || undefined,
          category: category || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          sortDirection,
        },
      });

      setExpenses(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch {
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [page, category, dateFrom, dateTo, sortBy, sortDirection]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(0);
    loadExpenses();
  }

  function openAddForm() {
    setEditingExpense(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(expense: Expense) {
    setEditingExpense(expense);

    setForm({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description ?? "",
      expenseDate: expense.expenseDate,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingExpense(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingExpense) {
        const request: UpdateExpenseRequest = {
          amount: Number(form.amount),
          category: form.category,
          description: form.description || undefined,
          expenseDate: form.expenseDate,
        };

        await api.put(`/expenses/${editingExpense.id}`, request);
      } else {
        const request: CreateExpenseRequest = {
          amount: Number(form.amount),
          category: form.category,
          description: form.description || undefined,
          expenseDate: form.expenseDate,
        };

        await api.post("/expenses", request);
      }

      closeForm();
      await loadExpenses();
    } catch {
      setError(
        editingExpense
          ? "Failed to update expense."
          : "Failed to create expense."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/expenses/${id}`);

      if (expenses.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadExpenses();
      }
    } catch {
      setError("Failed to delete expense.");
    }
  }

  function formatCategory(value: ExpenseCategory) {
    return categoryLabels[value];
  }

  function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="mt-1 text-gray-500">
            Track and manage your spending.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Expense
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <form onSubmit={handleSearch}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search description..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(0);
                }}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="">All categories</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {formatCategory(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                From
              </label>

              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(0);
                }}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                To
              </label>

              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(0);
                }}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sort by
              </label>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setPage(0);
                }}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="expenseDate">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
                <option value="createdAt">Created</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Direction
              </label>

              <select
                value={sortDirection}
                onChange={(event) => {
                  setSortDirection(event.target.value);
                  setPage(0);
                }}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Apply Search
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
                setDateFrom("");
                setDateTo("");
                setSortBy("expenseDate");
                setSortDirection("desc");
                setPage(0);
              }}
              className="rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Expense table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Transactions</h2>

            <span className="text-sm text-gray-500">
              {totalElements} total
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-500">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="font-medium text-gray-700">No expenses found</p>
            <p className="mt-1 text-sm text-gray-500">
              Add an expense or change your filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm">
                        {formatDate(expense.expenseDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                          {formatCategory(expense.category)}
                        </span>
                      </td>

                      <td className="max-w-xs truncate px-5 py-4 text-sm text-gray-600">
                        {expense.description || "—"}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold">
                        ₹{expense.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(expense)}
                            className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y md:hidden">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {formatCategory(expense.category)}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(expense.expenseDate)}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {expense.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {expense.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEditForm(expense)}
                      className="rounded-md border px-3 py-1.5 text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between border-t px-5 py-4">
            <p className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingExpense ? "Edit Expense" : "Add Expense"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingExpense
                    ? "Update your expense details."
                    : "Record a new expense."}
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
                  Amount
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                  placeholder="500.00"
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                />
              </div>

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
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {formatCategory(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  maxLength={500}
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Lunch with friends"
                  className="w-full resize-none rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Date
                </label>

                <input
                  type="date"
                  required
                  value={form.expenseDate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      expenseDate: event.target.value,
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
                    : editingExpense
                      ? "Update Expense"
                      : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}