import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile, Folder } from '../types';
import {
  Share2,
  X,
  Users,
  User,
  Globe,
  Link,
  Copy,
  Check,
  Trash2,
  Shield,
  AlertCircle,
  Building
} from 'lucide-react';
import { formatThaiDate } from '../utils/formatters';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file?: DocumentFile | null;
  folder?: Folder | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  file,
  folder
}) => {
  const {
    currentUser,
    users,
    groups,
    shareDocument,
    shareFolder,
    removeShare,
    removeFolderShare,
    togglePublicLink,
    settings
  } = useApp();

  const [shareType, setShareType] = useState<'user' | 'group' | 'everyone' | 'public'>('user');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [permissionRole, setPermissionRole] = useState<'viewer' | 'editor'>('viewer');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || (!file && !folder)) return null;

  const targetName = file ? file.name : folder?.name;
  const isTargetFolder = !!folder;
  const currentShares = file ? file.sharedWith : (folder ? folder.sharedWith : []);

  const handleAddShare = (e: React.FormEvent) => {
    e.preventDefault();

    let resolvedName = '';
    if (shareType === 'user') {
      const u = users.find((x) => x.id === selectedTargetId);
      if (!u) return;
      resolvedName = `${u.name} (${u.role})`;
    } else if (shareType === 'group') {
      const g = groups.find((x) => x.id === selectedTargetId);
      if (!g) return;
      resolvedName = `กลุ่ม: ${g.name}`;
    } else if (shareType === 'everyone') {
      resolvedName = 'ทุกคนในโรงเรียน/หน่วยงาน';
    }

    if (file) {
      shareDocument(file.id, {
        targetType: shareType,
        targetId: shareType === 'everyone' ? undefined : selectedTargetId,
        targetName: resolvedName,
        role: permissionRole
      });
    } else if (folder) {
      shareFolder(folder.id, {
        targetType: shareType,
        targetId: shareType === 'everyone' ? undefined : selectedTargetId,
        targetName: resolvedName,
        role: permissionRole
      });
    }

    setSelectedTargetId('');
  };

  const handleRemoveShare = (shareId: string) => {
    if (file) {
      removeShare(file.id, shareId);
    } else if (folder) {
      removeFolderShare(folder.id, shareId);
    }
  };

  const handleCopyPublicLink = () => {
    if (!file) return;
    const dummyUrl = `${window.location.origin}/share/${file.publicLinkId || file.id}`;
    navigator.clipboard.writeText(dummyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-sm">
                แชร์ "{targetName}"
              </h3>
              <p className="text-xs text-slate-500">
                {isTargetFolder
                  ? 'แชร์ทั้งโฟลเดอร์ (เอกสารทุกไฟล์ภายในจะได้รับสิทธิ์ตามโฟลเดอร์นี้)'
                  : 'กำหนดสิทธิ์การดูหรือแก้ไขให้รายคน กลุ่ม หรือสาธารณะ'}
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

        <div className="p-6 space-y-5">
          {/* Public Link Card (Requirement: เป็นลิงก์สาธารณะให้คนนอกเปิดได้ - ผู้ดูแลต้องเปิดใช้ก่อน) */}
          {file && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      ลิงก์สาธารณะ (เปิดให้คนนอกดูได้)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {settings.isPublicLinkGlobalEnabled
                        ? 'ทุกคนที่มีลิงก์สามารถเปิดดูเอกสารนี้ได้ทันที'
                        : 'ผู้ดูแลระบบปิดใช้งานลิงก์สาธารณะในระบบ'}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!settings.isPublicLinkGlobalEnabled}
                    checked={!!file.isPublicLinkEnabled}
                    onChange={(e) => togglePublicLink(file.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>

              {file.isPublicLinkEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-600 truncate">
                    {window.location.origin}/share/{file.publicLinkId || file.id}
                  </div>
                  <button
                    onClick={handleCopyPublicLink}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add New Share Form */}
          <form onSubmit={handleAddShare} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              เพิ่มผู้มีสิทธิ์เข้าถึง:
            </label>

            {/* Target Type Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setShareType('user');
                  setSelectedTargetId(users[1]?.id || '');
                }}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                  shareType === 'user'
                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>รายคน</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShareType('group');
                  setSelectedTargetId(groups[0]?.id || '');
                }}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                  shareType === 'group'
                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>กลุ่มผู้ใช้</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShareType('everyone');
                  setSelectedTargetId('');
                }}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                  shareType === 'everyone'
                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>ทุกคนใน รร.</span>
              </button>
            </div>

            {/* Target Details */}
            <div className="flex gap-2">
              {shareType === 'user' && (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="flex-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกครูหรือบุคลากร --</option>
                  {users
                    .filter((u) => u.id !== currentUser?.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role} - {u.email})
                      </option>
                    ))}
                </select>
              )}

              {shareType === 'group' && (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="flex-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกกลุ่มสาระ / คณะทำงาน --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      👥 {g.name} ({g.memberUserIds.length} คน)
                    </option>
                  ))}
                </select>
              )}

              {shareType === 'everyone' && (
                <div className="flex-1 py-2 px-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>บุคลากรและคุณครูทุกคนในโรงเรียนจะได้รับสิทธิ์นี้</span>
                </div>
              )}

              {/* Permission Role Selector */}
              <select
                value={permissionRole}
                onChange={(e) => setPermissionRole(e.target.value as 'viewer' | 'editor')}
                className="w-28 py-2 px-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">ดูได้ (Viewer)</option>
                <option value="editor">แก้ไขได้ (Editor)</option>
              </select>

              <button
                type="submit"
                disabled={shareType !== 'everyone' && !selectedTargetId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                แชร์
              </button>
            </div>
          </form>

          {/* List of current share permissions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              ผู้ได้รับสิทธิ์ในปัจจุบัน ({currentShares.length} รายการ):
            </span>

            <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
              {currentShares.length === 0 ? (
                <div className="text-xs text-slate-400 py-2 text-center">
                  ยังไม่ได้แชร์ให้บุคคลหรือกลุ่มใด (เป็นเอกสารส่วนตัว)
                </div>
              ) : (
                currentShares.map((p) => (
                  <div
                    key={p.id}
                    className="pt-2 flex items-center justify-between text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {p.targetType === 'user' ? (
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : p.targetType === 'group' ? (
                        <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {p.targetName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          แชร์เมื่อ: {formatThaiDate(p.grantedAt, false)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.role === 'editor'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.role === 'editor' ? 'แก้ไขได้' : 'ดูได้อย่างเดียว'}
                      </span>
                      <button
                        onClick={() => handleRemoveShare(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="ถอนสิทธิ์ (ลิงก์ Drive เดิมจะใช้งานไม่ได้ทันที)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            ระบบจัดการสิทธิ์ Google Drive อัตโนมัติ (ถอนแชร์แล้วลิงก์จะตัดทันที)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
