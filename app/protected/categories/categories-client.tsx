"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "../actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, FolderOpen, Heart, HelpCircle, Utensils, Car, ShoppingBag, Home, Film, GraduationCap, Plane, Award, Briefcase, Gift, Wallet } from "lucide-react";
import * as LucideIcons from "lucide-react";

const ICON_OPTIONS = [
  { name: "utensils", label: "Ăn uống", icon: Utensils },
  { name: "car", label: "Di chuyển", icon: Car },
  { name: "shopping-bag", label: "Mua sắm", icon: ShoppingBag },
  { name: "home", label: "Nhà cửa", icon: Home },
  { name: "heart", label: "Sức khỏe", icon: Heart },
  { name: "film", label: "Giải trí", icon: Film },
  { name: "graduation-cap", label: "Giáo dục", icon: GraduationCap },
  { name: "plane", label: "Du lịch", icon: Plane },
  { name: "award", label: "Thưởng", icon: Award },
  { name: "briefcase", label: "Công việc", icon: Briefcase },
  { name: "gift", label: "Quà tặng", icon: Gift },
  { name: "wallet", label: "Đầu tư", icon: Wallet },
  { name: "help-circle", label: "Khác", icon: HelpCircle },
];

const COLOR_OPTIONS = [
  "#ef4444", "#f43f5e", "#f97316", "#f59e0b", "#eab308", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#d946ef", "#64748b",
];

interface Category {
  id: string;
  name: string;
  type: "expense" | "income";
  icon?: string;
  color?: string;
  user_id?: string;
}

const CategoryIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>;
  const IconComponent = icons[pascalName] || icons[name] || LucideIcons.HelpCircle as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  return <IconComponent className={className} style={style} />;
};

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [selectedIcon, setSelectedIcon] = useState("help-circle");
  const [selectedColor, setSelectedColor] = useState("#ef4444");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCat = await createCategory({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
      });

      setCategories((prev) => [...prev, newCat]);
      toast.success("Thêm danh mục thành công!");
      setName("");
      setSelectedIcon("help-circle");
      setSelectedColor("#ef4444");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Xóa danh mục thành công!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể xóa danh mục này.";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const expenses = categories.filter((c) => c.type === "expense");
  const incomes = categories.filter((c) => c.type === "income");

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="bg-card/50 backdrop-blur-md border-border/80 h-fit">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Thêm Danh Mục Mới</CardTitle>
          <CardDescription>Tạo danh mục chi tiêu hoặc thu nhập tùy chỉnh của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className={type === "expense" ? "bg-red-500 hover:bg-red-600" : ""}
                onClick={() => setType("expense")}
              >
                Khoản Chi
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className={type === "income" ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={() => setType("income")}
              >
                Khoản Thu
              </Button>
            </div>

            <div className="space-y-1">
              <Label htmlFor="category-name">Tên danh mục</Label>
              <Input
                id="category-name"
                placeholder="Ví dụ: Nuôi thú cưng, Đầu tư..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Màu sắc đại diện</Label>
              <div className="grid grid-cols-7 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Biểu tượng</Label>
              <div className="grid grid-cols-5 gap-2 max-h-[140px] overflow-y-auto p-1 border border-border/80 rounded-lg bg-background/50">
                {ICON_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedIcon === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      className={`h-9 rounded-md border flex items-center justify-center cursor-pointer transition-all hover:bg-accent/40 ${
                        isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                      title={opt.label}
                      onClick={() => setSelectedIcon(opt.name)}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full cursor-pointer">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Tạo Danh Mục
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="md:col-span-2 space-y-6">
        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-red-500" />
              <span>Danh Mục Khoản Chi</span>
            </CardTitle>
            <CardDescription>Các danh mục dùng để phân loại giao dịch chi tiêu.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {expenses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background/30 hover:bg-background/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${c.color}15` }}
                    >
                      <CategoryIcon name={c.icon || "help-circle"} className="w-4.5 h-4.5" style={{ color: c.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-1.5 py-0 ${
                          c.user_id ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {c.user_id ? "Cá nhân" : "Mặc định"}
                      </Badge>
                    </div>
                  </div>

                  {c.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 cursor-pointer"
                      onClick={() => handleDeleteCategory(c.id)}
                      disabled={deletingId === c.id}
                    >
                      {deletingId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-green-500" />
              <span>Danh Mục Khoản Thu</span>
            </CardTitle>
            <CardDescription>Các danh mục dùng để phân loại giao dịch thu nhập.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {incomes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background/30 hover:bg-background/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${c.color}15` }}
                    >
                      <CategoryIcon name={c.icon || "help-circle"} className="w-4.5 h-4.5" style={{ color: c.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-1.5 py-0 ${
                          c.user_id ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {c.user_id ? "Cá nhân" : "Mặc định"}
                      </Badge>
                    </div>
                  </div>

                  {c.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 cursor-pointer"
                      onClick={() => handleDeleteCategory(c.id)}
                      disabled={deletingId === c.id}
                    >
                      {deletingId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}