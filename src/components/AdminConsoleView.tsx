import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog, User } from '../types';
import {
  Settings,
  History,
  HardDrive,
  Wrench,
  Trash2,
  ShieldAlert,
  Users,
  Key,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Check,
  Search,
  Filter,
  Eye,
  Edit,
  Clock,
  Save,
  Building
} from 'lucide-react';
import {
  formatBytes,
  formatThaiDate,
  getRoleLabel,
  getDepartmentLabel
} from '../utils/formatters';

export const AdminConsoleView: React.FC = () => {
  const {
    currentUser,
    settings,
    updateSettings,
    auditLogs,
    users,
    adminResetPassword,
    updateUserQuota,
    runDataCheckAndRepair,
    previewRetentionCleanup,
    executeRetentionCleanup,
    resetAllToInitialData,
    categories,
    files
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'logs' | 'quota' | 'repair' | 'retention' | 'settings' | 'users'
  >('logs');

  // Logs filters
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');

  // Settings form
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [systemName, setSystemName] = useState(settings.systemName);
  const [loginMode, setLoginMode] = useState(settings.loginMode);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(settings.maxFileSizeMB);
  const [disallowedExts, setDisallowedExts] = useState(
    settings.disallowedExtensions.join(', ')
  );
  const [autoBackupTime, setAutoBackupTime] = useState(settings.autoBackupTime);
  const [publicLinksEnabled, setPublicLinksEnabled] = useState(
    settings.isPublicLinkGlobalEnabled
  );
  const [maintenanceMode, setMaintenanceMode] = useState(settings.isMaintenanceMode);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Repair Modal/State
  const [repairResult, setRepairResult] = useState<{
    preBackupId: string;
    repairedItemsCount: number;
    details: string[];
  } | null>(null);

  // Retention cleanup preview & confirmation state
  const [retentionPreview, setRetentionPreview] = useState<{
    trashExpiredFiles: any[];
    oldVersionsCount: number;
    oldLogsCount: number;
  } | null>(null);
  const [retentionNotice, setRetentionNotice] = useState<string | null>(null);

  // Quota editing state
  const [editingQuotaUserId, setEditingQuotaUserId] = useState<string | null>(null);
  const [newQuotaGB, setNewQuotaGB] = useState<number>(5);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น</h3>
        <p className="text-xs text-slate-500 mt-1">
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้าตั้งค่าและดูแลระบบขั้นสูง
        </p>
      </div>
    );
  }

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((log) => {
    if (logActionFilter !== 'all' && log.action !== logActionFilter) {
      return false;
    }
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.targetName.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const exts = disallowedExts
      .split(',')
      .map((s) => s.trim().toLowerCase().replace('.', ''))
      .filter(Boolean);

    updateSettings({
      schoolName,
      systemName,
      loginMode,
      maxFileSizeMB: Number(maxFileSizeMB),
      disallowedExtensions: exts,
      autoBackupTime,
      isPublicLinkGlobalEnabled: publicLinksEnabled,
      isMaintenanceMode: maintenanceMode
    });

    setSettingsNotice('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    setTimeout(() => setSettingsNotice(null), 3500);
  };

  const handleExecuteRepair = () => {
    const res = runDataCheckAndRepair();
    setRepairResult(res);
  };

  const handleLoadRetentionPreview = () => {
    const preview = previewRetentionCleanup();
    setRetentionPreview(preview);
  };

  const handleConfirmRetentionCleanup = () => {
    const res = executeRetentionCleanup();
    setRetentionNotice(
      `ดำเนินการล้างข้อมูลเรียบร้อย: ลบถังขยะเก่า ${res.deletedTrashCount} ไฟล์`
    );
    setRetentionPreview(null);
    setTimeout(() => setRetentionNotice(null), 4000);
  };

  const handleSaveUserQuota = (userId: string) => {
    updateUserQuota(userId, newQuotaGB * 1024 * 1024 * 1024);
    setEditingQuotaUserId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Console Navigation Tabs */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'logs', label: 'ประวัติกิจกรรม (Audit Log)', icon: History },
            { id: 'quota', label: 'พื้นที่ใช้งานและโควตา', icon: HardDrive },
            { id: 'users', label: 'ผู้ใช้และรีเซ็ตรหัส', icon: Users },
            { id: 'repair', label: 'ตรวจและซ่อมข้อมูล', icon: Wrench },
            { id: 'retention', label: 'ล้างข้อมูลตามอายุ', icon: Trash2 },
            { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้น (Factory Reset) หรือไม่?')) {
              resetAllToInitialData();
            }
          }}
          className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition"
        >
          รีเซ็ตข้อมูลระบบเริ่มต้น
        </button>
      </div>

      {settingsNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{settingsNotice}</span>
        </div>
      )}

      {/* 1. AUDIT LOGS (Requirement: ดูได้ทั้งหมดว่าใครเปิด แก้ แชร์ หรือลบอะไร) */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ประวัติกิจกรรมการใช้งานทั้งหมด ({auditLogs.length} บันทึก)
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกการเปิดอ่าน แก้ไข แชร์ ลบ อัปโหลด และการเข้าสู่ระบบ
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="ค้นหาชื่อผู้ใช้หรือเอกสาร..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={logActionFilter}
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทุกกิจกรรม</option>
                <option value="login">การเข้าสู่ระบบ (Login)</option>
                <option value="upload">อัปโหลดไฟล์ (Upload)</option>
                <option value="share">การแชร์ (Share)</option>
                <option value="edit">การแก้ไข (Edit)</option>
                <option value="delete">การลบ (Delete)</option>
                <option value="restore">การกู้คืน (Restore)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">วัน-เวลา</th>
                  <th className="py-2.5 px-4">ผู้ใช้งาน</th>
                  <th className="py-2.5 px-4">กิจกรรม</th>
                  <th className="py-2.5 px-4">เป้าหมาย</th>
                  <th className="py-2.5 px-4">รายละเอียดเพิ่มเติม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatThaiDate(log.timestamp)}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-800">{log.userName}</div>
                      <span className="text-[10px] text-slate-400">
                        {getRoleLabel(log.userRole)}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.action === 'delete'
                            ? 'bg-rose-100 text-rose-800'
                            : log.action === 'share'
                            ? 'bg-indigo-100 text-indigo-800'
                            : log.action === 'upload'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'login'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {log.targetName}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. STORAGE QUOTA (Requirement: พื้นที่ใช้งาน: ดูได้ว่าใช้ไปเท่าไร และตั้งโควตาต่อคนได้) */}
      {activeSubTab === 'quota' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                พื้นที่ระบบโรงเรียนทั้งหมด
              </span>
              <div className="text-2xl font-bold text-slate-900">
                {settings.totalSystemStorageGB} GB
              </div>
              <p className="text-xs text-slate-500 mt-1">คลาวด์ไดรฟ์ของโรงเรียน</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                พื้นที่ใช้งานรวมปัจจุบัน
              </span>
              <div className="text-2xl font-bold text-blue-600">
                {formatBytes(
                  users.reduce((acc, u) => acc + (u.storageUsedBytes || 0), 0)
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">จากบุคลากรทุกคนในระบบ</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                โควตาเริ่มต้นต่อคน
              </span>
              <div className="text-2xl font-bold text-emerald-600">
                {(settings.userDefaultQuotaMB / 1024).toFixed(0)} GB
              </div>
              <p className="text-xs text-slate-500 mt-1">สามารถปรับแยกตามรายคนได้</p>
            </div>
          </div>

          {/* User Quotas Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                จัดการโควตาพื้นที่รายบุคคล
              </h3>
              <span className="text-xs text-slate-400">
                คลิก "แก้ไขโควตา" เพื่อปรับขนาดพื้นที่เก็บเอกสาร
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ชื่อบุคลากร</th>
                    <th className="py-3 px-4">บทบาท / ฝ่าย</th>
                    <th className="py-3 px-4">ใช้ไปแล้ว</th>
                    <th className="py-3 px-4">โควตาสูงสุด</th>
                    <th className="py-3 px-4 w-48">สัดส่วนพื้นที่</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const pct = Math.min(
                      100,
                      Math.round((u.storageUsedBytes / u.storageQuotaBytes) * 100)
                    );
                    const isEditing = editingQuotaUserId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{u.name}</div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            @{u.username} · {u.email}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700 block">
                            {getRoleLabel(u.role)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {getDepartmentLabel(u.department)}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {formatBytes(u.storageUsedBytes)}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={newQuotaGB}
                                onChange={(e) => setNewQuotaGB(Number(e.target.value))}
                                className="w-16 p-1 border rounded text-xs"
                              />
                              <span>GB</span>
                            </div>
                          ) : (
                            formatBytes(u.storageQuotaBytes)
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            ใช้ไป {pct}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveUserQuota(u.id)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={() => setEditingQuotaUserId(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingQuotaUserId(u.id);
                                setNewQuotaGB(
                                  Math.round(u.storageQuotaBytes / (1024 * 1024 * 1024)) || 5
                                );
                              }}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                            >
                              แก้ไขโควตา
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. USER MANAGEMENT & RESET PASSWORD (Requirement: รีเซ็ตรหัสผ่าน: ผู้ดูแลรีเซ็ตให้ได้ ผู้ใช้ต้องเปลี่ยนรหัสใหม่ตอนเข้าครั้งแรก) */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                จัดการบัญชีผู้ใช้และรีเซ็ตรหัสผ่าน
              </h3>
              <p className="text-xs text-slate-500">
                เมื่อผู้ดูแลรีเซ็ตรหัสผ่าน รหัสจะกลับไปเป็น "A12345678+" และบังคับให้ผู้ใช้เปลี่ยนรหัสผ่านใหม่ทันทีตอนเข้าใช้งานครั้งแรก
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ชื่อผู้ใช้ (Username)</th>
                  <th className="py-3 px-4">ชื่อ-สกุล</th>
                  <th className="py-3 px-4">สิทธิ์ / ฝ่าย</th>
                  <th className="py-3 px-4">สถานะรหัสผ่าน</th>
                  <th className="py-3 px-4">สถานะบัญชี (Brute-force)</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isLocked = u.lockUntil && u.lockUntil > Date.now();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        @{u.username}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{u.name}</div>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block">
                          {getRoleLabel(u.role)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {getDepartmentLabel(u.department)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {u.mustChangePassword ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            ต้องเปลี่ยนรหัสใหม่ตอนเข้า
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            ตั้งรหัสส่วนตัวแล้ว
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isLocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                            ถูกระงับ 15 นาที (ใส่ผิด 5 ครั้ง)
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">ปกติ</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันรีเซ็ตรหัสผ่านของ ${u.name}? ผู้ใช้จะต้องเปลี่ยนรหัสใหม่ตอนเข้าสู่ระบบ`)) {
                              adminResetPassword(u.id);
                              alert(`รีเซ็ตรหัสผ่านของ ${u.name} สำเร็จ! รหัสผ่านเริ่มต้นคือ A12345678+`);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ml-auto"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>รีเซ็ตรหัสผ่าน</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DATA CHECK & REPAIR (Requirement: ตรวจและซ่อมข้อมูล: ระบบสำรองให้ก่อนซ่อมทุกครั้ง) */}
      {activeSubTab === 'repair' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                เครื่องมือตรวจและซ่อมแซมข้อมูลอัตโนมัติ (Data Integrity Check & Repair)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ระบบจะตรวจสอบความสอดคล้องของโครงสร้างโฟลเดอร์ ไฟล์กำพร้า และความลึกของโฟลเดอร์
                <br />
                <span className="font-semibold text-emerald-700">
                  * มาตรการความปลอดภัย: ระบบจะสร้างจุดสำรองข้อมูล (Safety Snapshot) ให้อัตโนมัติก่อนเริ่มการซ่อมแซมเสมอ
                </span>
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExecuteRepair}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>เริ่มกระบวนการตรวจและซ่อมแซมข้อมูล</span>
            </button>
          </div>

          {repairResult && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>การตรวจและซ่อมแซมเสร็จสิ้นอย่างสมบูรณ์</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                สร้างจุดสำรองความปลอดภัยอัตโนมัติ: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{repairResult.preBackupId}</code>
              </p>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 space-y-1">
                {repairResult.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. RETENTION CLEANUP (Requirement: ล้างข้อมูลตามอายุ: ล้างถังขยะเก่า เวอร์ชันเกินกำหนด และประวัติเก่า ต้องดูตัวอย่างและยืนยันก่อน) */}
      {activeSubTab === 'retention' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ล้างข้อมูลตามอายุการจัดเก็บ (Data Retention & Auto Cleanup)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ล้างไฟล์ในถังขยะที่หมดอายุเกิน 30 วัน, ตัดเวอร์ชันเก่าที่เกิน 5 เวอร์ชัน, และล้างบันทึกกิจกรรมเก่าเกิน 90 วัน
                <br />
                <span className="font-semibold text-rose-700">
                  * ข้อกำหนด: ระบบต้องแสดงตัวอย่างรายการที่จะถูกล้างข้อมูล และต้องได้รับการยืนยันจากผู้ดูแลก่อนดำเนินการ
                </span>
              </p>
            </div>
          </div>

          {retentionNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{retentionNotice}</span>
            </div>
          )}

          {!retentionPreview ? (
            <button
              onClick={handleLoadRetentionPreview}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>ดูตัวอย่างข้อมูลที่จะถูกล้าง (Preview Cleanup)</span>
            </button>
          ) : (
            <div className="p-5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-4">
              <h4 className="font-bold text-xs text-rose-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                ตัวอย่างผลการวิเคราะห์ข้อมูลที่ครบกำหนดล้าง:
              </h4>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-rose-200">
                  <span className="text-rose-500 block text-[11px]">ถังขยะที่เกิน 30 วัน</span>
                  <span className="font-bold text-slate-800 text-base">
                    {retentionPreview.trashExpiredFiles.length} ไฟล์
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-rose-200">
                  <span className="text-rose-500 block text-[11px]">เวอร์ชันเก่าเกินกำหนด</span>
                  <span className="font-bold text-slate-800 text-base">
                    {retentionPreview.oldVersionsCount} เวอร์ชัน
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-rose-200">
                  <span className="text-rose-500 block text-[11px]">ประวัติกิจกรรม &gt; 90 วัน</span>
                  <span className="font-bold text-slate-800 text-base">
                    {retentionPreview.oldLogsCount} บันทึก
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleConfirmRetentionCleanup}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ยืนยันดำเนินการล้างข้อมูลตามที่แสดงตัวอย่าง</span>
                </button>
                <button
                  onClick={() => setRetentionPreview(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. SYSTEM SETTINGS (Requirement: ตั้งค่า: ชื่อหน่วยงาน, ชื่อระบบ, นามสกุลไฟล์ที่ห้ามอัปโหลด และเวลาที่สำรองข้อมูล) */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              ตั้งค่าระบบ School Drive (System Settings)
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดชื่อหน่วยงาน โหมดการเข้าสู่ระบบ นโยบายความปลอดภัย และการสำรองข้อมูล
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อหน่วยงาน / โรงเรียน
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อระบบ
              </label>
              <input
                type="text"
                required
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Login Mode Selector (Requirement: เข้าระบบได้ 3 แบบ ผู้ดูแลเลือกในหน้าตั้งค่า) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รูปแบบการเข้าสู่ระบบ (3 แบบ) <span className="text-blue-600 font-bold">*</span>
              </label>
              <select
                value={loginMode}
                onChange={(e) => setLoginMode(e.target.value as any)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="google">1. บัญชี Google ของโรงเรียน: เข้าอัตโนมัติ ไม่ต้องใช้รหัส</option>
                <option value="credentials">2. ชื่อผู้ใช้และรหัสผ่าน: ใช้กับครูที่ใช้ Gmail ส่วนตัว</option>
                <option value="hybrid">3. แบบผสม: ใช้ทั้งสองแบบพร้อมกัน (แนะนำ)</option>
              </select>
            </div>

            {/* Max file size (Requirement: 100 MB ปรับได้ถึง 500 MB) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ขนาดไฟล์อัปโหลดสูงสุดต่อไฟล์ (100 MB - 500 MB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={maxFileSizeMB}
                  onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-mono font-bold text-xs text-blue-700 w-16 text-right">
                  {maxFileSizeMB} MB
                </span>
              </div>
            </div>

            {/* Disallowed extensions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                นามสกุลไฟล์ที่ห้ามอัปโหลด (คั่นด้วยเครื่องหมายจุลภาค ,)
              </label>
              <input
                type="text"
                value={disallowedExts}
                onChange={(e) => setDisallowedExts(e.target.value)}
                placeholder="exe, bat, sh, vbs, msi"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                ป้องกันสคริปต์อันตรายหรือมัลแวร์เข้าสู่ระบบ
              </span>
            </div>

            {/* Auto backup time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลาที่สำรองข้อมูลประจำคืนอัตโนมัติ
              </label>
              <input
                type="time"
                value={autoBackupTime}
                onChange={(e) => setAutoBackupTime(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Toggle Switches: Public link & Maintenance mode */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-xs text-slate-800 block">
                  เปิดใช้งานลิงก์สาธารณะในระบบ
                </span>
                <span className="text-[11px] text-slate-500">
                  อนุญาตให้บุคลากรสร้างลิงก์สำหรับคนภายนอกเปิดดูเอกสารได้
                </span>
              </div>
              <input
                type="checkbox"
                checked={publicLinksEnabled}
                onChange={(e) => setPublicLinksEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div>
                <span className="font-semibold text-xs text-amber-900 block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  โหมดปรับปรุงระบบ (Maintenance Mode)
                </span>
                <span className="text-[11px] text-amber-700">
                  ปิดการบันทึกชั่วคราวระหว่างดูแลระบบ (เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขได้)
                </span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่าระบบ</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
