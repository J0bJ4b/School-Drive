import React from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile } from '../types';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileText
} from 'lucide-react';
import {
  formatBytes,
  formatThaiDate,
  getDaysRemainingInTrash,
  getFileCategoryIconInfo
} from '../utils/formatters';

export const TrashView: React.FC = () => {
  const {
    files,
    restoreFileFromTrash,
    permanentlyDeleteFile,
    currentUser
  } = useApp();

  const trashFiles = files.filter((f) => f.isTrash);

  const handleEmptyTrash = () => {
    const ok = window.confirm(
      'คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารทั้งหมดในถังขยะอย่างถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้'
    );
    if (ok) {
      trashFiles.forEach((f) => permanentlyDeleteFile(f.id));
    }
  };

  const isAdminOrOwner = (file: DocumentFile) => {
    return currentUser?.role === 'admin' || file.createdByUserId === currentUser?.id;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ถังขยะ (Recycle Bin)
            </h2>
            <p className="text-xs text-slate-500">
              เอกสารที่ถูกลบสามารถกู้คืนได้ภายใน 30 วัน หลังจากนั้นระบบจะล้างข้อมูลอัตโนมัติ สิทธิ์ใน Drive จะถูกระงับทันทีระหว่างอยู่ในถังขยะ
            </p>
          </div>
        </div>

        {trashFiles.length > 0 && currentUser?.role === 'admin' && (
          <button
            onClick={handleEmptyTrash}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างถังขยะทั้งหมด</span>
          </button>
        )}
      </div>

      {trashFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">ไม่มีเอกสารในถังขยะ</p>
          <p className="text-xs text-slate-400">
            เอกสารที่คุณลบจะมาอยู่ที่นี่ และสามารถกู้คืนได้เสมอภายใน 30 วัน
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ชื่อเอกสาร</th>
                  <th className="py-3 px-4">ขนาด</th>
                  <th className="py-3 px-4">วันที่ลบ</th>
                  <th className="py-3 px-4">ระยะเวลาที่เหลือก่อนลบถาวร</th>
                  <th className="py-3 px-4">สถานะไดรฟ์</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trashFiles.map((file) => {
                  const icon = getFileCategoryIconInfo(file.extension);
                  const daysLeft = getDaysRemainingInTrash(file.deletedAt);
                  const canAct = isAdminOrOwner(file);

                  return (
                    <tr key={file.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 max-w-md">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${icon.bg} ${icon.color}`}
                          >
                            {icon.label}
                          </span>
                          <span className="font-semibold text-slate-800 truncate">
                            {file.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        {formatBytes(file.sizeBytes)}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {formatThaiDate(file.deletedAt)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            daysLeft <= 5
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>เหลืออีก {daysLeft} วัน</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          ระงับสิทธิ์ Drive แล้ว
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {canAct ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => restoreFileFromTrash(file.id)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>กู้คืน</span>
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`ยืนยันลบถาวร "${file.name}"?`)) {
                                  permanentlyDeleteFile(file.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="ลบถาวรทันที"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">ไม่มีสิทธิ์จัดการ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
