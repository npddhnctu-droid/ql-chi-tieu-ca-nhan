"use client";

import { useState } from "react";
import { upsertBudget } from "../actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, PiggyBank, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";

const CategoryIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent className={className} style={style} />;
};

interface BudgetsClientProps {
  categories: any[];
  initialTransactions: any[];
  initialBudgets: any[];
}

export default function BudgetsClient({
  categories,
  initialTransactions,
  initialBudgets,
}: BudgetsClientProps) {
  const [budgets, setBudgets] = useState<any[]>(initialBudgets);
  const [transactions] = useState<any[]>(initialTransactions);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  
  // State for tracking inline input changes
  const [inputValues, setInputValues] = useState<{ [categoryId: string]: string }>({});
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Only expense categories can have budgets
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Get spent transactions for the selected month
  const selectedMonthExpenses = transactions.filter((t) => {
    return t.type === "expense" && t.transaction_date.startsWith(selectedMonth);
  });

  const handleSaveBudget = async (categoryId: string) => {
    const value = inputValues[categoryId];
    if (value === undefined || value === "") {
      toast.error("Vui lòng nhập số tiền ngân sách");
      return;
    }

    const numericVal = Number(value);
    if (isNaN(numericVal) || numericVal < 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoadingCategory(categoryId);
    try {
      const updatedBudget = await upsertBudget({
        category_id: categoryId,
        amount: numericVal,
        month_year: selectedMonth,
      });

      // Update state
      const existingIdx = budgets.findIndex(
        (b) => b.category_id === categoryId && b.month_year === selectedMonth
      );

      if (existingIdx > -1) {
        const nextBudgets = [...budgets];
        nextBudgets[existingIdx] = {
          ...nextBudgets[existingIdx],
          amount: numericVal,
        };
        setBudgets(nextBudgets);
      } else {
        setBudgets([
          ...budgets,
          {
            ...updatedBudget,
            categories: categories.find((c) => c.id === categoryId),
          },
        ]);
      }

      toast.success("Cập nhật ngân sách thành công!");
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    } finally {
      setLoadingCategory(null);
    }
  };

  // Generate distinct month list for the last 6 months to choose from
  const monthOptions = [];
  const currentDate = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("vi-VN", { month: "long", year: "numeric" });
    monthOptions.push({ key, label });
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <Card className="bg-card/50 backdrop-blur-md border-border/80">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-sm">Chọn Tháng Ngân Sách</p>
              <p className="text-xs text-muted-foreground">Các cảnh báo sẽ dựa trên chi tiêu thực tế của tháng được chọn.</p>
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {monthOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Budgets Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {expenseCategories.map((category) => {
          // Find if there is a budget set for this category and month
          const budget = budgets.find(
            (b) => b.category_id === category.id && b.month_year === selectedMonth
          );
          const limit = budget ? Number(budget.amount) : 0;

          // Calculate spent for this category this month
          const spent = selectedMonthExpenses
            .filter((t) => t.category_id === category.id)
            .reduce((sum, t) => sum + Number(t.amount), 0);

          const percent = limit > 0 ? (spent / limit) * 100 : 0;
          const isWarning = percent >= 80 && percent < 100;
          const isDanger = percent >= 100;

          // Initialize input value state if not set
          const currentInputVal = inputValues[category.id] !== undefined
            ? inputValues[category.id]
            : (limit > 0 ? limit.toString() : "");

          return (
            <Card key={category.id} className="bg-card/50 backdrop-blur-md border-border/80 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <CategoryIcon
                        name={category.icon || "help-circle"}
                        className="w-4.5 h-4.5"
                        style={{ color: category.color }}
                      />
                    </div>
                    <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                  </div>

                  <div>
                    {limit === 0 ? (
                      <Badge variant="secondary" className="bg-slate-500/10 text-slate-400 border border-slate-500/20">Chưa thiết lập</Badge>
                    ) : isDanger ? (
                      <Badge variant="destructive" className="bg-red-500/15 text-red-500 border border-red-500/20 animate-pulse">Vượt hạn mức</Badge>
                    ) : isWarning ? (
                      <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/20">Cận hạn mức</Badge>
                    ) : (
                      <Badge className="bg-green-500/15 text-green-500 border border-green-500/20">An toàn</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Visual status */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Đã tiêu: <strong className="text-foreground font-semibold">{formatVND(spent)}</strong></span>
                    {limit > 0 ? (
                      <span>Hạn mức: <strong className="text-foreground font-semibold">{formatVND(limit)}</strong></span>
                    ) : (
                      <span>Hạn mức: <strong className="text-foreground font-semibold">--</strong></span>
                    )}
                  </div>
                  
                  {limit > 0 ? (
                    <div className="space-y-1">
                      <div className="w-full bg-accent h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{percent.toFixed(1)}% đã sử dụng</span>
                        <span>Còn lại: {formatVND(Math.max(limit - spent, 0))}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-accent h-2 rounded-full opacity-30" />
                  )}
                </div>

                {/* Edit Budget input */}
                <div className="pt-2 border-t border-border/40 flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`budget-${category.id}`} className="text-xs font-semibold">Cập nhật hạn mức ngân sách</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-medium">đ</span>
                      <Input
                        id={`budget-${category.id}`}
                        type="number"
                        placeholder="Nhập hạn mức..."
                        value={currentInputVal}
                        onChange={(e) =>
                          setInputValues({
                            ...inputValues,
                            [category.id]: e.target.value,
                          })
                        }
                        className="pl-7 h-9 text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-9 px-4 text-xs shrink-0"
                    onClick={() => handleSaveBudget(category.id)}
                    disabled={loadingCategory === category.id}
                  >
                    {loadingCategory === category.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    Lưu
                  </Button>
                </div>

                {/* Warning message card */}
                {limit > 0 && isDanger && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2.5 rounded-lg flex items-start gap-2 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Bạn đã tiêu vượt quá hạn mức cho danh mục này {formatVND(spent - limit)}. Hãy hạn chế chi tiêu!</span>
                  </div>
                )}
                {limit > 0 && isWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-2.5 rounded-lg flex items-start gap-2 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Chi tiêu đã chạm ngưỡng cảnh báo ({percent.toFixed(0)}%). Hãy cân nhắc trước các khoản chi sắp tới.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
