"use client";

import { useState } from "react";
import { createTransaction, categorizeWithAI, deleteTransaction, updateTransaction } from "./actions";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar,
  ArrowRightLeft,
  Loader2,
  Edit2,
  Trash2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}

interface Transaction {
  id: string;
  category_id: string;
  amount: number | string;
  type: "income" | "expense";
  transaction_date: string;
  note?: string;
  categories?: Category;
}

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month_year: string;
  categories?: Category;
}

interface DashboardClientProps {
  categories: Category[];
  initialTransactions: Transaction[];
  initialBudgets: Budget[];
}

interface BudgetWarning {
  categoryName: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
  percent: number;
}

// Helper to render icon
const CategoryIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[pascalName] || 
                        (LucideIcons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[name] || 
                        LucideIcons.HelpCircle;
  return <IconComponent className={className} style={style} />;
};

export default function DashboardClient({
  categories,
  initialTransactions,
  initialBudgets,
}: DashboardClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  // State for AI input
  const [aiText, setAiText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Edit State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"expense" | "income">("expense");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Delete State
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openEditDialog = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditCategoryId(tx.category_id);
    setEditDate(tx.transaction_date.slice(0, 10));
    setEditNote(tx.note || "");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (tx: Transaction) => {
    setDeletingTx(tx);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmount || Number(editAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (!editCategoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (!editingTx) return;

    setIsEditSubmitting(true);
    try {
      const updated = await updateTransaction(editingTx.id, {
        amount: Number(editAmount),
        type: editType,
        category_id: editCategoryId,
        transaction_date: editDate,
        note: editNote,
      });

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTx.id
            ? { ...updated, categories: categories.find((c) => c.id === editCategoryId) }
            : t
        )
      );
      toast.success("Cập nhật giao dịch thành công!");
      setIsEditDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deletingTx.id);
      setTransactions((prev) => prev.filter((t) => t.id !== deletingTx.id));
      toast.success("Xóa giao dịch thành công!");
      setIsDeleteDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // State for manual input form dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Currency Formatter
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Process numbers
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Process data for Monthly Bar Chart
  const monthlyDataMap = transactions.reduce<Record<string, { name: string; thu: number; chi: number }>>((acc, t) => {
    const d = new Date(t.transaction_date);
    const monthKey = d.toLocaleString("vi-VN", { month: "short", year: "numeric" });
    if (!acc[monthKey]) {
      acc[monthKey] = { name: monthKey, thu: 0, chi: 0 };
    }
    if (t.type === "income") {
      acc[monthKey].thu += Number(t.amount);
    } else {
      acc[monthKey].chi += Number(t.amount);
    }
    return acc;
  }, {});

  const barChartData = Object.values(monthlyDataMap).reverse();

  // Process data for Pie Chart (Current Month Expenses)
  const currentMonthYear = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = transactions.filter((t) => {
    return t.type === "expense" && t.transaction_date.startsWith(currentMonthYear);
  });

  const pieDataMap = currentMonthExpenses.reduce<Record<string, { name: string; value: number; color: string }>>((acc, t) => {
    const catName = t.categories?.name || "Khác";
    const color = t.categories?.color || "#94a3b8";
    if (!acc[catName]) {
      acc[catName] = { name: catName, value: 0, color };
    }
    acc[catName].value += Number(t.amount);
    return acc;
  }, {});

  const pieChartData = Object.values(pieDataMap);

  // Budget warnings
  const budgetsForCurrentMonth = initialBudgets.filter((b) => b.month_year === currentMonthYear);
  const budgetWarnings: BudgetWarning[] = budgetsForCurrentMonth.map((budget) => {
    const catId = budget.category_id;
    const limit = Number(budget.amount);
    const spent = currentMonthExpenses
      .filter((t) => t.category_id === catId)
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    
    return {
      categoryName: budget.categories?.name || "Danh mục",
      icon: budget.categories?.icon || "help-circle",
      color: budget.categories?.color || "#ef4444",
      limit,
      spent,
      percent,
    };
  }).filter((w) => w.percent >= 80);

  // Trigger manual transaction save
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (!categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTx = await createTransaction({
        amount: Number(amount),
        type,
        category_id: categoryId,
        transaction_date: date,
        note,
      });

      setTransactions([
        {
          ...newTx,
          categories: categories.find((c) => c.id === categoryId),
        },
        ...transactions,
      ]);

      toast.success("Thêm giao dịch thành công!");
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI categorization trigger
  const handleAiCategorize = async () => {
    if (!aiText.trim()) {
      toast.error("Vui lòng nhập câu mô tả chi tiêu");
      return;
    }

    setIsAiLoading(true);
    try {
      const parsed = await categorizeWithAI(aiText);
      setAmount(parsed.amount.toString());
      setType(parsed.type);
      setCategoryId(parsed.category_id);
      setNote(parsed.note);
      setDate(new Date().toISOString().slice(0, 10));
      
      setIsDialogOpen(true);
      toast.success("Phân tích hoàn tất! Hãy kiểm tra và lưu lại.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể phân tích bằng AI";
      toast.error(`${errorMessage}. Đang chuyển sang nhập thủ công.`);
      setIsDialogOpen(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setType("expense");
    setCategoryId("");
    setDate(new Date().toISOString().slice(0, 10));
    setNote("");
  };

  return (
    <div className="space-y-6">
      {/* AI Quick Input and Main Action Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-yellow-500 shrink-0" />
          <Input
            placeholder="Ví dụ: Ăn phở 45k, Mua áo thun shopee 150k, Nhận lương 10tr..."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            className="flex-1 border-none focus-visible:ring-0 bg-transparent text-sm h-9 px-0 placeholder:text-muted-foreground/70"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAiCategorize();
            }}
          />
          <Button
            size="sm"
            onClick={handleAiCategorize}
            disabled={isAiLoading}
            className="gap-2 shrink-0 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            {isAiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Phân Tích AI</span>
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger
            render={
              <Button className="gap-2 shrink-0 py-6 h-auto text-base">
                <Plus className="h-5 w-5" />
                Thêm giao dịch
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSaveTransaction}>
              <DialogHeader>
                <DialogTitle>Thêm Giao Dịch Mới</DialogTitle>
                <DialogDescription>
                  Điền các trường bên dưới hoặc chỉnh sửa kết quả phân tích từ AI.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={type === "expense" ? "default" : "outline"}
                    className={type === "expense" ? "bg-red-500 hover:bg-red-600" : ""}
                    onClick={() => {
                      setType("expense");
                      setCategoryId("");
                    }}
                  >
                    Khoản Chi
                  </Button>
                  <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    className={type === "income" ? "bg-green-500 hover:bg-green-600" : ""}
                    onClick={() => {
                      setType("income");
                      setCategoryId("");
                    }}
                  >
                    Khoản Thu
                  </Button>
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="amount">Số tiền (đ)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9 text-lg font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Category selection */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.type === type)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: c.color }}
                              />
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date">Ngày giao dịch</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Input
                    id="note"
                    placeholder="Nhập ghi chú chi tiết..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Lưu Giao Dịch
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Warning Banners */}
      {budgetWarnings.length > 0 && (
        <div className="space-y-3">
          {budgetWarnings.map((warning, index) => (
            <div
              key={index}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-start gap-3 animate-pulse"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  Cảnh báo vượt hạn mức: {warning.categoryName}
                </p>
                <p className="text-xs text-red-400">
                  Bạn đã tiêu {formatVND(warning.spent)} / {formatVND(warning.limit)} ({warning.percent.toFixed(1)}%) ngân sách của danh mục này trong tháng này.
                </p>
                {/* Progress bar */}
                <div className="w-full bg-red-950 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(warning.percent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Thu Nhập</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatVND(totalIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">Từ đầu tháng đến nay</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Chi Tiêu</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatVND(totalExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">Chi tiêu phát sinh trong tháng</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Số Dư Hiện Tại</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-500" : "text-orange-500"}`}>
              {formatVND(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Số dư ròng thu trừ chi</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bar Chart - 2/3 width */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-md border-border/80">
          <CardHeader>
            <CardTitle>Biểu đồ Thu / Chi</CardTitle>
            <CardDescription>So sánh dòng tiền thu nhập và chi tiêu qua các tháng</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569" }}
                    labelStyle={{ color: "#ffffff" }}
                    formatter={(value) => [formatVND(Number(value)), ""]}
                  />
                  <Legend />
                  <Bar dataKey="thu" name="Thu nhập" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="chi" name="Chi tiêu" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu giao dịch để vẽ biểu đồ
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - 1/3 width */}
        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardHeader>
            <CardTitle>Cơ Cấu Chi Tiêu</CardTitle>
            <CardDescription>Chi tiêu phân bổ theo các danh mục tháng này</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            {pieChartData.length > 0 ? (
              <>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569" }}
                        labelStyle={{ color: "#ffffff" }}
                        formatter={(value) => [formatVND(Number(value)), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend list */}
                <div className="grid grid-cols-2 gap-2 text-xs overflow-y-auto max-h-24">
                  {pieChartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="truncate text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Chưa có chi tiêu trong tháng này
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions List */}
      <Card className="bg-card/50 backdrop-blur-md border-border/80">
        <CardHeader>
          <CardTitle>Giao Dịch Gần Đây</CardTitle>
          <CardDescription>Danh sách các giao dịch phát sinh gần nhất của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="divide-y divide-border">
              {transactions.slice(0, 5).map((t, index) => {
                const category = t.categories;
                return (
                  <div key={t.id || index} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${category?.color || "#94a3b8"}20` }}
                      >
                        <CategoryIcon
                          name={category?.icon || "help-circle"}
                          className="w-5 h-5"
                          style={{ color: category?.color || "#94a3b8" }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.note || category?.name || "Giao dịch"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{category?.name}</span>
                          <span>•</span>
                          <span>{new Date(t.transaction_date).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`font-bold text-sm ${t.type === "income" ? "text-green-500" : ""}`}>
                        {t.type === "income" ? "+" : "-"}
                        {formatVND(Number(t.amount))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => openEditDialog(t)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 cursor-pointer"
                          onClick={() => openDeleteDialog(t)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Bạn chưa có giao dịch nào. Hãy dùng thanh phân tích AI ở trên để nhập khoản chi tiêu đầu tiên!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Chỉnh Sửa Giao Dịch</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin chi tiết cho khoản giao dịch này.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={editType === "expense" ? "default" : "outline"}
                  className={editType === "expense" ? "bg-red-500 hover:bg-red-600" : ""}
                  onClick={() => {
                    setEditType("expense");
                    setEditCategoryId("");
                  }}
                >
                  Khoản Chi
                </Button>
                <Button
                  type="button"
                  variant={editType === "income" ? "default" : "outline"}
                  className={editType === "income" ? "bg-green-500 hover:bg-green-600" : ""}
                  onClick={() => {
                    setEditType("income");
                    setEditCategoryId("");
                  }}
                >
                  Khoản Thu
                </Button>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-amount">Số tiền (đ)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="pl-9 text-lg font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Category selection */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category">Danh mục</Label>
                <Select value={editCategoryId} onValueChange={(val) => setEditCategoryId(val || "")} required>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.type === editType)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-date">Ngày giao dịch</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {/* Note */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-note">Ghi chú</Label>
                <Input
                  id="edit-note"
                  placeholder="Nhập ghi chú..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isEditSubmitting} className="w-full">
                {isEditSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Lưu Thay Đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {deletingTx && (
            <div className="bg-muted/40 p-3 rounded-lg text-sm space-y-1 my-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span className="font-medium">{deletingTx.note || deletingTx.categories?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className={`font-bold ${deletingTx.type === "income" ? "text-green-500" : "text-red-500"}`}>
                  {deletingTx.type === "income" ? "+" : "-"}
                  {formatVND(Number(deletingTx.amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày:</span>
                <span className="font-medium">{new Date(deletingTx.transaction_date).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="flex-1 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xóa Giao Dịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
