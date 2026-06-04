"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Edit2, Trash2, Loader2, DollarSign } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteTransaction, updateTransaction } from "../actions";
import { toast } from "sonner";

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
  amount: string | number;
  type: "income" | "expense";
  transaction_date: string;
  note?: string;
  categories?: Category;
}

interface TransactionsClientProps {
  categories: Category[];
  initialTransactions: Transaction[];
}

const CategoryIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[pascalName] || 
                        (LucideIcons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[name] || 
                        LucideIcons.HelpCircle;
  return <IconComponent className={className} style={style} />;
};

export default function TransactionsClient({
  categories,
  initialTransactions,
}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("");

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"expense" | "income">("expense");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

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

  const months = Array.from(
    new Set(
      transactions.map((t) => t.transaction_date.slice(0, 7))
    )
  ).sort().reverse();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || filterType === "all" || t.type === filterType;
    const matchesCategory = !filterCategory || filterCategory === "all" || t.category_id === filterCategory;
    const matchesMonth = !filterMonth || filterMonth === "all" || t.transaction_date.startsWith(filterMonth);

    return matchesSearch && matchesType && matchesCategory && matchesMonth;
  });

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-md border-border/80">
        <CardContent className="p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="search" className="text-xs font-semibold">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Ghi chú hoặc danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="type-filter" className="text-xs font-semibold">Loại giao dịch</Label>
              <Select value={filterType} onValueChange={(val) => setFilterType(val || "")}>
                <SelectTrigger id="type-filter" className="h-10">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="expense">Khoản Chi (-)</SelectItem>
                  <SelectItem value="income">Khoản Thu (+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category-filter" className="text-xs font-semibold">Danh mục</Label>
              <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "")}>
                <SelectTrigger id="category-filter" className="h-10">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="month-filter" className="text-xs font-semibold">Thời gian (Tháng)</Label>
              <Select value={filterMonth} onValueChange={(val) => setFilterMonth(val || "")}>
                <SelectTrigger id="month-filter" className="h-10">
                  <SelectValue placeholder="Tất cả thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thời gian</SelectItem>
                  {months.map((m) => {
                    const [year, month] = m.split("-");
                    return (
                      <SelectItem key={m} value={m}>
                        Tháng {month}/{year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-md border-border/80 overflow-hidden">
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] pl-6">Ngày</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-center w-[120px]">Loại</TableHead>
                  <TableHead className="text-right w-[180px]">Số tiền</TableHead>
                  <TableHead className="text-center pr-6 w-[140px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((t, index) => {
                  const cat = t.categories;
                  return (
                    <TableRow key={t.id || index} className="hover:bg-accent/40 transition-colors">
                      <TableCell className="font-medium pl-6 text-sm text-muted-foreground">
                        {new Date(t.transaction_date).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${cat?.color || "#94a3b8"}15` }}
                          >
                            <CategoryIcon
                              name={cat?.icon || "help-circle"}
                              className="w-4 h-4"
                              style={{ color: cat?.color || "#94a3b8" }}
                            />
                          </div>
                          <span className="font-medium text-sm">{cat?.name || "Khác"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {t.note || <span className="text-muted-foreground italic text-xs">Không ghi chú</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={t.type === "income" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}
                        >
                          {t.type === "income" ? "Thu nhập" : "Chi tiêu"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold text-sm ${t.type === "income" ? "text-green-500" : ""}`}>
                        {t.type === "income" ? "+" : "-"}
                        {formatVND(Number(t.amount))}
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => openEditDialog(t)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 cursor-pointer"
                            onClick={() => openDeleteDialog(t)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Không tìm thấy giao dịch nào khớp với bộ lọc của bạn.
            </div>
          )}
        </CardContent>
      </Card>

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
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

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
                {isEditSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Lưu Thay Đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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