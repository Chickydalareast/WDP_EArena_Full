// src/features/exam-builder/components/InitExamForm.tsx
'use client';

import { useState } from 'react';
import { useInitExam } from '../hooks/useInitExam';

export function InitExamForm() {
  const { mutate, isPending } = useInitExam();
  
  // State cục bộ cho Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '', // Sẽ là chuỗi 24 ký tự ObjectId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate sương sương ở Client trước khi nã xuống BE
    if (!formData.title.trim() || !formData.subjectId.trim()) return;
    mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg p-6 border rounded-xl bg-white shadow-sm">
      <h2 className="text-xl font-bold border-b pb-2 mb-4">Bước 1: Khởi tạo thông tin Đề thi</h2>
      
      <div>
        <label className="block text-sm font-semibold mb-1">Tiêu đề đề thi (*)</label>
        <input
          type="text"
          required
          disabled={isPending}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          placeholder="VD: Kiểm tra 15p Toán Hình..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Mã Môn Học (*)</label>
        <input
          type="text"
          required
          disabled={isPending}
          value={formData.subjectId}
          onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          placeholder="Nhập ID môn học (24 ký tự)..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Mô tả thêm (Tùy chọn)</label>
        <textarea
          disabled={isPending}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          placeholder="Ghi chú nội bộ..."
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !formData.title.trim() || !formData.subjectId.trim()}
        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Đang khởi tạo...' : 'Tạo Vỏ Đề Thi'}
      </button>
    </form>
  );
}