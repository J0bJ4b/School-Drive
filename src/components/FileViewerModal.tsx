import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile, DocumentVersion } from '../types';
import {
  X,
  Download,
  Share2,
  Star,
  Clock,
  History,
  HardDrive,
  RotateCcw,
  Upload,
  CheckCircle2,
  FileText,
  Eye,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Printer,
  Info
} from 'lucide-react';
import { formatBytes, formatThaiDate, getFileCategoryIconInfo } from '../utils/formatters';

interface FileViewerModalProps {
  file: DocumentFile | null;
  onClose: () => void;
  onOpenShareModal: (file: DocumentFile) => void;
  onOpenUploadNewVersionModal: (file: DocumentFile) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  onClose,
  onOpenShareModal,
  onOpenUploadNewVersionModal
}) => {
  const {
    currentUser,
    categories,
    folders,
    toggleStarFile,
    restoreFileVersion,
    incrementDownloadCount,
    canUserEditFile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'details'>('preview');
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);

  if (!file) return null;

  const category = categories.find((c) => c.id === file.categoryId);
  const folder = folders.find((f) => f.id === file.folderId);
  const iconInfo = getFileCategoryIconInfo(file.extension);
  const canEdit = canUserEditFile(file);

  const handleDownload = () => {
    incrementDownloadCount(file.id);
    // Simulate real download by generating blob
    const sampleContent = `ระบบ School Drive - สำเนาเอกสารโรงเรียน\n\nชื่อเอกสาร: ${file.name}\nเวอร์ชัน: v${file.currentVersion}\nผู้จัดทำ: ${file.createdByUserName}\nสร้างเมื่อ: ${file.createdAt}\nรหัสอ้างอิง: ${file.driveFileId}\nหมวดหมู่: ${category?.name || '-'}\n\nเนื้อหาจำลองของเอกสารโรงเรียนสำหรับการทดสอบระบบ`;
    const blob = new Blob([sampleContent], { type: file.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}.${file.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreVersion = (versionNum: number) => {
    const confirmed = window.confirm(
      `คุณต้องการกู้คืนเอกสารนี้กลับไปใช้เวอร์ชัน v${versionNum} หรือไม่? ระบบจะสร้างเวอร์ชันใหม่ต่อท้ายโดยดึงข้อมูลจากสำเนาสำรองอัตโนมัติ`
    );
    if (!confirmed) return;

    const ok = restoreFileVersion(file.id, versionNum);
    if (ok) {
      setRestoredNotice(`กู้คืนกลับเป็นเวอร์ชัน v${versionNum} เรียบร้อยแล้ว`);
      setTimeout(() => setRestoredNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Top Action Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3 truncate min-w-0">
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${iconInfo.bg} ${iconInfo.color}`}>
              {file.extension.toUpperCase()}
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {file.name}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>v{file.currentVersion}</span>
                <span>·</span>
                <span>{formatBytes(file.sizeBytes)}</span>
                <span>·</span>
                <span>{category?.name || 'ทั่วไป'}</span>
                {folder && (
                  <>
                    <span>·</span>
                    <span className="truncate max-w-[120px]">📁 {folder.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => toggleStarFile(file.id)}
              className={`p-2 rounded-xl border transition ${
                file.isStarred
                  ? 'bg-amber-50 border-amber-300 text-amber-500'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={file.isStarred ? 'ยกเลิกรายการโปรด' : 'เพิ่มในรายการโปรด'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => onOpenShareModal(file)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition"
              title="แชร์เอกสารนี้"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">แชร์</span>
            </button>

            {canEdit && (
              <button
                onClick={() => onOpenUploadNewVersionModal(file)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700 transition"
                title="อัปโหลดเวอร์ชันใหม่ทับไฟล์เดิม"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">อัปโหลดเวอร์ชันใหม่</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              title="ดาวน์โหลดไฟล์"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ดาวน์โหลด</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switchers: Preview, Versions History, File Details */}
        <div className="flex items-center px-6 bg-white border-b border-slate-200 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>เปิดดูเอกสาร (Google Drive Preview)</span>
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`py-2.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'versions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติเวอร์ชัน ({file.versions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>ข้อมูลและการเข้าถึง</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-100 overflow-y-auto p-4 sm:p-6">
          {/* Alert for version restore */}
          {restoredNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{restoredNotice}</span>
            </div>
          )}

          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 min-h-[500px] flex flex-col justify-between">
              <div>
                {/* Simulated Google Drive Document Preview Header */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-slate-900 leading-snug">
                        {file.name}
                      </h1>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>จัดทำโดย {file.createdByUserName}</span>
                        <span>·</span>
                        <span>แก้ไขล่าสุด {formatThaiDate(file.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      เวอร์ชันปัจจุบัน: v{file.currentVersion}
                    </span>
                  </div>
                </div>

                {/* Simulated Page Content */}
                <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">
                        ระบบซิงค์ Google Drive: {file.driveSyncStatus === 'synced' ? 'เชื่อมต่อสมบูรณ์' : 'ระงับการเข้าถึง'}
                      </span>
                      <span>
                        เปิดดูผ่าน Google Docs / Drive Viewer ด้วยสิทธิ์ของโรงเรียน รหัสไฟล์ไดรฟ์:{' '}
                        <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">
                          {file.driveFileId}
                        </code>
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-3 font-serif">
                    <div className="text-center font-bold text-base text-slate-900 tracking-wide pb-2 border-b border-slate-200">
                      บันทึกข้อความ / รายงานอย่างเป็นทางการ
                    </div>
                    <p className="text-xs text-slate-600 indent-8 leading-6">
                      เรื่อง: {file.name} เรียน ผู้อำนวยการโรงเรียนและคณะกรรมการสถานศึกษา
                    </p>
                    <p className="text-xs text-slate-600 indent-8 leading-6">
                      ด้วยฝ่าย{category?.name || 'บริหาร'} ได้ดำเนินการรวบรวมข้อมูลและจัดทำเอกสารฉบับนี้เพื่อใช้ประกอบการดำเนินงานตามแผนปฏิบัติการประจำปีการศึกษา 2569 บันทึกนี้ได้รับการอนุมัติและจัดเก็บในระบบ School Drive พร้อมบันทึกประวัติการแก้ไขและเวอร์ชันย้อนหลังทุกฉบับ
                    </p>
                    <p className="text-xs text-slate-600 indent-8 leading-6">
                      บันทึกการเปลี่ยนแปลงเวอร์ชันปัจจุบัน (v{file.currentVersion}): "
                      {file.versions[file.versions.length - 1]?.changeNote || 'ไม่มีบันทึกเพิ่มเติม'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Document Metrics */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span>เข้าชมแล้ว {file.previewCount || 0} ครั้ง</span>
                  <span>ดาวน์โหลดแล้ว {file.downloadCount || 0} ครั้ง</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์</span>
                  </button>
                  <a
                    href={file.versions[file.versions.length - 1]?.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดในแท็บใหม่ (Google Drive)</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERSIONS HISTORY (Requirement: อัปโหลดไฟล์ใหม่ทับได้ ระบบเก็บเวอร์ชันเก่าไว้และกู้กลับได้) */}
          {activeTab === 'versions' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    ประวัติเวอร์ชันทั้งหมด ({file.versions.length} เวอร์ชัน)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ระบบบันทึกสำเนาทุกครั้งที่มีการอัปโหลดไฟล์ใหม่ทับ คุณสามารถดูหรือกู้คืนเวอร์ชันเก่าได้ตลอดเวลา
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onOpenUploadNewVersionModal(file)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดเวอร์ชันใหม่</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {[...file.versions].reverse().map((ver, idx) => {
                  const isCurrent = ver.versionNumber === file.currentVersion;
                  return (
                    <div
                      key={ver.versionNumber}
                      className={`p-4 bg-white rounded-2xl border transition shadow-sm ${
                        isCurrent
                          ? 'border-blue-300 ring-2 ring-blue-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            v{ver.versionNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">
                                เวอร์ชัน {ver.versionNumber}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  เวอร์ชันปัจจุบัน (Active)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              อัปโหลดเมื่อ: {formatThaiDate(ver.uploadedAt)} โดย {ver.uploadedByUserName} · ขนาด {formatBytes(ver.sizeBytes)}
                            </div>
                            {ver.changeNote && (
                              <div className="mt-2 text-xs p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                                <span className="font-semibold text-slate-600">บันทึกการแก้ไข: </span>
                                {ver.changeNote}
                              </div>
                            )}
                            {ver.checksum && (
                              <div className="text-[10px] font-mono text-slate-400 mt-1">
                                Hash Checksum: {ver.checksum}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isCurrent && canEdit && (
                            <button
                              onClick={() => handleRestoreVersion(ver.versionNumber)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                              title="กู้คืนเวอร์ชันนี้เป็นเวอร์ชันปัจจุบัน"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>กู้คืนเวอร์ชันนี้</span>
                            </button>
                          )}
                          <a
                            href={ver.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="ดูสำเนาใน Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DETAILS & PERMISSIONS */}
          {activeTab === 'details' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                  ข้อมูลคุณลักษณะของไฟล์ (Metadata)
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">ชื่อเอกสาร</span>
                    <span className="font-semibold text-slate-800">{file.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">ชื่อไฟล์ต้นฉบับ</span>
                    <span className="font-semibold text-slate-800">{file.originalName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">หมวดหมู่เอกสาร</span>
                    <span className="font-semibold text-slate-800">{category?.name || '-'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">โฟลเดอร์ที่เก็บ</span>
                    <span className="font-semibold text-slate-800">
                      {folder ? `📁 ${folder.name}` : '(รูทหมวดหมู่)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">ขนาดไฟล์ปัจจุบัน</span>
                    <span className="font-semibold text-slate-800">{formatBytes(file.sizeBytes)}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">ประเภท MIME Type</span>
                    <span className="font-semibold text-slate-800 font-mono text-[11px]">{file.mimeType}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">ผู้สร้างเอกสาร</span>
                    <span className="font-semibold text-slate-800">{file.createdByUserName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">วันที่สร้าง</span>
                    <span className="font-semibold text-slate-800">{formatThaiDate(file.createdAt)}</span>
                  </div>
                </div>

                {file.tags && file.tags.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400 block mb-1.5">แท็กที่เกี่ยวข้อง:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {file.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Permissions list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">
                    ผู้ได้รับสิทธิ์เข้าถึง ({file.sharedWith.length})
                  </h3>
                  <button
                    onClick={() => onOpenShareModal(file)}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>จัดการการแชร์</span>
                  </button>
                </div>

                {file.sharedWith.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">
                    ยังไม่มีการแชร์ให้บุคคลภายนอก (เฉพาะเจ้าของเอกสารและผู้ดูแลระบบ)
                  </p>
                ) : (
                  <div className="space-y-2">
                    {file.sharedWith.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs"
                      >
                        <span className="font-semibold text-slate-700">{p.targetName}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                          {p.role === 'editor' ? 'แก้ไขได้' : 'ดูได้อย่างเดียว'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
