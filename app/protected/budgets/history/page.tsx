"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBudgets } from "@/app/protected/actions";

export default function BudgetHistoryPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------
  // Fetch past budgets (you already have getBudgets)
  // -------------------------------------------------
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBudgets(); // returns all budgets
        setBudgets(data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  return (
    <section className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lịch sử ngân sách</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
        >
          ← Quay lại
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Đang tải dữ liệu…</p>
      ) : budgets.length === 0 ? (
        <p className="text-center text-gray-600">Không có lịch sử ngân sách.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Tháng / Năm</th>
                <th className="px-4 py-2 text-right">Ngân sách (₫)</th>
                <th className="px-4 py-2 text-right">Chi tiêu đã dùng (₫)</th>
                <th className="px-4 py-2 text-right">Còn lại (₫)</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => {
                const used = b.used ?? 0; // you may store used amount in the record
                const remaining = (b.amount ?? 0) - used;
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{b.month_year?.slice(0, 7) ?? "—"}</td>
                    <td className="border px-4 py-2 text-right">{b.amount?.toLocaleString() ?? "0"}₫</td>
                    <td className={`border px-4 py-2 text-right ${used > (b.amount ?? 0) ? "text-red-600 font-semibold" : ""}`}>
                      {used?.toLocaleString() ?? "0"}₫
                    </td>
                    <td className="border px-4 py-2 text-right">{remaining?.toLocaleString() ?? "0"}₫</td>
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
