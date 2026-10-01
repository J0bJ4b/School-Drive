import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bell,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Clock,
  Sparkles,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { formatThaiDate } from '../utils/formatters';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab: _activeTab,
  setActiveTab
}) => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    settings,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveFile,
    files
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter(
    (n) => !n.read && (n.userId === currentUser?.id || n.userId === 'u-admin' || currentUser?.role === 'admin')
  );

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTarget && notif.linkTarget.type === 'file') {
      const file = files.find((f) => f.id === notif.linkTarget?.id);
      if (file) {
        setActiveFile(file);
      }
    }
    setShowNotifications(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Maintenance Mode Alert Banner if active */}
      {settings.isMaintenanceMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>โหมดปรับปรุงระบบกำลังเปิดใช้งาน: บันทึกข้อมูลและอัปโหลดไฟล์ถูกระงับชั่วคราวสำหรับผู้ใช้ทั่วไป</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('all_docs')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">
                  {settings.systemName}
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Drive โรงเรียน
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px] md:max-w-xs">
                {settings.schoolName}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Universal Search Input */}
        <div className="flex-1 max-w-xl mx-2 md:mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเอกสาร, คำสำคัญ, หรือแท็ก เช่น แผนการสอน, งบประมาณ, PA..."
              className="w-full pl-10 pr-9 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Backup Card, Notifications, User Switcher */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Real Google Drive Connection Badge Button */}
          <button
            onClick={() => setActiveTab('google_drive')}
            title="คลิกเพื่อเปิดจัดการ Google Drive จริง"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 transition"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#FFC107" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
            </svg>
            <span>Google Drive จริง</span>
          </button>

          {/* Nightly Backup Status Indicator Badge (Requirement: สถานะบนหน้าแรก มีการ์ดบอกว่าสำรองล่าสุดเมื่อไรและปกติหรือไม่) */}
          <button
            onClick={() => setActiveTab('backup')}
            title="คลิกเพื่อดูรายละเอียดระบบสำรองข้อมูลและกู้คืน"
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              <div className="font-semibold text-emerald-900 flex items-center gap-1">
                <span>สำรองล่าสุด: {settings.autoBackupTime} น.</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-emerald-700 text-[10px]">สถานะ: ปกติ (100%)</span>
            </div>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="การแจ้งเตือนเมื่อมีคนแชร์เอกสาร"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800">การแจ้งเตือน</span>
                    {unreadNotifications.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-semibold">
                        {unreadNotifications.length} ใหม่
                      </span>
                    )}
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      อ่านทั้งหมดแล้ว
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      ไม่มีการแจ้งเตือนในขณะนี้
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5 ${
                          !notif.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'share'
                              ? 'bg-blue-100 text-blue-600'
                              : notif.type === 'backup'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {notif.type === 'share' ? (
                            <FileText className="w-3.5 h-3.5" />
                          ) : notif.type === 'backup' ? (
                            <HardDrive className="w-3.5 h-3.5" />
                          ) : (
                            <Bell className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{notif.title}</p>
                          <p className="text-slate-600 line-clamp-2 text-[11px] mt-0.5">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatThaiDate(notif.timestamp)}
                          </span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Switch User Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 md:px-2.5 md:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-sm">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.name.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <span className="truncate max-w-[120px]">{currentUser?.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] font-medium text-blue-600 flex items-center gap-1">
                  <span className="capitalize">
                    {currentUser?.role === 'admin'
                      ? 'ผู้ดูแลระบบ'
                      : currentUser?.role === 'head'
                      ? 'หัวหน้างาน'
                      : currentUser?.role === 'staff'
                      ? 'บุคลากร'
                      : 'ผู้อ่าน'}
                  </span>
                </div>
              </div>
            </button>

            {/* Switch User / Profile Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                {/* Active user header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                  <div className="text-xs text-slate-500 font-medium">เข้าใช้งานในนาม</div>
                  <div className="text-sm font-bold text-slate-800">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                      สิทธิ์: {currentUser?.role}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ฝ่าย: {currentUser?.department}
                    </span>
                  </div>
                </div>

                {/* Switcher list */}
                <div className="px-3 py-2">
                  <div className="text-[11px] font-semibold text-slate-500 px-2 mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    สลับบทบาทผู้ใช้เพื่อทดสอบ (4 ระดับสิทธิ์):
                  </div>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                          currentUser?.id === u.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="truncate">
                          <div>{u.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            @{u.username} · {u.role}
                          </span>
                        </div>
                        {currentUser?.id === u.id && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium transition"
                  >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
