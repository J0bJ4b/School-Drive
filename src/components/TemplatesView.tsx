import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile } from '../types';
import {
  Bookmark,
  Copy,
  CheckCircle2,
  Eye,
  FileText,
  Download,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatBytes, formatThaiDate, getFileCategoryIconInfo } from '../utils/formatters';

interface TemplatesViewProps {
  onOpenFileViewer: (file: DocumentFile) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onOpenFileViewer }) => {
  const { files, categories, useTemplate, currentUser } = useApp();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const templateFiles = files.filter((f) => f.isTemplate && !f.isTrash);

  const handleUseTemplate = (template: DocumentFile) => {
    const copy = useTemplate(template.id, currentUser?.department === 'admin' ? 'cat-admin' : undefined);
    if (copy) {
      setSuccessMessage(`ทำสำเนา "${copy.name}" ไปยังไดรฟ์ของคุณเรียบร้อยแล้ว!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      onOpenFileViewer(copy);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              เทมเพลตแบบฟอร์มกลางของโรงเรียน (Templates)
            </h2>
            <p className="text-xs text-slate-500">
              แบบฟอร์มราชการและเอกสารมาตรฐานกลาง กด "ใช้เทมเพลตนี้" เพื่อสร้างสำเนาไปใช้ทำงานได้ทันที
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200">
          {templateFiles.length} แบบฟอร์ม
        </span>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templateFiles.map((tmpl) => {
          const icon = getFileCategoryIconInfo(tmpl.extension);
          const cat = categories.find((c) => c.id === tmpl.categoryId);

          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm p-5 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${icon.bg} ${icon.color}`}
                    >
                      {icon.label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      หมวด: {cat?.name || 'ทั่วไป'}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    นำไปใช้แล้ว {tmpl.downloadCount || 0} ครั้ง
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {tmpl.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {tmpl.description || 'แบบฟอร์มทางการสำหรับการจัดกิจกรรมและปฏิบัติหน้าที่ราชการ'}
                </p>

                {tmpl.tags && tmpl.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tmpl.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenFileViewer(tmpl)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูตัวอย่าง</span>
                </button>

                <button
                  onClick={() => handleUseTemplate(tmpl)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-500/20 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>ใช้เทมเพลตนี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
