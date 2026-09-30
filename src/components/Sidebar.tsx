import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Folder,
  FileText,
  Users,
  Star,
  Trash2,
  HardDrive,
  Settings,
  Upload,
  FolderPlus,
  Share2,
  Bookmark,
  Building2,
  GraduationCap,
  Coins,
  FolderArchive,
  DatabaseBackup,
  Layers,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (catId: string | null) => void;
  onOpenUploadModal: () => void;
  onOpenCreateFolderModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedCategoryId,
  setSelectedCategoryId,
  onOpenUploadModal,
  onOpenCreateFolderModal
}) => {
  const {
    currentUser,
    categories,
    files,
    settings,
    folders
  } = useApp();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Coins':
        return <Coins className="w-4 h-4" />;
      case 'FolderArchive':
        return <FolderArchive className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };

  // Counts
  const activeFiles = files.filter((f) => !f.isTrash);
  const trashFilesCount = files.filter((f) => f.isTrash).length;
  const starredCount = activeFiles.filter((f) => f.isStarred).length;
  const templatesCount = activeFiles.filter((f) => f.isTemplate).length;
  
  // Shared with me files
  const sharedWithMeCount = activeFiles.filter((f) => {
    if (!currentUser) return false;
    return f.sharedWith.some(
      (p) =>
        p.targetId === currentUser.id ||
        (p.targetType === 'group' && currentUser.groupIds.includes(p.targetId || '')) ||
        p.targetType === 'everyone'
    ) && f.createdByUserId !== currentUser.id;
  }).length;

  const storageUsed = currentUser?.storageUsedBytes || 0;
  const storageQuota = currentUser?.storageQuotaBytes || (settings.userDefaultQuotaMB * 1024 * 1024);
  const storagePercent = Math.min(100, Math.round((storageUsed / storageQuota) * 100));

  const isViewer = currentUser?.role === 'viewer';
  const isAdmin = currentUser?.role === 'admin';
  const isHeadOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'head';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      {/* Upload & Action CTA Buttons */}
      <div className="p-4 space-y-2 border-b border-slate-100">
        {!isViewer && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenUploadModal}
              disabled={settings.isMaintenanceMode && !isAdmin}
              className="col-span-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>อัปโหลด</span>
            </button>

            <button
              onClick={onOpenCreateFolderModal}
              disabled={settings.isMaintenanceMode && !isAdmin}
              className="col-span-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-semibold transition active:scale-95"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
              <span>โฟลเดอร์</span>
            </button>
          </div>
        )}

        {isViewer && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>สิทธิ์ผู้อ่าน (ดูและดาวน์โหลดเท่านั้น)</span>
          </div>
        )}
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 px-3 py-3 space-y-6">
        {/* Section 1: Standard Drive Navigation */}
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-1">
            พื้นที่เอกสาร
          </div>

          <button
            onClick={() => {
              setActiveTab('all_docs');
              setSelectedCategoryId(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'all_docs' && selectedCategoryId === null
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>ไดรฟ์ของฉัน / เอกสารทั้งหมด</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {activeFiles.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('shared_with_me');
              setSelectedCategoryId(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'shared_with_me'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-indigo-500" />
              <span>แชร์กับฉัน</span>
            </div>
            {sharedWithMeCount > 0 && (
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.2 rounded-full">
                {sharedWithMeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('starred');
              setSelectedCategoryId(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'starred'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-500" />
              <span>รายการโปรด</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {starredCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('templates');
              setSelectedCategoryId(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'templates'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span>เทมเพลตแบบฟอร์มกลาง</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded">
              {templatesCount} ฟอร์ม
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trash');
              setSelectedCategoryId(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'trash'
                ? 'bg-rose-50 text-rose-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>ถังขยะ</span>
            </div>
            {trashFilesCount > 0 && (
              <span className="text-[10px] bg-rose-100 text-rose-700 font-medium px-1.5 py-0.2 rounded-full">
                {trashFilesCount} (30 วัน)
              </span>
            )}
          </button>
        </div>

        {/* Section 2: 5 Default Categories (บริหาร, วิชาการ, บุคคล, การเงิน, อื่นๆ) */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              5 หมวดหมู่เอกสารหลัก
            </span>
          </div>

          {categories.map((cat) => {
            const count = activeFiles.filter((f) => f.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id && activeTab === 'all_docs';

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab('all_docs');
                  setSelectedCategoryId(cat.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={isSelected ? 'text-blue-600' : 'text-slate-500'}>
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-normal">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section 3: Backup & Recovery + Admin Tools (for Admin & Heads) */}
        {isHeadOrAdmin && (
          <div className="space-y-0.5 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-1">
              การบริหารและสำรองข้อมูล
            </div>

            <button
              onClick={() => {
                setActiveTab('backup');
                setSelectedCategoryId(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'backup'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DatabaseBackup className="w-4 h-4 text-emerald-600" />
                <span>สำรองข้อมูลและกู้คืน</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setSelectedCategoryId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'admin'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>ดูแลระบบ (Admin)</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Storage Quota Gauge Widget (Requirement: พื้นที่ใช้งาน ดูได้ว่าใช้ไปเท่าไร และตั้งโควตาต่อคนได้) */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            พื้นที่ใช้งานส่วนตัว
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              storagePercent > 90
                ? 'bg-rose-500'
                : storagePercent > 70
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
          <span>ใช้ไป {storagePercent}%</span>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className="text-blue-600 hover:underline"
            >
              ตั้งค่าโควตา
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
