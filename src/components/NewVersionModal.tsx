import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile } from '../types';
import { Upload, X, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface NewVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DocumentFile | null;
}

export const NewVersionModal: React.FC<NewVersionModalProps> = ({
  isOpen,
  onClose,
  file
}) => {
  const { uploadNewVersion, settings } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeNote, setChangeNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      if (settings.disallowedExtensions.includes(ext)) {
        setError(`ไม่อนุญาตให้อัปโหลดไฟล์นามสกุล .${ext}`);
        return;
      }
      if (f.size > settings.maxFileSizeMB * 1024 * 1024) {
        setError(`ขนาดไฟล์เกิน ${settings.maxFileSizeMB} MB`);
        return;
      }
      setSelectedFile(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด');
      return;
    }

    setIsSubmitting(true);
    const ok = await uploadNewVersion(file.id, selectedFile, changeNote);
    setIsSubmitting(false);

    if (ok) {
      setSelectedFile(null);
      setChangeNote('');
      onClose();
    } else {
      setError('เกิดข้อผิดพลาดในการอัปโหลดเวอร์ชันใหม่');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                อัปโหลดเวอร์ชันใหม่ (v{file.currentVersion + 1})
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                ทับเอกสาร: {file.name}
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

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-semibold text-slate-700">เวอร์ชันปัจจุบัน: v{file.currentVersion}</div>
            <div className="text-slate-500">
              ระบบจะเก็บเวอร์ชันเก่าไว้ในประวัติอย่างปลอดภัย และคุณสามารถกู้กลับได้ตลอดเวลา
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เลือกไฟล์ฉบับปรับปรุงใหม่ <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-xl p-1 bg-slate-50 cursor-pointer"
            />
            {selectedFile && (
              <span className="text-[11px] text-slate-500 mt-1 block">
                ขนาด: {formatBytes(selectedFile.size)}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกการแก้ไขในเวอร์ชันนี้ (Change Note)
            </label>
            <textarea
              rows={3}
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="เช่น แก้ไขข้อมูลคะแนนปลายภาค, ปรับเกณฑ์การประเมินใหม่..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
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
              disabled={!selectedFile || isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              {isSubmitting ? 'กำลังอัปโหลด...' : 'บันทึกเวอร์ชันใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
