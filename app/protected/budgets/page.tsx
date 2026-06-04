/* app/protected/budgets/page.tsx */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBudgets, getCategories, getTransactions } from "@/app/protected/actions";
import BudgetForm from "@/app/protected/budgets/BudgetForm";
import type { Budget, Category, Transaction } from "@/app/types";

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Fetch budgets, categories and transactions
  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        getBudgets(),
        getCategories(),
        getTransactions(),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
     
  }, []);

  // Alert when any budget is exceeded
  useEffect(() => {
    if (!loading && budgets.length && categories.length && transactions.length) {
      const overBudgets = categories
        .map((cat) => {
          const budget = budgets.find((b) => b.category_id === cat.id);
          if (!budget) return null;
          const monthPrefix = (budget.month_year || "").slice(0, 7); // YYYY-MM
          const used = transactions
            .filter(
              (t) =>
                t.category_id === cat.id &&
                t.type === "expense" &&
                t.transaction_date?.startsWith(monthPrefix)
            )
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          return used > (budget.amount || 0) ? { cat, used, budget } : null;
        })
        .filter(Boolean);

      if (overBudgets.length) {
        const messages = overBudgets.map(
          ({ cat, used, budget }) =>
            `⚠️ Danh mục "${cat.name}" đã vượt ngân sách: ${used.toLocaleString()}₫ / ${budget.amount.toLocaleString()}₫`
        );
        alert(messages.join("\n"));
      }
    }
  }, [loading, budgets, categories, transactions]);

  const handleSuccess = () => {
    fetchData();
    router.refresh();
    setShowForm(false);
  };

  return (
    <section className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800">Quản lý ngân sách</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 transition"
        >
          {showForm ? "Đóng form" : "Thêm ngân sách"}
        </button>
      </div>

      {showForm && <BudgetForm categories={categories} onSuccess={handleSuccess} />}

      {loading ? (
        <p className="text-gray-600 text-center">Đang tải dữ liệu…</p>
      ) : budgets.length === 0 ? (
        <p className="text-gray-600 text-center">Chưa có ngân sách nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Danh mục</th>
                <th className="border px-4 py-2 text-right">Ngân sách (₫)</th>
                <th className="border px-4 py-2 text-right">Chi tiêu đã dùng (₫)</th>
                <th className="border px-4 py-2 text-center">Còn lại (₫)</th>
                <th className="border px-4 py-2 text-center">Tháng/Năm</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: Category) => {
                const budget = budgets.find((b: Budget) => b.category_id === cat.id);
                const monthYear = budget?.month_year?.slice(0, 7) || "—";
                const used = transactions
                  .filter(
                    (t: Transaction) =>
                      t.category_id === cat.id &&
                      t.type === "expense" &&
                      t.transaction_date?.startsWith(monthYear)
                  )
                  .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);
                const remaining = (budget?.amount ?? 0) - used;
                const isOver = used > (budget?.amount ?? 0);
                return (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{cat.name}</td>
                    <td className="border px-4 py-2 text-right">
                      {budget?.amount?.toLocaleString() ?? "0"}₫
                    </td>
                    <td className={`border px-4 py-2 text-right ${isOver ? "text-red-600 font-semibold" : ""}`}>
                      {used.toLocaleString()}₫
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {remaining.toLocaleString()}₫
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {budget?.month_year ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
