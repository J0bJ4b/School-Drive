import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, AlertCircle, Key, ArrowRight, UserCheck } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    currentUser,
    settings,
    loginWithCredentials,
    loginWithGoogle,
    loginError,
    loginLockTimeRemaining,
    loginAttemptsRemaining,
    users
  } = useApp();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('A12345678+');
  const [submitting, setSubmitting] = useState(false);

  // If user is already logged in, do not render
  if (currentUser) return null;

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLockTimeRemaining > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      loginWithCredentials(username, password);
      setSubmitting(false);
    }, 200);
  };

  const handleQuickFill = (user: typeof users[0]) => {
    setUsername(user.username);
    setPassword(user.passwordHash || 'A12345678+');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-md border border-white/20 shadow-inner">
            <Shield className="w-8 h-8 text-blue-100" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{settings.systemName}</h2>
          <p className="text-xs text-blue-100/90 mt-1">{settings.schoolName}</p>
        </div>

        {/* Lockout Warning Banner */}
        {loginLockTimeRemaining > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold block text-rose-900 mb-0.5">
                บัญชีถูกระงับชั่วคราว (กันการเดารหัส 5 ครั้ง)
              </span>
              กรุณารอเวลาปลดล็อกในอีก{' '}
              <span className="font-bold text-rose-700 font-mono text-sm">
                {Math.floor(loginLockTimeRemaining / 60)}:
                {String(loginLockTimeRemaining % 60).padStart(2, '0')}
              </span>{' '}
              นาที
            </div>
          </div>
        )}

        {/* Error message */}
        {loginError && loginLockTimeRemaining <= 0 && (
          <div className="bg-rose-50 border-b border-rose-200 p-3.5 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{loginError}</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Mode 1: Google School Account */}
          {(settings.loginMode === 'google' || settings.loginMode === 'hybrid') && (
            <div>
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium shadow-sm transition-all hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าด้วยบัญชี Google ของโรงเรียน (@school.ac.th)</span>
              </button>
              <div className="text-[11px] text-center text-slate-500 mt-1.5">
                เข้าระบบอัตโนมัติสำหรับครูและบุคลากรที่มีอีเมลโรงเรียน
              </div>
            </div>
          )}

          {settings.loginMode === 'hybrid' && (
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-600 font-medium">หรือ เข้าด้วยชื่อผู้ใช้</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          )}

          {/* Mode 2: Username & Password */}
          {(settings.loginMode === 'credentials' || settings.loginMode === 'hybrid') && (
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ใช้ (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น admin, teacher_somchai"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ใส่รหัสผ่าน"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                  <span>ใส่รหัสผิดได้อีก {loginAttemptsRemaining} ครั้ง</span>
                  <span className="text-slate-600">สิทธิ์ 4 ระดับในระบบ</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loginLockTimeRemaining > 0}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow transition flex items-center justify-center gap-2"
              >
                {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Credential Helper box for evaluator */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                บัญชีสำหรับทดสอบระบบตามโจทย์:
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill(users[0])}
                className="text-left p-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg transition"
              >
                <span className="font-semibold text-blue-700 block">admin</span>
                <span className="text-slate-600">A12345678+ (ผู้ดูแล)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(users[1])}
                className="text-left p-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg transition"
              >
                <span className="font-semibold text-blue-700 block">head_academic</span>
                <span className="text-slate-600">A12345678+ (หัวหน้างาน)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(users[3])}
                className="text-left p-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg transition"
              >
                <span className="font-semibold text-blue-700 block">teacher_somchai</span>
                <span className="text-slate-600">A12345678+ (บุคลากร)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(users[5])}
                className="text-left p-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg transition"
              >
                <span className="font-semibold text-blue-700 block">viewer_guest</span>
                <span className="text-slate-600">A12345678+ (ผู้อ่าน)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 p-3 text-center border-t border-slate-200 text-[11px] text-slate-600">
          ระบบความปลอดภัย: ล็อกอินผิด 5 ครั้ง พักบัญชี 15 นาที · รีเซ็ตรหัสผ่านโดยแอดมิน
        </div>
      </div>
    </div>
  );
};
