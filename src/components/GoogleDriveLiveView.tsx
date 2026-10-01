import React, { useState, useEffect } from 'react';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  getGoogleAccessToken,
  initGoogleAuth
} from '../services/googleDriveAuth';
import {
  listDriveFiles,
  getDriveStorageInfo,
  createRealDriveFolder,
  uploadRealFileToDrive,
  deleteRealDriveFile,
  shareRealDriveFile,
  DriveApiFile,
  DriveStorageQuota
} from '../services/googleDriveApi';
import { useApp } from '../context/AppContext';
import {
  HardDrive,
  Upload,
  FolderPlus,
  RefreshCw,
  LogOut,
  ExternalLink,
  Trash2,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Folder,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Download
} from 'lucide-react';
import { formatBytes, formatThaiDate, getFileCategoryIconInfo } from '../utils/formatters';

export const GoogleDriveLiveView: React.FC = () => {
  const { addAuditLog } = useApp();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [driveUser, setDriveUser] = useState<{ displayName: string; emailAddress: string; photoLink?: string } | null>(null);
  const [storageQuota, setStorageQuota] = useState<DriveStorageQuota | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveApiFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search in drive
  const [driveSearch, setDriveSearch] = useState('');

  // Modals inside live view
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Share modal
  const [sharingFile, setSharingFile] = useState<DriveApiFile | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'reader' | 'writer'>('reader');
  const [shareType, setShareType] = useState<'user' | 'anyone'>('user');
  const [isSharing, setIsSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      async (user, token) => {
        setIsConnected(true);
        setDriveUser({
          displayName: user.displayName || 'Google User',
          emailAddress: user.email || '',
          photoLink: user.photoURL || undefined
        });
        loadDriveData();
      },
      () => {
        setIsConnected(false);
        setDriveUser(null);
        setStorageQuota(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadDriveData = async () => {
    setIsLoadingFiles(true);
    setError(null);
    try {
      const [files, quota] = await Promise.all([
        listDriveFiles(),
        getDriveStorageInfo().catch(() => null)
      ]);
      setDriveFiles(files);
      if (quota) setStorageQuota(quota);
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลจาก Google Drive ได้');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setIsConnected(true);
        setDriveUser({
          displayName: res.user.displayName || 'Google User',
          emailAddress: res.user.email || '',
          photoLink: res.user.photoURL || undefined
        });
        setSuccessMsg(`เชื่อมต่อ Google Drive สำเร็จ (${res.user.email})`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadDriveData();
      }
    } catch (err: any) {
      setError(err?.message || 'เข้าสู่ระบบ Google ไม่สำเร็จ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleDrive();
    setIsConnected(false);
    setDriveUser(null);
    setStorageQuota(null);
    setDriveFiles([]);
    setSuccessMsg('ออกจากระบบ Google Drive เรียบร้อย');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const newFolder = await createRealDriveFolder(newFolderName.trim());
      setSuccessMsg(`สร้างโฟลเดอร์ "${newFolder.name}" ใน Google Drive สำเร็จ!`);
      setShowCreateFolder(false);
      setNewFolderName('');
      loadDriveData();
      addAuditLog('create_folder', 'folder', `สร้างโฟลเดอร์ใน Google Drive: ${newFolder.name}`);
    } catch (err: any) {
      setError(err?.message || 'สร้างโฟลเดอร์ไม่สำเร็จ');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadRealFileToDrive(uploadFile);
      setSuccessMsg(`อัปโหลด "${uploaded.name}" เข้า Google Drive สำเร็จ!`);
      setShowUploadModal(false);
      setUploadFile(null);
      loadDriveData();
      addAuditLog('upload', 'file', `อัปโหลดไฟล์เข้า Google Drive: ${uploaded.name}`);
    } catch (err: any) {
      setError(err?.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
    } finally {
      setIsUploading(false);
    }
  };

  // MANDATORY USER CONFIRMATION FOR DESTRUCTIVE OPERATIONS (Per workspace-integration skill)
  const handleDeleteFile = async (file: DriveApiFile) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    const confirmed = window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการลบ ${isFolder ? 'โฟลเดอร์' : 'ไฟล์'} "${file.name}" จาก Google Drive จริงของคุณอย่างถาวร?\n\nการกระทำนี้จะลบข้อมูลออกจากบัญชี Google Drive ของคุณโดยตรง และไม่สามารถย้อนกลับได้`
    );
    if (!confirmed) return;

    try {
      await deleteRealDriveFile(file.id, file.name);
      setSuccessMsg(`ลบ "${file.name}" จาก Google Drive สำเร็จ`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
      addAuditLog('delete', 'file', `ลบไฟล์จาก Google Drive จริง: ${file.name}`);
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถลบไฟล์ได้');
    }
  };

  const handleShareFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingFile) return;
    setIsSharing(true);
    try {
      await shareRealDriveFile(
        sharingFile.id,
        shareRole,
        shareType,
        shareType === 'user' ? shareEmail : undefined
      );
      setSuccessMsg(`แชร์ไฟล์ "${sharingFile.name}" ใน Google Drive สำเร็จ!`);
      setSharingFile(null);
      setShareEmail('');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadDriveData();
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถแชร์ไฟล์ได้');
    } finally {
      setIsSharing(false);
    }
  };

  const filteredDriveFiles = driveFiles.filter((f) => {
    if (!driveSearch.trim()) return true;
    return f.name.toLowerCase().includes(driveSearch.toLowerCase());
  });

  const quotaLimit = storageQuota?.limit ? Number(storageQuota.limit) : 0;
  const quotaUsage = storageQuota?.usage ? Number(storageQuota.usage) : 0;
  const quotaPercent = quotaLimit > 0 ? Math.round((quotaUsage / quotaLimit) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#FFC107" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Google Drive Real Integration</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/30">
                  Google Workspace API
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                เชื่อมต่อบัญชี Google จริงเพื่อเข้าถึง อัปโหลด และจัดเก็บเอกสารใน Google Drive ของคุณ
              </p>
            </div>
          </div>

          {/* Connect / User Info Button */}
          {isConnected && driveUser ? (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
              <div className="w-8 h-8 rounded-full bg-white text-blue-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                {driveUser.photoLink ? (
                  <img src={driveUser.photoLink} alt={driveUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  driveUser.displayName.charAt(0)
                )}
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-bold">{driveUser.displayName}</div>
                <div className="text-[11px] text-blue-200">{driveUser.emailAddress}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white transition ml-1"
                title="ออกจากระบบ Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              {/* Official "Sign in with Google" Button Style */}
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-2xl shadow-md transition active:scale-95 disabled:opacity-75"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isLoggingIn ? 'กำลังเข้าสู่ระบบ Google...' : 'เข้าสู่ระบบด้วย Google เพื่อเปิด Drive'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main View when NOT connected */}
      {!isConnected && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              เชื่อมต่อ Google Drive ของคุณโดยตรง
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              เมื่อคุณเข้าสู่ระบบด้วยบัญชี Google ของคุณหรือบัญชี Google Workspace ของโรงเรียน
              ระบบ School Drive จะสามารถแสดงรายการไฟล์ อัปโหลดไฟล์ใหม่ และจัดการสิทธิ์ใน Google Drive จริงได้ทันที
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 text-slate-600">
            <span className="font-bold text-slate-800 block">คุณสมบัติเมื่อเชื่อมต่อ Google Drive จริง:</span>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ดึงรายการไฟล์และโฟลเดอร์ทั้งหมดจาก Google Drive ของคุณแบบ Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>อัปโหลดเอกสารตรงเข้าสู่คลาวด์ Google Drive ทันที</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>เปิดดูและแก้ไขเอกสารใน Google Docs, Sheets, Slides ด้วยลิงก์ตรง</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ระบบความปลอดภัยมาตรฐาน Google OAuth 2.0 (ไม่เก็บรหัสผ่านในเบราว์เซอร์)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <span>{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google และเปิดการเข้าถึง Drive'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View when CONNECTED */}
      {isConnected && (
        <div className="space-y-4">
          {/* Storage Quota Card */}
          {storageQuota && quotaLimit > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">
                    พื้นที่จัดเก็บใน Google Drive ของคุณ
                  </span>
                  <span className="text-slate-500">
                    ใช้ไป {formatBytes(quotaUsage)} จากทั้งหมด {formatBytes(quotaLimit)} ({quotaPercent}%)
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${quotaPercent > 80 ? 'bg-rose-500' : 'bg-blue-600'}`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search in real drive */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={driveSearch}
                onChange={(e) => setDriveSearch(e.target.value)}
                placeholder="ค้นหาเอกสารใน Google Drive จริง..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadDriveData}
                disabled={isLoadingFiles}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                title="รีเฟรชข้อมูลจาก Google Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>โฟลเดอร์ใหม่</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>อัปโหลดเข้า Drive จริง</span>
              </button>
            </div>
          </div>

          {/* Files List from Google Drive */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span>ไฟล์และโฟลเดอร์ใน Google Drive ({filteredDriveFiles.length} รายการ)</span>
                {isLoadingFiles && <span className="text-slate-400 font-normal">กำลังโหลด...</span>}
              </h3>
            </div>

            {filteredDriveFiles.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                {isLoadingFiles ? 'กำลังเชื่อมต่อและดึงข้อมูลจาก Google Drive...' : 'ไม่พบไฟล์ใน Google Drive ของคุณ'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ชื่อเอกสาร</th>
                      <th className="py-3 px-4">ชนิดไฟล์</th>
                      <th className="py-3 px-4">ขนาด</th>
                      <th className="py-3 px-4">แก้ไขล่าสุด</th>
                      <th className="py-3 px-4">เจ้าของ</th>
                      <th className="py-3 px-4 text-right">การจัดการใน Drive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDriveFiles.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const ownerName = file.owners?.[0]?.displayName || '-';

                      return (
                        <tr key={file.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5 max-w-md">
                              {isFolder ? (
                                <Folder className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-800 truncate" title={file.name}>
                                {file.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {isFolder ? 'Folder' : file.mimeType.split('/').pop()}
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {file.size ? formatBytes(Number(file.size)) : '-'}
                          </td>

                          <td className="py-3 px-4 text-slate-400">
                            {formatThaiDate(file.modifiedTime, false)}
                          </td>

                          <td className="py-3 px-4 text-slate-600 truncate max-w-[120px]">
                            {ownerName}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition flex items-center gap-1"
                                  title="เปิดใน Google Drive จริง"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>เปิด Drive</span>
                                </a>
                              )}

                              <button
                                onClick={() => setSharingFile(file)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="แชร์ผ่าน Google Drive API"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteFile(file)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="ลบไฟล์ออกจาก Google Drive จริง"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Create Folder in Google Drive */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              สร้างโฟลเดอร์ใหม่ใน Google Drive จริง
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              โฟลเดอร์นี้จะปรากฏในบัญชี Google Drive ของคุณทันที
            </p>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อโฟลเดอร์</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="เช่น เอกสารวิชาการ 2569"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow"
                >
                  {isCreatingFolder ? 'กำลังสร้าง...' : 'สร้างโฟลเดอร์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload File to Google Drive */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              อัปโหลดไฟล์เข้าสู่ Google Drive จริง
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ไฟล์จะถูกอัปโหลดขึ้นไปยัง Google Drive ของคุณโดยตรงผ่าน Drive REST API
            </p>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกไฟล์จากเครื่อง</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-xl p-1 bg-slate-50"
                />
                {uploadFile && (
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    ขนาด: {formatBytes(uploadFile.size)}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow"
                >
                  {isUploading ? 'กำลังอัปโหลดขึ้น Drive...' : 'เริ่มอัปโหลด'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Share in Google Drive */}
      {sharingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              แชร์สิทธิ์ใน Google Drive
            </h3>
            <p className="text-xs text-slate-500 truncate">
              เอกสาร: {sharingFile.name}
            </p>

            {sharingFile.webViewLink && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <span className="truncate max-w-xs text-slate-600 font-mono text-[11px]">
                  {sharingFile.webViewLink}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sharingFile.webViewLink || '');
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleShareFile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รูปแบบการแชร์</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShareType('user')}
                    className={`py-1.5 px-3 rounded-xl border transition ${shareType === 'user' ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600'}`}
                  >
                    ระบุอีเมลผู้รับ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareType('anyone')}
                    className={`py-1.5 px-3 rounded-xl border transition ${shareType === 'anyone' ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600'}`}
                  >
                    ทุกคนที่มีลิงก์
                  </button>
                </div>
              </div>

              {shareType === 'user' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อีเมลผู้รับ (Gmail / Google Workspace)</label>
                  <input
                    type="email"
                    required
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="user@school.ac.th"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สิทธิ์ที่ให้</label>
                <select
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="reader">ดูได้อย่างเดียว (Reader)</option>
                  <option value="writer">แก้ไขได้ (Writer/Editor)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSharingFile(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSharing || (shareType === 'user' && !shareEmail)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold shadow"
                >
                  {isSharing ? 'กำลังแชร์...' : 'ยืนยันแชร์สิทธิ์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
