import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ForcePasswordChangeModal: React.FC = () => {
  const { currentUser, updatePassword } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!currentUser || !currentUser.mustChangePassword) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (newPassword === 'A12345678+') {
      setError('กรุณาตั้งรหัสผ่านใหม่ที่ไม่ตรงกับรหัสผ่านเริ่มต้นของระบบ');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    const ok = updatePassword(currentUser.id, newPassword);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 text-amber-600 mb-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              กรุณาเปลี่ยนรหัสผ่านใหม่ตอนเข้าครั้งแรก
            </h3>
            <p className="text-xs text-slate-500">
              ผู้ดูแลระบบได้กำหนดให้คุณตั้งรหัสผ่านส่วนตัวเพื่อความปลอดภัย
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 text-center text-emerald-600 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
            <p className="font-semibold text-sm">เปลี่ยนรหัสผ่านสำเร็จ กำลังเข้าสู่ระบบ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="เช่น NewPass@2026"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยืนยันรหัสผ่านใหม่อีกครั้ง
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านใหม่ซ้ำ"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow transition"
            >
              บันทึกรหัสผ่านใหม่และเริ่มต้นใช้งาน
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
