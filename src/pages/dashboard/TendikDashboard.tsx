import React, { useState, useEffect } from 'react';
import { 
  UserSquare2, 
  GraduationCap, 
  CalendarCheck, 
  BarChart3, 
  FileSpreadsheet, 
  Search, 
  ChevronRight, 
  Download,
  School,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudents } from '../../services/firebase/studentsService';
import { getClasses } from '../../services/firebase/classesService';
import { getAttendanceHistory } from '../../services/firebase/attendanceService';
import { Student, SchoolClass, AttendanceRecord } from '../../types';

interface TendikDashboardProps {
  onNavigate: (path: string) => void;
  onSelectStudent: (studentId: string) => void;
}

export const TendikDashboard: React.FC<TendikDashboardProps> = ({ onNavigate, onSelectStudent }) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stu, cls, att] = await Promise.all([
          getStudents(),
          getClasses(),
          getAttendanceHistory({ startDate: todayStr, endDate: todayStr })
        ]);
        setStudents(stu);
        setClasses(cls);
        setAttendanceRecords(att);
      } catch (err) {
        console.error('Error fetching tendik data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [todayStr]);

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-[#101A3A] rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-500/30">
            <UserSquare2 className="w-3.5 h-3.5" />
            Tenaga Kependidikan (Tendik & TU)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pusat Administrasi Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-2 leading-relaxed">
            Selamat datang, <strong>{currentUser?.fullName}</strong>. Kelola administrasi data santri, pemantauan presensi harian antar kelas, serta rekapitulasi pelaporan bulanan SMP IT Putra Al-Hanif.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => onNavigate('/tendik/students')}
              className="px-4 py-2 bg-[#243B9B] hover:bg-[#1a2d77] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Kelola Buku Induk Siswa</span>
            </button>
            <button
              onClick={() => onNavigate('/tendik/attendance/summary')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Rekapitulasi Presensi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('/tendik/students')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-blue-50 text-[#243B9B]">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-slate-500">Buku Induk</span>
          </div>
          <p className="text-2xl font-black text-[#101A3A] mt-3">{students.length} Santri</p>
          <p className="text-xs text-slate-400 mt-1">Terdaftar di 6 rombongan belajar</p>
        </div>

        <div 
          onClick={() => onNavigate('/tendik/attendance')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Hari Ini
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-3">{attendanceRecords.length} Tercatat</p>
          <p className="text-xs text-slate-400 mt-1">Presensi santri masuk sistem</p>
        </div>

        <div 
          onClick={() => onNavigate('/tendik/attendance/summary')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-slate-500">Pelaporan</span>
          </div>
          <p className="text-2xl font-black text-[#101A3A] mt-3">Format CSV / Excel</p>
          <p className="text-xs text-slate-400 mt-1">Siap unduh untuk dinas & yayasan</p>
        </div>
      </div>

      {/* Monitoring Rombel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#101A3A]">
              Monitoring Presensi Kelas ({todayStr})
            </h3>
            <p className="text-xs text-slate-400">Status input guru wali kelas</p>
          </div>
          <button
            onClick={() => onNavigate('/tendik/attendance')}
            className="text-xs font-bold text-[#243B9B] hover:underline cursor-pointer"
          >
            Input / Koreksi Absensi
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map(c => {
            const classAtt = attendanceRecords.filter(r => r.classId === c.classId);
            const done = classAtt.length > 0;

            return (
              <div key={c.classId} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#101A3A]">Kelas {c.className}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      done ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {done ? 'Lengkap' : 'Belum Input'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Wali: {c.homeroomTeacherName || '-'}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tercatat: {classAtt.length} Santri</span>
                  <button
                    onClick={() => onNavigate('/tendik/attendance')}
                    className="text-[#243B9B] font-bold hover:underline cursor-pointer"
                  >
                    Buka
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
