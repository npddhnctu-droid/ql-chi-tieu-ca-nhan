import { getTransactions, getCategories, getBudgets } from "./actions";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic"; // Force dynamic rendering

export default async function Page() {
  const [categories, transactions, budgets] = await Promise.all([
    getCategories(),
    getTransactions(),
    getBudgets(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tổng Quan Tài Chính</h1>
        <p className="text-muted-foreground">
          Theo dõi thu nhập, chi tiêu, quản lý ngân sách và nhập liệu nhanh với trợ lý AI.
        </p>
      </div>

      <DashboardClient
        categories={categories}
        initialTransactions={transactions as any}
        initialBudgets={budgets as any}
      />
    </div>
  );
}
