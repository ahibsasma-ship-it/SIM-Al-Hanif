import React, { useState } from 'react';
import { Menu, Bell, Calendar, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FirebaseStatusBadge } from './FirebaseStatusBadge';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, pageTitle = 'Dashboard' }) => {
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Today in Indonesian format
  const todayDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile menu trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="text-left">
          <h1 className="text-base lg:text-lg font-extrabold text-[#101A3A] tracking-tight truncate">
            {pageTitle}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0E9F6E]" />
              {todayDate}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[#243B9B] font-semibold">T.A. 2026/2027</span>
          </div>
        </div>
      </div>

      {/* Right: Status badge & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Firebase Live Status */}
        <FirebaseStatusBadge />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F28C18] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-[#101A3A]">Pemberitahuan Sistem</h4>
                <span className="text-[11px] font-semibold text-[#243B9B] bg-blue-50 px-2 py-0.5 rounded-full">
                  Fase 1 Aktif
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Absensi Terkoneksi Firestore</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Modul absensi terintegrasi penuh dengan pencegahan duplikasi dan audit log.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="text-xs font-bold text-[#243B9B]">Tahun Ajaran 2026/2027</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Semester Ganjil SMP IT Putra Al-Hanif Boarding School.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#243B9B] text-white font-bold text-xs flex items-center justify-center">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser?.fullName?.split(' ')[0] || 'Pengguna'}
              </p>
              <p className="text-[10px] font-medium text-slate-500 capitalize">
                {currentUser?.role}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-left">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-50 text-[#243B9B]">
                  Role: {currentUser?.role}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar (Sign Out)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
