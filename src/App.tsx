import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';

// Dashboards
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { GuruDashboard } from './pages/dashboard/GuruDashboard';
import { TendikDashboard } from './pages/dashboard/TendikDashboard';
import { SiswaDashboard } from './pages/dashboard/SiswaDashboard';

// Attendance Pages
import { QuickAttendancePage } from './pages/attendance/QuickAttendancePage';
import { AttendanceHistoryPage } from './pages/attendance/AttendanceHistoryPage';
import { AttendanceSummaryPage } from './pages/attendance/AttendanceSummaryPage';

// Master Data Pages
import { StudentsPage } from './pages/master/StudentsPage';
import { StudentDetailPage } from './pages/master/StudentDetailPage';
import { TeachersPage } from './pages/master/TeachersPage';
import { StaffPage } from './pages/master/StaffPage';
import { ClassesPage } from './pages/master/ClassesPage';

// Settings & Audit
import { SettingsPage } from './pages/settings/SettingsPage';
import { AuditLogsPage } from './pages/settings/AuditLogsPage';

// Seed Initial Service
import { seedInitialData } from './services/firebase/seedService';

const MainLayout: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('STU-2026-0001');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Initialize path when user logs in or role changes
  useEffect(() => {
    if (currentUser) {
      const defaultPath = `/${currentUser.role}/dashboard`;
      setCurrentPath(defaultPath);

      // Silently ensure initial seed data exists on first session
      seedInitialData().catch(console.error);
    }
  }, [currentUser?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#243B9B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-[#101A3A]">Memuat SIM AL-HANIF...</p>
        <p className="text-xs text-slate-400 mt-1">Menghubungkan ke Google Cloud Firestore</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  // Path change handler
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to open student detail
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    handleNavigate(`/admin/students/${studentId}`);
  };

  // Determine Page Title
  const getPageTitle = () => {
    if (currentPath.includes('/dashboard')) {
      if (currentUser.role === 'admin') return 'Command Center & Analisis Kehadiran';
      if (currentUser.role === 'guru') return 'Ruang Kerja Guru & Wali Kelas';
      if (currentUser.role === 'tendik') return 'Pusat Administrasi & Presensi';
      return 'Portal Santri Al-Hanif';
    }
    if (currentPath.includes('/attendance/history')) return 'Riwayat Absensi Siswa';
    if (currentPath.includes('/attendance/summary')) return 'Rekapitulasi Kehadiran & Ekspor';
    if (currentPath.includes('/attendance')) return 'Input Presensi Santri Harian';
    if (currentPath.startsWith('/admin/students/') || currentPath.startsWith('/guru/students/')) return 'Detail Biodata Santri';
    if (currentPath.includes('/students')) return 'Buku Induk Data Santri';
    if (currentPath.includes('/teachers')) return 'Direktori Guru & Asatidz';
    if (currentPath.includes('/staff')) return 'Tenaga Kependidikan (Tendik)';
    if (currentPath.includes('/classes')) return 'Rombongan Belajar (Kelas)';
    if (currentPath.includes('/audit')) return 'Log Keamanan & Jejak Audit';
    if (currentPath.includes('/settings')) return 'Pengaturan Sistem & Database';
    return 'SIM AL-HANIF';
  };

  // Render current view
  const renderCurrentView = () => {
    // Student detail
    if (currentPath.startsWith('/admin/students/') || currentPath.startsWith('/guru/students/')) {
      return (
        <StudentDetailPage
          studentId={selectedStudentId}
          onBack={() => handleNavigate(`/${currentUser.role}/students`)}
        />
      );
    }

    // Attendance
    if (currentPath.endsWith('/attendance/history')) {
      return <AttendanceHistoryPage />;
    }
    if (currentPath.endsWith('/attendance/summary')) {
      return <AttendanceSummaryPage />;
    }
    if (currentPath.endsWith('/attendance')) {
      return <QuickAttendancePage />;
    }

    // Master Data
    if (currentPath.endsWith('/students')) {
      return <StudentsPage onSelectStudent={handleSelectStudent} />;
    }
    if (currentPath.endsWith('/teachers')) {
      return <TeachersPage />;
    }
    if (currentPath.endsWith('/staff')) {
      return <StaffPage />;
    }
    if (currentPath.endsWith('/classes')) {
      return <ClassesPage />;
    }

    // System Settings & Audit
    if (currentPath.endsWith('/settings')) {
      return <SettingsPage />;
    }
    if (currentPath.endsWith('/audit')) {
      return <AuditLogsPage />;
    }

    // Dashboards by role
    switch (currentUser.role) {
      case 'guru':
        return (
          <GuruDashboard
            onNavigate={handleNavigate}
            onSelectStudent={handleSelectStudent}
          />
        );
      case 'tendik':
        return (
          <TendikDashboard
            onNavigate={handleNavigate}
            onSelectStudent={handleSelectStudent}
          />
        );
      case 'siswa':
        return (
          <SiswaDashboard
            onNavigate={handleNavigate}
          />
        );
      case 'admin':
      default:
        return (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectStudent={handleSelectStudent}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased w-full max-w-full overflow-x-hidden">
      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden lg:block">
        <Sidebar
          currentPath={currentPath}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[80vw] h-full bg-white shadow-2xl flex flex-col">
            <Sidebar
              currentPath={currentPath}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto w-full max-w-full overflow-x-hidden">
        <Navbar
          pageTitle={getPageTitle()}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8 min-w-0">
          {renderCurrentView()}
        </main>

        {/* Mobile Floating Bottom Bar */}
        <MobileNav
          currentPath={currentPath}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
