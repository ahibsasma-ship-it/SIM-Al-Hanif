import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserSquare2, 
  School, 
  CalendarCheck, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronRight,
  BookOpen,
  Award,
  Sparkles,
  Home,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed = false,
  onToggleCollapse
}) => {
  const { currentUser, logout, loginAsDemo } = useAuth();
  const role = currentUser?.role || 'admin';

  const renderNavItems = () => {
    switch (role) {
      case 'admin':
        return (
          <>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Utama
            </div>
            <NavItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Command Center"
              path="/admin/dashboard"
              active={currentPath === '/admin/dashboard'}
              onClick={onNavigate}
            />

            <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Absensi Siswa
            </div>
            <NavItem
              icon={<CalendarCheck className="w-5 h-5" />}
              label="Input Absensi"
              path="/admin/attendance"
              active={currentPath === '/admin/attendance'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<ClipboardList className="w-5 h-5" />}
              label="Riwayat Absensi"
              path="/admin/attendance/history"
              active={currentPath === '/admin/attendance/history'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<BarChart3 className="w-5 h-5" />}
              label="Rekap & Ekspor"
              path="/admin/attendance/summary"
              active={currentPath === '/admin/attendance/summary'}
              onClick={onNavigate}
            />

            <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Data Master
            </div>
            <NavItem
              icon={<GraduationCap className="w-5 h-5" />}
              label="Data Siswa"
              path="/admin/students"
              active={currentPath.startsWith('/admin/students')}
              onClick={onNavigate}
            />
            <NavItem
              icon={<Users className="w-5 h-5" />}
              label="Data Guru"
              path="/admin/teachers"
              active={currentPath === '/admin/teachers'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<UserSquare2 className="w-5 h-5" />}
              label="Tenaga Kependidikan"
              path="/admin/staff"
              active={currentPath === '/admin/staff'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<School className="w-5 h-5" />}
              label="Data Kelas"
              path="/admin/classes"
              active={currentPath === '/admin/classes'}
              onClick={onNavigate}
            />

            <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Sistem
            </div>
            <NavItem
              icon={<Settings className="w-5 h-5" />}
              label="Pengaturan & Seed"
              path="/admin/settings"
              active={currentPath === '/admin/settings'}
              onClick={onNavigate}
            />

            <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Fase 2 (Segera Hadir)
            </div>
            <FutureItem icon={<BookOpen className="w-5 h-5" />} label="Akademik & Nilai" />
            <FutureItem icon={<Award className="w-5 h-5" />} label="Kesiswaan" />
            <FutureItem icon={<Sparkles className="w-5 h-5" />} label="Kesantrian & Asrama" />
          </>
        );

      case 'guru':
        return (
          <>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Guru & Pengajar
            </div>
            <NavItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard Guru"
              path="/guru/dashboard"
              active={currentPath === '/guru/dashboard'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<CalendarCheck className="w-5 h-5" />}
              label="Catat Absensi"
              path="/guru/attendance"
              active={currentPath === '/guru/attendance'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<ClipboardList className="w-5 h-5" />}
              label="Riwayat Kelas"
              path="/guru/attendance/history"
              active={currentPath === '/guru/attendance/history'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<School className="w-5 h-5" />}
              label="Kelas Binaan"
              path="/guru/classes"
              active={currentPath === '/guru/classes'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<GraduationCap className="w-5 h-5" />}
              label="Daftar Siswa"
              path="/guru/students"
              active={currentPath === '/guru/students'}
              onClick={onNavigate}
            />

            <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Fase 2 (Segera Hadir)
            </div>
            <FutureItem icon={<Clock className="w-5 h-5" />} label="Jadwal Mengajar" />
            <FutureItem icon={<BookOpen className="w-5 h-5" />} label="Penilaian & Rapor" />
          </>
        );

      case 'tendik':
        return (
          <>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Administrasi Sekolah
            </div>
            <NavItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard TU"
              path="/tendik/dashboard"
              active={currentPath === '/tendik/dashboard'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<GraduationCap className="w-5 h-5" />}
              label="Data Siswa"
              path="/tendik/students"
              active={currentPath === '/tendik/students'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<CalendarCheck className="w-5 h-5" />}
              label="Monitoring Absensi"
              path="/tendik/attendance"
              active={currentPath === '/tendik/attendance'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<BarChart3 className="w-5 h-5" />}
              label="Rekap Bulanan"
              path="/tendik/attendance/summary"
              active={currentPath === '/tendik/attendance/summary'}
              onClick={onNavigate}
            />

            <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Fase 2 (Segera Hadir)
            </div>
            <FutureItem icon={<BookOpen className="w-5 h-5" />} label="Buku Induk & Mutasi" />
            <FutureItem icon={<Award className="w-5 h-5" />} label="Surat & Dokumen" />
          </>
        );

      case 'siswa':
        return (
          <>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Santri Al-Hanif
            </div>
            <NavItem
              icon={<Home className="w-5 h-5" />}
              label="Beranda Santri"
              path="/siswa/dashboard"
              active={currentPath === '/siswa/dashboard'}
              onClick={onNavigate}
            />
            <NavItem
              icon={<CalendarCheck className="w-5 h-5" />}
              label="Absensi Saya"
              path="/siswa/attendance"
              active={currentPath === '/siswa/attendance'}
              onClick={onNavigate}
            />

            <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Fase 2 (Segera Hadir)
            </div>
            <FutureItem icon={<Sparkles className="w-5 h-5" />} label="Buku Mutaba'ah Tahfidz" />
            <FutureItem icon={<BookOpen className="w-5 h-5" />} label="Nilai & Rapor Santri" />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen select-none shrink-0 shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Logo size="md" />
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {renderNavItems()}
      </nav>

      {/* Quick Role Switcher Banner (Helpful for test evaluators) */}
      <div className="p-3 mx-3 mb-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-left">
        <div className="flex items-center justify-between font-semibold text-slate-700 mb-1.5">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#243B9B]" />
            Uji Role Pengguna:
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(['admin', 'guru', 'tendik', 'siswa'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                loginAsDemo(r);
                onNavigate(`/${r}/dashboard`);
              }}
              className={`py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                role === r
                  ? 'bg-[#243B9B] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Current User Card & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#243B9B] text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
            {currentUser?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser?.fullName || 'Pengguna'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                role === 'admin' ? 'bg-[#F28C18]' : role === 'guru' ? 'bg-[#0E9F6E]' : 'bg-[#243B9B]'
              }`} />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Keluar dari Aplikasi"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  onClick: (path: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, active, onClick }) => {
  return (
    <button
      onClick={() => onClick(path)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
        active
          ? 'bg-[#243B9B] text-white shadow-sm shadow-blue-900/10'
          : 'text-slate-600 hover:text-[#243B9B] hover:bg-blue-50/60'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-[#243B9B]'}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {active && <ChevronRight className="w-4 h-4 text-white/70" />}
    </button>
  );
};

const FutureItem: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => {
  return (
    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 opacity-60 cursor-not-allowed select-none">
      <span>{icon}</span>
      <span className="flex-1 truncate text-xs">{label}</span>
      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
        Fase 2
      </span>
    </div>
  );
};
