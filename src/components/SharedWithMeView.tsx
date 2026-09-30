import React from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile } from '../types';
import {
  Share2,
  Users,
  User,
  Eye,
  Building,
  Star,
  Download,
  Calendar,
  FileText
} from 'lucide-react';
import { formatBytes, formatThaiDate, getFileCategoryIconInfo } from '../utils/formatters';

interface SharedWithMeViewProps {
  onOpenFileViewer: (file: DocumentFile) => void;
  onOpenShareModal: (file: DocumentFile) => void;
}

export const SharedWithMeView: React.FC<SharedWithMeViewProps> = ({
  onOpenFileViewer,
  onOpenShareModal
}) => {
  const { currentUser, files, toggleStarFile } = useApp();

  const sharedFiles = files.filter((file) => {
    if (file.isTrash) return false;
    if (!currentUser) return false;
    if (file.createdByUserId === currentUser.id) return false; // Not own files

    return file.sharedWith.some(
      (p) =>
        (p.targetType === 'user' && p.targetId === currentUser.id) ||
        (p.targetType === 'group' && currentUser.groupIds.includes(p.targetId || '')) ||
        p.targetType === 'everyone'
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              เอกสารที่แชร์กับฉัน (Shared with me)
            </h2>
            <p className="text-xs text-slate-500">
              รวมเอกสารที่เพื่อนครู ผู้บริหาร หรือคณะทำงานแชร์ให้คุณโดยตรงหรือผ่านกลุ่มสาระ
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200">
          {sharedFiles.length} รายการ
        </span>
      </div>

      {sharedFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">ยังไม่มีเอกสารที่แชร์มาให้คุณ</p>
          <p className="text-xs text-slate-400">
            เมื่อมีผู้ร่วมงานแชร์เอกสารมาให้คุณหรือกลุ่มของคุณ รายการจะปรากฏที่นี่ทันที
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sharedFiles.map((file) => {
            const icon = getFileCategoryIconInfo(file.extension);
            const myShare = file.sharedWith.find(
              (p) =>
                (p.targetType === 'user' && p.targetId === currentUser?.id) ||
                (p.targetType === 'group' && currentUser?.groupIds.includes(p.targetId || '')) ||
                p.targetType === 'everyone'
            );

            return (
              <div
                key={file.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow transition p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${icon.bg} ${icon.color}`}
                    >
                      {icon.label}
                    </span>
                    <button
                      onClick={() => toggleStarFile(file.id)}
                      className={`p-1 rounded ${
                        file.isStarred ? 'text-amber-500 fill-current' : 'text-slate-300'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h3
                    onClick={() => onOpenFileViewer(file)}
                    className="font-bold text-xs text-slate-800 hover:text-indigo-600 cursor-pointer line-clamp-2 leading-relaxed"
                  >
                    {file.name}
                  </h3>

                  <div className="mt-3 p-2 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">แชร์โดย:</span>
                      <span className="font-semibold text-slate-800">{file.createdByUserName}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">ช่องทางแชร์:</span>
                      <span className="font-medium text-indigo-700">
                        {myShare?.targetName || 'แชร์โดยตรง'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">สิทธิ์ของคุณ:</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          myShare?.role === 'editor'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {myShare?.role === 'editor' ? 'แก้ไขได้' : 'ดูได้อย่างเดียว'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {formatBytes(file.sizeBytes)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenFileViewer(file)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>เปิดดู</span>
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
