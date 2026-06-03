import { redirect } from 'next/navigation';

export default function TransactionsRedirect() {
  redirect('/protected/transactions');
  return null; // This line will never be reached
}
