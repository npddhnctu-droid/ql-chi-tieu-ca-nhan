import React, { useState } from 'react';

export default function BudgetForm({ categories, onSuccess }: { categories: any[]; onSuccess: () => void }) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [monthYear, setMonthYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!categoryId || !amount || !monthYear) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          amount: Number(amount.replace(/[^0-9]/g, '')),
          month_year: monthYear,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      await res.json();
      // reset fields
      setCategoryId('');
      setAmount('');
      setMonthYear('');
      onSuccess();
    } catch (err) {
      setError('Gửi dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Thêm / Cập nhật ngân sách</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Nhập số tiền"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tháng/Năm</label>
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
      >
        {loading ? 'Đang lưu…' : 'Lưu ngân sách'}
      </button>
    </form>
  );
}
