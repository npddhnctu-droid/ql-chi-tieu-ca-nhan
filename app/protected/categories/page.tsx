import { getCategories } from "../actions";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-sans">Quản Lý Danh Mục</h1>
        <p className="text-muted-foreground">
          Quản lý các danh mục thu nhập và chi tiêu của bạn. Bạn có thể thêm danh mục tùy chỉnh hoặc xem danh mục hệ thống.
        </p>
      </div>

      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
