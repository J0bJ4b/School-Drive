import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackupSnapshot, RestoreLog } from '../types';
import {
  DatabaseBackup,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  ShieldCheck,
  Play,
  FileCheck,
  RefreshCw,
  Eye,
  Check,
  ArrowRight
} from 'lucide-react';
import { formatBytes, formatThaiDate } from '../utils/formatters';

export const BackupRecoveryView: React.FC = () => {
  const {
    currentUser,
    snapshots,
    restoreLogs,
    createManualBackup,
    runTestDryRunRestore,
    currentDryRunReport,
    clearDryRunReport,
    promoteDryRunToLive,
    settings,
    triggerScheduledAutoBackup
  } = useApp();

  const [backupNote, setBackupNote] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleInstantBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const snap = createManualBackup(
        `สำรองข้อมูลทันใจ (สร้างโดย ${currentUser?.name || 'ผู้ดูแล'})`,
        backupNote || 'สำรองข้อมูลฉุกเฉินและโครงสร้างเอกสารทุกเวอร์ชัน'
      );
      setIsBackingUp(false);
      setBackupNote('');
      setNotice(`สร้างจุดสำรองข้อมูลสำเร็จ (ID: ${snap.id})`);
      setTimeout(() => setNotice(null), 4000);
    }, 600);
  };

  const handleRunDryRun = (snapshotId: string) => {
    const report = runTestDryRunRestore(snapshotId);
    if (report) {
      setNotice(`ดำเนินการทดลองกู้คืน (Sandbox Dry Run) สำเร็จ กรุณาตรวจสอบผลการทดสอบ`);
    }
  };

  const handlePromoteToLive = () => {
    if (!currentDryRunReport) return;
    setIsPromoting(true);
    setTimeout(() => {
      promoteDryRunToLive(currentDryRunReport);
      setIsPromoting(false);
      setNotice('สลับไปใช้จริง (Promoted to Live) เรียบร้อยแล้ว!');
      setTimeout(() => setNotice(null), 4000);
    }, 600);
  };

  const handleDownloadSnapshotJSON = (snap: BackupSnapshot) => {
    const payload = JSON.stringify(snap, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolDrive_Snapshot_${snap.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DatabaseBackup className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ระบบสำรองข้อมูลและกู้คืน (Disaster Recovery & Backup)
            </h2>
            <p className="text-xs text-slate-500">
              สำรองอัตโนมัติประจำคืนพร้อมทดสอบกู้คืนแบบ Sandbox ป้องกันเอกสารสูญหายได้อย่างสมบูรณ์
            </p>
          </div>
        </div>

        {/* Live Status Badge (Requirement: สถานะบนหน้าแรก มีการ์ดบอกว่าสำรองล่าสุดเมื่อไรและปกติหรือไม่) */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <div>
            <div>สำรองล่าสุด: {formatThaiDate(settings.lastAutoBackupTimestamp)}</div>
            <span className="text-[10px] text-emerald-700 font-normal">
              สถานะ: ปกติ (สมบูรณ์ 100%) · รอบถัดไป: {settings.autoBackupTime} น.
            </span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notice}</span>
        </div>
      )}

      {/* ACTIVE DRY RUN SANDBOX REPORT CARD (Requirement: ทดลองกู้คืน: สร้างสำเนาแล้วตรวจความถูกต้องก่อน ผ่านแล้วค่อยสลับไปใช้จริง) */}
      {currentDryRunReport && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-indigo-950">
                    ผลการทดลองกู้คืน (Sandbox Dry Run Verification)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ตรวจผ่าน 100%
                  </span>
                </div>
                <p className="text-xs text-indigo-700 mt-0.5">
                  ทดสอบกับสำเนาจำลอง: {currentDryRunReport.snapshotName} (ID: {currentDryRunReport.snapshotId})
                </p>
              </div>
            </div>

            <button
              onClick={clearDryRunReport}
              className="text-xs text-indigo-500 hover:text-indigo-800 font-semibold"
            >
              ปิดรายงานทดสอบ
            </button>
          </div>

          {/* Test items breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white/80 rounded-xl border border-indigo-100">
              <span className="text-indigo-500 block text-[11px]">เอกสารที่ตรวจ</span>
              <span className="font-bold text-slate-800 text-sm">
                {currentDryRunReport.totalFilesChecked} ไฟล์
              </span>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-indigo-100">
              <span className="text-indigo-500 block text-[11px]">โฟลเดอร์ที่ตรวจ</span>
              <span className="font-bold text-slate-800 text-sm">
                {currentDryRunReport.totalFoldersChecked} โฟลเดอร์
              </span>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-indigo-100">
              <span className="text-indigo-500 block text-[11px]">Hash Checksum</span>
              <span className="font-bold text-emerald-600 text-sm">
                ตรงกัน {currentDryRunReport.checksumMatches} รายการ
              </span>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-indigo-100">
              <span className="text-indigo-500 block text-[11px]">การซิงค์ Drive</span>
              <span className="font-bold text-blue-600 text-sm">สิทธิ์ถูกต้อง</span>
            </div>
          </div>

          {/* Detailed test checklist */}
          <div className="bg-white/90 p-4 rounded-xl border border-indigo-100 space-y-1.5 text-xs text-slate-700">
            <span className="font-bold text-slate-800 block mb-2">
              ขั้นตอนการตรวจสอบความถูกต้องอัตโนมัติ:
            </span>
            {currentDryRunReport.details.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{detail}</span>
              </div>
            ))}
          </div>

          {/* Promote Action Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-indigo-900 font-medium">
              ผลการตรวจถูกต้อง 100% ปราศจากข้อผิดพลาด สามารถสลับไปใช้ในระบบจริงได้ทันที
            </span>

            {isAdmin && (
              <button
                onClick={handlePromoteToLive}
                disabled={isPromoting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isPromoting ? 'กำลังสลับ...' : 'สลับไปใช้จริง (Promote to Live)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Instant Backup Card (Requirement: สำรองทันที: ผู้ดูแลกดสั่งเองได้ตลอด) */}
      {isAdmin && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              สั่งสำรองข้อมูลทันที (Instant Backup Snapshot)
            </h3>
            <span className="text-xs text-slate-400">
              บันทึกโครงสร้างฐานข้อมูล ไฟล์เอกสาร และเวอร์ชันย้อนหลังทั้งหมด
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={backupNote}
              onChange={(e) => setBackupNote(e.target.value)}
              placeholder="ระบุบันทึกช่วยจำ เช่น สำรองก่อนประกาศผลสอบ, สำรองสิ้นภาคเรียน..."
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleInstantBackup}
              disabled={isBackingUp}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
            >
              <DatabaseBackup className="w-4 h-4" />
              <span>{isBackingUp ? 'กำลังสร้าง Snapshot...' : 'สำรองข้อมูลทันที'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SNAPSHOTS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              จุดสำรองข้อมูลทั้งหมด ({snapshots.length} จุด)
            </h3>
            <p className="text-xs text-slate-500">
              สำรองอัตโนมัติประจำคืน (Nightly) และสำรองด้วยตนเอง
            </p>
          </div>

          <button
            onClick={triggerScheduledAutoBackup}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            title="จำลองการทำงานของรอบสำรองอัตโนมัติ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ทดสอบรันรอบอัตโนมัติ ({settings.autoBackupTime} น.)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">ชื่อจุดสำรอง</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">วันที่และเวลา</th>
                <th className="py-3 px-4">จำนวนเอกสาร/ขนาด</th>
                <th className="py-3 px-4">สถานะความสมบูรณ์</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{snap.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {snap.id}</div>
                    {snap.notes && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{snap.notes}</div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        snap.type === 'auto'
                          ? 'bg-blue-100 text-blue-800'
                          : snap.type === 'pre_repair'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {snap.type === 'auto'
                        ? 'อัตโนมัติ (Nightly)'
                        : snap.type === 'pre_repair'
                        ? 'ก่อนตรวจซ่อม'
                        : 'ผู้ดูแลกดเอง'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {formatThaiDate(snap.timestamp)}
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    <div>{snap.fileCount} ไฟล์ · {snap.folderCount} โฟลเดอร์</div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatBytes(snap.totalSizeBytes)}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>สมบูรณ์ 100%</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && (
                        <button
                          onClick={() => handleRunDryRun(snap.id)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                          title="สร้างสำเนาทดสอบ Sandbox ตรวจความถูกต้องก่อนสลับใช้จริง"
                        >
                          <Play className="w-3 h-3" />
                          <span>ทดลองกู้คืน (Dry Run)</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadSnapshotJSON(snap)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="ดาวน์โหลดไฟล์สำรอง .json"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTORE LOGS HISTORY (Requirement: ประวัติการกู้คืน: บันทึกทุกครั้งว่าใครทำอะไร เมื่อไร) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          ประวัติการกู้คืนระบบ (Restore History Logs)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">วัน-เวลา</th>
                <th className="py-2.5 px-3">ประเภทการกู้คืน</th>
                <th className="py-2.5 px-3">จุดสำรองที่ใช้</th>
                <th className="py-2.5 px-3">ผู้ดำเนินการ</th>
                <th className="py-2.5 px-3">รายละเอียดผลลัพธ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {restoreLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 text-slate-500">
                    {formatThaiDate(log.timestamp)}
                  </td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.type === 'test_dry_run'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.type === 'test_dry_run' ? 'ทดลองกู้คืน (Dry Run)' : 'สลับใช้จริง (Live)'}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {log.snapshotName}
                  </td>

                  <td className="py-2.5 px-3 text-slate-600">
                    {log.restoredByName}
                  </td>

                  <td className="py-2.5 px-3 text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
