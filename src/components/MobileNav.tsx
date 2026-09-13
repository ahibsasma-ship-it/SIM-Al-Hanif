import React from 'react';
import { LayoutDashboard, CalendarCheck, GraduationCap, BarChart3, Settings, ClipboardList, Home, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath, onNavigate }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'admin';

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Beranda', path: '/admin/dashboard' },
          { icon: <CalendarCheck className="w-5 h-5" />, label: 'Absensi', path: '/admin/attendance' },
          { icon: <GraduationCap className="w-5 h-5" />, label: 'Siswa', path: '/admin/students' },
          { icon: <BarChart3 className="w-5 h-5" />, label: 'Rekap', path: '/admin/attendance/summary' },
          { icon: <Settings className="w-5 h-5" />, label: 'Setelan', path: '/admin/settings' },
        ];
      case 'guru':
        return [
          { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Beranda', path: '/guru/dashboard' },
          { icon: <CalendarCheck className="w-5 h-5" />, label: 'Absensi', path: '/guru/attendance' },
          { icon: <ClipboardList className="w-5 h-5" />, label: 'Riwayat', path: '/guru/attendance/history' },
          { icon: <School className="w-5 h-5" />, label: 'Kelas', path: '/guru/classes' },
        ];
      case 'tendik':
        return [
          { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Beranda', path: '/tendik/dashboard' },
          { icon: <GraduationCap className="w-5 h-5" />, label: 'Siswa', path: '/tendik/students' },
          { icon: <CalendarCheck className="w-5 h-5" />, label: 'Absensi', path: '/tendik/attendance' },
          { icon: <BarChart3 className="w-5 h-5" />, label: 'Rekap', path: '/tendik/attendance/summary' },
        ];
      case 'siswa':
        return [
          { icon: <Home className="w-5 h-5" />, label: 'Beranda', path: '/siswa/dashboard' },
          { icon: <CalendarCheck className="w-5 h-5" />, label: 'Absensi', path: '/siswa/attendance' },
        ];
      default:
        return [];
    }
  };

  const items = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const isActive = currentPath === item.path || (item.path !== '/admin/dashboard' && currentPath.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#243B9B] font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 text-[#243B9B]' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-none whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
