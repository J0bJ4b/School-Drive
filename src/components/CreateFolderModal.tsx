import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderPlus, X, AlertTriangle, Layers } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
  defaultParentFolderId?: string | null;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  defaultCategoryId,
  defaultParentFolderId
}) => {
  const { categories, folders, createFolder } = useApp();

  const [folderName, setFolderName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultCategoryId || categories[0]?.id || ''
  );
  const [selectedParentId, setSelectedParentId] = useState<string>(
    defaultParentFolderId || ''
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate prospective depth
  let currentDepth = 1;
  if (selectedParentId) {
    const parent = folders.find((f) => f.id === selectedParentId);
    if (parent) {
      currentDepth = parent.depth + 1;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!folderName.trim()) {
      setError('กรุณาระบุชื่อโฟลเดอร์');
      return;
    }

    const res = createFolder(folderName.trim(), selectedCategory, selectedParentId || null);
    if (!res.success) {
      setError(res.message || 'ไม่สามารถสร้างโฟลเดอร์ได้');
      return;
    }

    setFolderName('');
    onClose();
  };

  const categoryFolders = folders.filter((f) => f.categoryId === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">สร้างโฟลเดอร์ใหม่</h3>
              <p className="text-xs text-slate-500">
                รองรับการสร้างโครงสร้างโฟลเดอร์ซ้อนกันได้สูงสุด 10 ชั้น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อโฟลเดอร์ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="เช่น แผนการสอน ภาคเรียนที่ 1, งานวัดผล..."
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมวดหมู่หลัก
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedParentId('');
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              โฟลเดอร์แม่ (สำหรับซ้อนโฟลเดอร์ย่อย)
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">(ไม่มีโฟลเดอร์แม่ - สร้างที่ระดับบนสุด ชั้นที่ 1)</option>
              {categoryFolders.map((f) => (
                <option key={f.id} value={f.id} disabled={f.depth >= 10}>
                  {'— '.repeat(f.depth - 1)} 📁 {f.name} (ชั้นที่ {f.depth})
                  {f.depth >= 10 ? ' [เต็ม 10 ชั้นแล้ว]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Depth meter indicator */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-blue-600" />
              ระดับความลึกของโฟลเดอร์นี้:
            </span>
            <span className="font-bold px-2 py-0.5 bg-blue-200/60 text-blue-800 rounded-md">
              ชั้นที่ {currentDepth} / 10
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={currentDepth > 10}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              สร้างโฟลเดอร์
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
