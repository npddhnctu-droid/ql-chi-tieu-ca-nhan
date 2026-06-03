/* app/protected/transactions/page.tsx */


import React from "react";
import { getTransactions, getCategories } from "@/app/protected/actions";
import TransactionsClient from "@/app/protected/transactions/transactions-client";
import { Card, CardContent } from "@/components/ui/card";

export default async function TransactionsPage() {
  // Fetch data server‑side before rendering the client component
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <section className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800">Lịch Sử Giao Dịch</h1>
      </div>

      <Card className="bg-card/60 backdrop-blur-md border-border/80 shadow-lg">
        <CardContent className="p-4">
          {/* Client component handling filters, table, edit/delete dialogs */}
          <TransactionsClient initialTransactions={transactions} categories={categories} />
        </CardContent>
      </Card>
    </section>
  );
}
