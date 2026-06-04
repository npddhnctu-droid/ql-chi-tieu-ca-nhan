export interface Category {
  id: string;
  name: string;
  type: "expense" | "income";
  icon?: string;
  color?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month_year: string; // format YYYY-MM (or YYYY-MM-DD)
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: "expense" | "income";
  transaction_date: string; // format YYYY-MM-DD
  note?: string;
}
