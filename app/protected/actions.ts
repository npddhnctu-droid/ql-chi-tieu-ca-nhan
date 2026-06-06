"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";


interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error getCategories:", error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function createTransaction(data: {
  amount: number;
  type: "income" | "expense";
  category_id: string;
  transaction_date: string;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      category_id: data.category_id,
      amount: data.amount,
      type: data.type,
      transaction_date: data.transaction_date,
      note: data.note || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Error createTransaction:", error);
    throw new Error(error.message);
  }



  return transaction;
}

export async function getTransactions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      user_id,
      category_id,
      amount,
      type,
      transaction_date,
      note,
      created_at,
      categories (
        id,
        name,
        icon,
        color
      )
    `)
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getTransactions:", error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getBudgets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("budgets")
    .select(`
      id,
      user_id,
      category_id,
      amount,
      month_year,
      created_at,
      categories (
        id,
        name,
        icon,
        color
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error getBudgets:", error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function upsertBudget(data: {
  category_id: string;
  amount: number;
  month_year: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Convert month_year (YYYY-MM) to a proper DATE string (YYYY-MM-01)
  const monthYearDate = `${data.month_year}-01`;

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("category_id", data.category_id)
    .eq("month_year", monthYearDate)
    .maybeSingle();

  let res;
  if (existing) {
    res = await supabase
      .from("budgets")
      .update({ amount: data.amount })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    res = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category_id: data.category_id,
        amount: data.amount,
        month_year: monthYearDate,
      })
      .select()
      .single();
  }

  if (res.error) {
    console.error("Error upsertBudget:", res.error);
    throw new Error(res.error.message);
  }



  return res.data;
}

export async function categorizeWithAI(text: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const categories = await getCategories();
    const categoriesList = categories
      .map((c) => `- ${c.name} (${c.type === "expense" ? "Chi tiêu" : "Thu nhập"})`) 
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Using local basic parser.");
      return fallbackLocalParser(text, categories);
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Bạn là một trợ lý AI quản lý tài chính cá nhân. Hãy phân tích mô tả giao dịch bằng tiếng Việt sau và chuyển đổi thành JSON:
Giao dịch: "${text}"

Các danh mục có sẵn:
${categoriesList}

Định dạng JSON bắt buộc:
{
  "amount": number (số tiền, ví dụ '35k' -> 35000, '2 tr' -> 2000000),
  "type": "expense" | "income" (loại giao dịch: 'expense' cho chi tiêu, 'income' cho thu nhập),
  "category_name": string (phải chọn đúng tên một trong các danh mục có sẵn ở trên khớp nhất),
  "note": string (tóm tắt ngắn gọn nội dung giao dịch, ví dụ "Mua cơm tấm")
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText.trim());

    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === parsed.category_name.toLowerCase()
    ) || categories.find(
      (c) => c.type === parsed.type
    ) || categories[0];

    return {
      amount: parsed.amount || 0,
      type: parsed.type || "expense",
      category_id: matchedCategory ? matchedCategory.id : "",
      note: parsed.note || text,
    };
  } catch (err) {
    console.error("AI Error:", err);
    // Fallback in case of API error
    const categories = await getCategories();
    return fallbackLocalParser(text, categories);
  }
}

function fallbackLocalParser(text: string, categories: Category[]) {
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(k|K|tr|tr triệu|m|triệu)?/);
  let amount = 0;
  if (amountMatch) {
    const val = parseFloat(amountMatch[1]);
    const unit = amountMatch[2] ? amountMatch[2].toLowerCase() : "";
    if (unit === "k") {
      amount = val * 1000;
    } else if (unit === "tr" || unit === "m" || unit === "triệu") {
      amount = val * 1000000;
    } else {
      amount = val;
    }
  }

  const textLower = text.toLowerCase();
  let type: "expense" | "income" = "expense";
  let matchedCategory = categories.find(c => c.name.toLowerCase() === "ăn uống");

  if (textLower.includes("lương") || textLower.includes("thu nhập") || textLower.includes("thưởng")) {
    type = "income";
    matchedCategory = categories.find(c => c.type === "income") || categories[0];
  } else if (textLower.includes("xe") || textLower.includes("xăng") || textLower.includes("di chuyển")) {
    matchedCategory = categories.find(c => c.name.toLowerCase().includes("di chuyển")) || matchedCategory;
  } else if (textLower.includes("áo") || textLower.includes("quần") || textLower.includes("mua") || textLower.includes("shopee")) {
    matchedCategory = categories.find(c => c.name.toLowerCase().includes("mua sắm")) || matchedCategory;
  }

  const note = text.charAt(0).toUpperCase() + text.slice(1);

  return {
    amount,
    type,
    category_id: matchedCategory ? matchedCategory.id : "",
    note,
  };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleteTransaction:", error);
    throw new Error(error.message);
  }




  return true;
}

export async function updateTransaction(
  id: string,
  data: {
    amount: number;
    type: "income" | "expense";
    category_id: string;
    transaction_date: string;
    note?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: transaction, error } = await supabase
    .from("transactions")
    .update({
      category_id: data.category_id,
      amount: data.amount,
      type: data.type,
      transaction_date: data.transaction_date,
      note: data.note || "",
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updateTransaction:", error);
    throw new Error(error.message);
  }




  return transaction;
}

export async function createCategory(data: {
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type,
    })
    .select()
    .single();

  if (error) {
    console.error("Error createCategory:", error);
    throw new Error(error.message);
  }

  revalidatePath("/protected");
  return category;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if there are transactions associated with this category
  const { count, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("user_id", user.id);

  if (countError) {
    throw new Error(countError.message);
  }

  if (count && count > 0) {
    throw new Error("Không thể xóa danh mục này vì đã có giao dịch phát sinh liên kết với nó.");
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleteCategory:", error);
    throw new Error(error.message);
  }

  revalidatePath("/protected");
  return true;
}