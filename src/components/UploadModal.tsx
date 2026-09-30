import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Upload,
  X,
  File,
  CheckCircle2,
  AlertCircle,
  Folder,
  Layers,
  Info
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
  defaultFolderId?: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  defaultCategoryId,
  defaultFolderId
}) => {
  const {
    categories,
    folders,
    uploadFiles,
    uploadQueue,
    clearUploadQueue,
    settings
  } = useApp();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultCategoryId || categories[0]?.id || ''
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const incoming = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...incoming]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...incoming]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    await uploadFiles(selectedFiles, selectedCategory, selectedFolderId || null);
    setIsUploading(false);
    setSelectedFiles([]);
  };

  const handleFinishAndClose = () => {
    clearUploadQueue();
    setSelectedFiles([]);
    onClose();
  };

  // Filter folders in selected category
  const categoryFolders = folders.filter((f) => f.categoryId === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                อัปโหลดเอกสารเข้าสู่ School Drive
              </h3>
              <p className="text-xs text-slate-500">
                ลากไฟล์มาวาง หรือเลือกทีละหลายไฟล์ (ขนาดไม่เกิน {settings.maxFileSizeMB} MB ต่อไฟล์)
              </p>
            </div>
          </div>
          <button
            onClick={handleFinishAndClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Destination Selector: Category & Folder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่เอกสาร <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedFolderId('');
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
                จัดเก็บในโฟลเดอร์ (ไม่บังคับ)
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">(รูทของหมวดหมู่ ไม่เข้าโฟลเดอร์)</option>
                {categoryFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {'— '.repeat(f.depth - 1)} 📁 {f.name} (ชั้นที่ {f.depth})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          {uploadQueue.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </p>
              <p className="text-xs text-slate-500 mt-1">
                รองรับ PDF, Word, Excel, PowerPoint, รูปภาพ และไฟล์บีบอัด
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] text-slate-600 font-medium">
                <Info className="w-3 h-3 text-slate-400" />
                สูงสุด {settings.maxFileSizeMB} MB ต่อไฟล์ · ห้ามไฟล์นามสกุล .{settings.disallowedExtensions.join(', .')}
              </div>
            </div>
          )}

          {/* Staged files list before uploading */}
          {selectedFiles.length > 0 && uploadQueue.length === 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>ไฟล์ที่เลือก ({selectedFiles.length} ไฟล์)</span>
                <span className="text-slate-500 font-mono">
                  รวม {formatBytes(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                {selectedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <File className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate font-medium text-slate-700">{f.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formatBytes(f.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Upload Progress Queue */}
          {uploadQueue.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>ความคืบหน้าการอัปโหลด</span>
                <span>
                  {uploadQueue.filter((i) => i.status === 'completed').length} / {uploadQueue.length} สำเร็จ
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate pr-2">
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : item.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <Upload className="w-4 h-4 text-blue-600 animate-bounce shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        {item.status === 'completed'
                          ? 'สำเร็จ'
                          : item.status === 'error'
                          ? 'ผิดพลาด'
                          : `${item.progress}%`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-150 ${
                          item.status === 'completed'
                            ? 'bg-emerald-500'
                            : item.status === 'error'
                            ? 'bg-rose-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    {item.errorMessage && (
                      <div className="text-[11px] text-rose-600 font-medium">
                        {item.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleFinishAndClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            {uploadQueue.length > 0 ? 'ปิดหน้าต่าง' : 'ยกเลิก'}
          </button>

          {uploadQueue.length === 0 ? (
            <button
              type="button"
              disabled={selectedFiles.length === 0 || isUploading}
              onClick={handleStartUpload}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>เริ่มอัปโหลด ({selectedFiles.length})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishAndClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              เสร็จสิ้น
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
