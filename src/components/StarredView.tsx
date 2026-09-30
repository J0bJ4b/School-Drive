import React from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile } from '../types';
import { Star, Eye, Share2, FileText, Download } from 'lucide-react';
import { formatBytes, formatThaiDate, getFileCategoryIconInfo } from '../utils/formatters';

interface StarredViewProps {
  onOpenFileViewer: (file: DocumentFile) => void;
  onOpenShareModal: (file: DocumentFile) => void;
}

export const StarredView: React.FC<StarredViewProps> = ({
  onOpenFileViewer,
  onOpenShareModal
}) => {
  const { files, toggleStarFile, categories } = useApp();

  const starredFiles = files.filter((f) => f.isStarred && !f.isTrash);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              รายการโปรด (Starred Documents)
            </h2>
            <p className="text-xs text-slate-500">
              เอกสารที่คุณติดดาวไว้เพื่อความสะดวกรวดเร็วในการเปิดใช้งานเป็นประจำ
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-800 font-semibold text-xs rounded-xl border border-amber-200">
          {starredFiles.length} รายการ
        </span>
      </div>

      {starredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-300" />
          </div>
          <p className="text-sm font-semibold text-slate-700">ยังไม่มีเอกสารติดดาวในรายการโปรด</p>
          <p className="text-xs text-slate-400">
            คุณสามารถกดไอคอนดาวที่ไฟล์ใดก็ได้ เพื่อบันทึกไว้เปิดใช้งานอย่างรวดเร็ว
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {starredFiles.map((file) => {
            const icon = getFileCategoryIconInfo(file.extension);
            const cat = categories.find((c) => c.id === file.categoryId);

            return (
              <div
                key={file.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 shadow-sm p-4 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${icon.bg} ${icon.color}`}
                    >
                      {icon.label}
                    </span>

                    <button
                      onClick={() => toggleStarFile(file.id)}
                      className="p-1 text-amber-500 hover:text-slate-400 transition"
                      title="นำออกจากรายการโปรด"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h3
                    onClick={() => onOpenFileViewer(file)}
                    className="font-bold text-xs text-slate-800 hover:text-amber-600 cursor-pointer line-clamp-2 leading-relaxed"
                  >
                    {file.name}
                  </h3>

                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                    <span>{cat?.name || 'ทั่วไป'}</span>
                    <span>·</span>
                    <span>{formatBytes(file.sizeBytes)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    อัปเดต: {formatThaiDate(file.updatedAt, false)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenFileViewer(file)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-xs transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>เปิดดู</span>
                    </button>
                    <button
                      onClick={() => onOpenShareModal(file)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                      title="แชร์"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
