import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  School, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  XCircle,
  Plus,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudents } from '../../services/firebase/studentsService';
import { getClasses } from '../../services/firebase/classesService';
import { getTeachers } from '../../services/firebase/teachersService';
import { getStaffList } from '../../services/firebase/staffService';
import { getAttendanceHistory } from '../../services/firebase/attendanceService';
import { Student, SchoolClass, Teacher, Staff, AttendanceRecord } from '../../types';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  onSelectStudent: (studentId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onSelectStudent }) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [stu, cls, tch, stf, att] = await Promise.all([
          getStudents(),
          getClasses(),
          getTeachers(),
          getStaffList(),
          getAttendanceHistory({ startDate: todayStr, endDate: todayStr })
        ]);
        setStudents(stu);
        setClasses(cls);
        setTeachers(tch);
        setStaffList(stf);
        setTodayRecords(att);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [todayStr]);

  // Attendance metrics
  const hadirCount = todayRecords.filter(r => r.status === 'HADIR').length;
  const terlambatCount = todayRecords.filter(r => r.status === 'TERLAMBAT').length;
  const izinCount = todayRecords.filter(r => r.status === 'IZIN').length;
  const sakitCount = todayRecords.filter(r => r.status === 'SAKIT').length;
  const alpaCount = todayRecords.filter(r => r.status === 'ALPA').length;
  const totalRecorded = todayRecords.length;
  const totalStudents = students.length || 180;

  const attendanceRate = totalRecorded > 0
    ? Math.round(((hadirCount + terlambatCount) / totalRecorded) * 100)
    : 98; // Fallback demo rate if no presensi entered today yet

  const boardingCount = students.filter(s => s.boardingStatus === 'boarding').length;

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#101A3A] via-[#243B9B] to-[#1a2d77] rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F28C18]" />
            <span>SIM AL-HANIF Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Ahlan wa Sahlan, {currentUser?.fullName || 'Administrator'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-2 leading-relaxed">
            Sistem Informasi Manajemen Sekolah dan Boarding School SMP IT Putra Al-Hanif. Kelola data santri, ustadz pengajar, dan presensi harian secara terintegrasi dengan Google Cloud Firestore.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => onNavigate('/admin/attendance')}
              className="px-4 py-2 bg-[#0E9F6E] hover:bg-[#0c825a] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Input Presensi Hari Ini</span>
            </button>
            <button
              onClick={() => onNavigate('/admin/students')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Santri Baru</span>
            </button>
            <button
              onClick={() => onNavigate('/admin/attendance/summary')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Rekap & Ekspor Absensi</span>
            </button>
          </div>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute right-0 bottom-0 top-0 w-80 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div 
          onClick={() => onNavigate('/admin/students')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-blue-50 text-[#243B9B] group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {boardingCount} Asrama
            </span>
          </div>
          <p className="text-2xl font-black text-[#101A3A] mt-4 tracking-tight">
            {students.length}
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Santri Terdaftar</p>
          <span className="text-[11px] text-slate-400 mt-2 block flex items-center gap-1 group-hover:text-[#243B9B]">
            Lihat buku induk santri <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Kehadiran Hari Ini */}
        <div 
          onClick={() => onNavigate('/admin/attendance')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-[#243B9B] bg-blue-50 px-2 py-0.5 rounded-full">
              Hari Ini
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-4 tracking-tight">
            {attendanceRate}%
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Persentase Kehadiran</p>
          <span className="text-[11px] text-slate-400 mt-2 block flex items-center gap-1 group-hover:text-[#243B9B]">
            {totalRecorded > 0 ? `${hadirCount} hadir dari ${totalRecorded} tercatat` : 'Belum ada absensi hari ini'}
          </span>
        </div>

        {/* Total Rombel Kelas */}
        <div 
          onClick={() => onNavigate('/admin/classes')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-amber-50 text-[#F28C18] group-hover:scale-105 transition-transform">
              <School className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Tingkat 7, 8, 9
            </span>
          </div>
          <p className="text-2xl font-black text-[#101A3A] mt-4 tracking-tight">
            {classes.length}
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Rombongan Belajar</p>
          <span className="text-[11px] text-slate-400 mt-2 block flex items-center gap-1 group-hover:text-[#243B9B]">
            Rata-rata 30 santri/kelas <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Guru & Tendik */}
        <div 
          onClick={() => onNavigate('/admin/teachers')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              SDM Sekolah
            </span>
          </div>
          <p className="text-2xl font-black text-[#101A3A] mt-4 tracking-tight">
            {teachers.length + staffList.length}
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Guru & Tenaga Kependidikan</p>
          <span className="text-[11px] text-slate-400 mt-2 block flex items-center gap-1 group-hover:text-[#243B9B]">
            {teachers.length} Asatidz • {staffList.length} Tendik
          </span>
        </div>
      </div>

      {/* Live Attendance Breakdown & Classes Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#101A3A]">
                Status Kehadiran Santri Hari Ini ({todayStr})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring presensi harian seluruh rombel kelas
              </p>
            </div>
            <button
              onClick={() => onNavigate('/admin/attendance')}
              className="text-xs font-bold text-[#243B9B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Kelola Absensi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-left">
              <div className="flex items-center gap-1 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Hadir
              </div>
              <p className="text-xl font-black text-emerald-700 mt-1">{hadirCount}</p>
              <span className="text-[10px] text-emerald-600">Tepat waktu</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-left">
              <div className="flex items-center gap-1 text-amber-800 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Terlambat
              </div>
              <p className="text-xl font-black text-amber-700 mt-1">{terlambatCount}</p>
              <span className="text-[10px] text-amber-600">Terhitung hadir</span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-left">
              <div className="flex items-center gap-1 text-blue-800 text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Izin
              </div>
              <p className="text-xl font-black text-blue-700 mt-1">{izinCount}</p>
              <span className="text-[10px] text-blue-600">Dengan surat</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-left">
              <div className="flex items-center gap-1 text-purple-800 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                Sakit
              </div>
              <p className="text-xl font-black text-purple-700 mt-1">{sakitCount}</p>
              <span className="text-[10px] text-purple-600">Klinik/asrama</span>
            </div>

            <div className="p-3 rounded-2xl bg-red-50/70 border border-red-100 text-left">
              <div className="flex items-center gap-1 text-red-800 text-xs font-bold">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                Alpa
              </div>
              <p className="text-xl font-black text-red-700 mt-1">{alpaCount}</p>
              <span className="text-[10px] text-red-600">Tanpa keterangan</span>
            </div>
          </div>

          {/* Classes Quick Table */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Status Presensi Per Rombel
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {classes.slice(0, 5).map(c => {
                const classRecords = todayRecords.filter(r => r.classId === c.classId);
                const isDone = classRecords.length > 0;

                return (
                  <div key={c.classId} className="p-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#243B9B] font-extrabold text-xs flex items-center justify-center">
                        {c.className.replace('Kelas ', '')}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Kelas {c.className}</p>
                        <p className="text-[11px] text-slate-400">Wali: {c.homeroomTeacherName || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isDone ? `${classRecords.length} Santri Tercatat` : 'Belum Input'}
                      </span>
                      <button
                        onClick={() => onNavigate('/admin/attendance')}
                        className="text-xs text-[#243B9B] font-semibold hover:underline cursor-pointer"
                      >
                        {isDone ? 'Lihat' : 'Input'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Recent Students & Quick Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#101A3A]">Santri Baru</h3>
              <p className="text-xs text-slate-400">Buku Induk SMP IT Putra Al-Hanif</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/students')}
              className="text-xs font-bold text-[#243B9B] hover:underline cursor-pointer"
            >
              Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {students.slice(0, 6).map(s => (
              <div
                key={s.studentId}
                onClick={() => onSelectStudent(s.studentId)}
                className="p-2.5 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-[#243B9B] font-bold text-xs flex items-center justify-center shrink-0">
                    {s.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-800 truncate">{s.fullName}</p>
                    <p className="text-[11px] text-slate-400">NIS: {s.nis} • Kelas {s.className}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
            <p className="font-bold text-[#243B9B]">Sistem Boarding School Putra</p>
            <p className="text-slate-600 text-[11px]">
              Tersedia fasilitas asrama terpadu, program tahfidz 30 juz, dan kurikulum SMP IT terakreditasi A.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
