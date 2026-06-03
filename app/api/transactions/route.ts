import { NextResponse } from 'next/server';
import { getTransactions, createTransaction } from '@/app/protected/actions';

export async function GET() {
  const data = await getTransactions();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const payload = await req.json(); // expects transaction fields defined in createTransaction
  const result = await createTransaction(payload);
  return NextResponse.json(result);
}
