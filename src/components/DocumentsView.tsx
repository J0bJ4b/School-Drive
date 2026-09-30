import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentFile, Folder } from '../types';
import {
  Folder as FolderIcon,
  FileText,
  Upload,
  FolderPlus,
  Download,
  Share2,
  Star,
  MoreVertical,
  ChevronRight,
  Home,
  Grid,
  List,
  Eye,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  Link,
  Layers,
  ArrowUpDown,
  Lock
} from 'lucide-react';
import {
  formatBytes,
  formatThaiDate,
  getFileCategoryIconInfo,
  exportDocumentsToCSV
} from '../utils/formatters';

interface DocumentsViewProps {
  searchQuery: string;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  onOpenUploadModal: (folderId?: string | null) => void;
  onOpenCreateFolderModal: (folderId?: string | null) => void;
  onOpenShareModal: (file?: DocumentFile, folder?: Folder) => void;
  onOpenUploadNewVersionModal: (file: DocumentFile) => void;
  onOpenFileViewer: (file: DocumentFile) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  searchQuery,
  selectedCategoryId,
  setSelectedCategoryId,
  onOpenUploadModal,
  onOpenCreateFolderModal,
  onOpenShareModal,
  onOpenUploadNewVersionModal,
  onOpenFileViewer
}) => {
  const {
    currentUser,
    categories,
    folders,
    files,
    toggleStarFile,
    moveFileToTrash,
    canUserEditFile,
    canUserViewFile,
    canUserEditFolder,
    canExportCSV,
    settings
  } = useApp();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'size'>('updated');
  const [activeDropdownFileId, setActiveDropdownFileId] = useState<string | null>(null);

  // Current folder and breadcrumbs chain
  const currentFolder = folders.find((f) => f.id === currentFolderId);

  // If user selected a category, sync or keep current category
  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  // Breadcrumbs generator up to 10 levels
  const breadcrumbs = useMemo(() => {
    const list: { id: string | null; name: string }[] = [];
    if (!currentFolderId) {
      if (selectedCategoryId) {
        const cat = categories.find((c) => c.id === selectedCategoryId);
        list.push({ id: null, name: cat ? cat.name : 'ทั้งหมด' });
      } else {
        list.push({ id: null, name: 'เอกสารทั้งหมด' });
      }
      return list;
    }

    let curr: Folder | undefined = folders.find((f) => f.id === currentFolderId);
    while (curr) {
      list.unshift({ id: curr.id, name: curr.name });
      if (curr.parentFolderId) {
        curr = folders.find((f) => f.id === curr?.parentFolderId);
      } else {
        break;
      }
    }

    // Add category root if present
    if (selectedCategoryId) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      list.unshift({ id: null, name: cat ? cat.name : 'หมวดหมู่' });
    } else {
      list.unshift({ id: null, name: 'เอกสารทั้งหมด' });
    }

    return list;
  }, [currentFolderId, selectedCategoryId, categories, folders]);

  // Navigate folder
  const handleNavigateFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    if (folderId) {
      const f = folders.find((item) => item.id === folderId);
      if (f && f.categoryId !== selectedCategoryId) {
        setSelectedCategoryId(f.categoryId);
      }
    }
  };

  // Filtered Folders
  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      if (searchQuery.trim()) {
        return folder.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (selectedCategoryId && folder.categoryId !== selectedCategoryId) {
        return false;
      }
      if (currentFolderId) {
        return folder.parentFolderId === currentFolderId;
      }
      return folder.parentFolderId === null;
    });
  }, [folders, selectedCategoryId, currentFolderId, searchQuery]);

  // Filtered Files
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Exclude trash
        if (file.isTrash) return false;

        // Permissions check
        if (!canUserViewFile(file)) return false;

        // Search Query check (name or tags)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = file.name.toLowerCase().includes(q);
          const matchTags = file.tags.some((t) => t.toLowerCase().includes(q));
          const matchAuthor = file.createdByUserName.toLowerCase().includes(q);
          return matchName || matchTags || matchAuthor;
        }

        // Category filter
        if (selectedCategoryId && file.categoryId !== selectedCategoryId) {
          return false;
        }

        // Folder filter (if inside folder vs root)
        if (currentFolderId) {
          if (file.folderId !== currentFolderId) return false;
        } else {
          // If searching or in root of category
          if (file.folderId !== null && selectedCategoryId) return false;
        }

        // File Type Filter
        if (selectedFileType !== 'all') {
          const ext = file.extension.toLowerCase();
          if (selectedFileType === 'pdf' && ext !== 'pdf') return false;
          if (selectedFileType === 'docs' && !['doc', 'docx', 'txt', 'rtf'].includes(ext)) return false;
          if (selectedFileType === 'sheets' && !['xls', 'xlsx', 'csv'].includes(ext)) return false;
          if (selectedFileType === 'slides' && !['ppt', 'pptx'].includes(ext)) return false;
          if (selectedFileType === 'images' && !['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'th');
        if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
        // Default: updated
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [files, selectedCategoryId, currentFolderId, selectedFileType, sortBy, searchQuery, canUserViewFile]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const catMap: Record<string, string> = {};
    categories.forEach((c) => {
      catMap[c.id] = c.name;
    });
    exportDocumentsToCSV(filteredFiles, catMap);
  };

  const isViewer = currentUser?.role === 'viewer';

  return (
    <div className="space-y-4">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap overflow-x-auto py-1">
          <button
            onClick={() => {
              handleNavigateFolder(null);
              setSelectedCategoryId(null);
            }}
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 px-2 py-1 rounded-lg transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>หน้าหลัก</span>
          </button>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => handleNavigateFolder(crumb.id)}
                className={`px-2 py-1 rounded-lg font-medium transition max-w-[200px] truncate ${
                  idx === breadcrumbs.length - 1
                    ? 'font-bold text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}

          {currentFolder && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              ชั้นที่ {currentFolder.depth}/10
            </span>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export CSV (Only for Admin & Head) */}
          {canExportCSV && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
              title="ส่งออกรายการเอกสารเป็นไฟล์ CSV / Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก CSV</span>
            </button>
          )}

          {!isViewer && (
            <>
              <button
                onClick={() => onOpenCreateFolderModal(currentFolderId)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">โฟลเดอร์</span>
              </button>

              <button
                onClick={() => onOpenUploadModal(currentFolderId)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>อัปโหลด</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and View Switch Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* File Type Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'pdf', label: 'PDF' },
            { id: 'docs', label: 'เอกสาร (Word)' },
            { id: 'sheets', label: 'ตาราง (Excel)' },
            { id: 'slides', label: 'สไลด์ (PPT)' },
            { id: 'images', label: 'รูปภาพ' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedFileType(type.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedFileType === type.id
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Sort & Grid/List switches */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'name' | 'size')}
              className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="updated">เรียงตามวันที่แก้ไขล่าสุด</option>
              <option value="name">เรียงตามชื่อ ก-ฮ (A-Z)</option>
              <option value="size">เรียงตามขนาดไฟล์</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="มุมมองตารางการ์ด (Grid View)"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="มุมมองรายการ (List View)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: FOLDERS LIST */}
      {filteredFolders.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FolderIcon className="w-3.5 h-3.5" />
            <span>โฟลเดอร์ ({filteredFolders.length})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredFolders.map((folder) => {
              const childCount = files.filter(
                (f) => f.folderId === folder.id && !f.isTrash
              ).length;

              return (
                <div
                  key={folder.id}
                  onClick={() => handleNavigateFolder(folder.id)}
                  className="group relative bg-white hover:bg-blue-50/40 p-3 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm transition cursor-pointer flex flex-col justify-between h-24"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                      <FolderIcon className="w-5 h-5 fill-amber-400 text-amber-500" />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        L{folder.depth}
                      </span>
                      {folder.sharedWith.length > 0 && (
                        <Share2 className="w-3 h-3 text-indigo-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 truncate group-hover:text-blue-700">
                      {folder.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {childCount} เอกสาร
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: FILES LIST */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>เอกสารทั้งหมด ({filteredFiles.length} รายการ)</span>
          {searchQuery && (
            <span className="text-blue-600 normal-case">
              ผลการค้นหา: "{searchQuery}"
            </span>
          )}
        </div>

        {filteredFiles.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">ไม่พบเอกสารในส่วนนี้</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? 'ลองค้นหาด้วยคำอื่น หรือล้างตัวกรอง'
                  : 'เริ่มต้นอัปโหลดเอกสารใหม่ หรือสร้างโฟลเดอร์สำหรับจัดเก็บ'}
              </p>
            </div>
            {!isViewer && (
              <button
                onClick={() => onOpenUploadModal(currentFolderId)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>อัปโหลดเอกสารตอนนี้</span>
              </button>
            )}
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && filteredFiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredFiles.map((file) => {
              const icon = getFileCategoryIconInfo(file.extension);
              const canEdit = canUserEditFile(file);

              return (
                <div
                  key={file.id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between relative"
                >
                  {/* Card Top: Extension badge, version badge, Star */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${icon.bg} ${icon.color}`}
                        >
                          {icon.label}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          v{file.currentVersion}
                        </span>
                        {file.isTemplate && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Template
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleStarFile(file.id)}
                        className={`p-1 rounded-lg transition ${
                          file.isStarred
                            ? 'text-amber-500 fill-current'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* File Title */}
                    <h3
                      onClick={() => onOpenFileViewer(file)}
                      className="font-bold text-xs text-slate-800 hover:text-blue-600 cursor-pointer line-clamp-2 leading-relaxed"
                      title={file.name}
                    >
                      {file.name}
                    </h3>

                    {/* Metadata line */}
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                      <span>{formatBytes(file.sizeBytes)}</span>
                      <span>·</span>
                      <span className="truncate max-w-[120px]">
                        {file.createdByUserName}
                      </span>
                    </div>

                    {/* Tags */}
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2.5 overflow-hidden">
                        {file.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 border border-slate-100 text-slate-500"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenFileViewer(file)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>เปิดดู</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenShareModal(file)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="แชร์เอกสาร"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => onOpenUploadNewVersionModal(file)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="อัปโหลดเวอร์ชันใหม่ทับ"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => moveFileToTrash(file.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="ย้ายลงถังขยะ (กู้คืนได้ใน 30 วัน)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && filteredFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">ชื่อเอกสาร</th>
                    <th className="py-3 px-4">เวอร์ชัน</th>
                    <th className="py-3 px-4">ขนาด</th>
                    <th className="py-3 px-4">ผู้จัดทำ</th>
                    <th className="py-3 px-4">แก้ไขล่าสุด</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => {
                    const icon = getFileCategoryIconInfo(file.extension);
                    const canEdit = canUserEditFile(file);

                    return (
                      <tr
                        key={file.id}
                        className="hover:bg-slate-50/80 transition group"
                      >
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => toggleStarFile(file.id)}
                            className={`p-1 rounded ${
                              file.isStarred
                                ? 'text-amber-500 fill-current'
                                : 'text-slate-300 hover:text-amber-400'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </td>

                        <td className="py-2.5 px-4">
                          <div
                            onClick={() => onOpenFileViewer(file)}
                            className="flex items-center gap-2.5 cursor-pointer max-w-md"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${icon.bg} ${icon.color}`}
                            >
                              {icon.label}
                            </span>
                            <span className="font-semibold text-slate-800 hover:text-blue-600 truncate">
                              {file.name}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            v{file.currentVersion}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 font-mono text-slate-500">
                          {formatBytes(file.sizeBytes)}
                        </td>

                        <td className="py-2.5 px-4 text-slate-600">
                          {file.createdByUserName}
                        </td>

                        <td className="py-2.5 px-4 text-slate-400">
                          {formatThaiDate(file.updatedAt, false)}
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenFileViewer(file)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition"
                            >
                              เปิดดู
                            </button>

                            <button
                              onClick={() => onOpenShareModal(file)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                              title="แชร์"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            {canEdit && (
                              <button
                                onClick={() => moveFileToTrash(file.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                title="ย้ายลงถังขยะ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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
    </div>
  );
};
