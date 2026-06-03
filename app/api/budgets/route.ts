import { NextResponse } from 'next/server';
import { getBudgets, upsertBudget } from '@/app/protected/actions';

export async function GET() {
  const data = await getBudgets();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const payload = await req.json(); // { category_id, amount, month_year }
  const result = await upsertBudget(payload);
  return NextResponse.json(result);
}
