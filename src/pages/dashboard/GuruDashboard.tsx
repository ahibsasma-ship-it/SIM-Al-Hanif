import React, { useState, useEffect } from 'react';
import { 
  School, 
  CalendarCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  XCircle, 
  ChevronRight,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentsByClass } from '../../services/firebase/studentsService';
import { getClasses } from '../../services/firebase/classesService';
import { getAttendanceByClassAndDate } from '../../services/firebase/attendanceService';
import { Student, SchoolClass, AttendanceRecord } from '../../types';

interface GuruDashboardProps {
  onNavigate: (path: string) => void;
  onSelectStudent: (studentId: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ onNavigate, onSelectStudent }) => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assignedClass, setAssignedClass] = useState<SchoolClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchGuruData = async () => {
      setLoading(true);
      try {
        const clsList = await getClasses();
        setClasses(clsList);

        // Find class for this teacher or default to VIII A
        const myClass = clsList.find(c => c.classId === currentUser?.classId || c.homeroomTeacherId === currentUser?.teacherId) || clsList[2] || clsList[0];
        setAssignedClass(myClass);

        if (myClass) {
          const [stu, att] = await Promise.all([
            getStudentsByClass(myClass.classId),
            getAttendanceByClassAndDate(myClass.classId, todayStr)
          ]);
          setStudents(stu);
          setTodayAttendance(att);
        }
      } catch (err) {
        console.error('Error fetching guru dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuruData();
  }, [currentUser, todayStr]);

  const hadirCount = todayAttendance.filter(r => r.status === 'HADIR').length;
  const terlambatCount = todayAttendance.filter(r => r.status === 'TERLAMBAT').length;
  const izinCount = todayAttendance.filter(r => r.status === 'IZIN').length;
  const sakitCount = todayAttendance.filter(r => r.status === 'SAKIT').length;
  const alpaCount = todayAttendance.filter(r => r.status === 'ALPA').length;
  const isRecordedToday = todayAttendance.length > 0;

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Teacher Hero Card */}
      <div className="bg-gradient-to-r from-[#243B9B] to-[#101A3A] rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <School className="w-3.5 h-3.5" />
            Wali Kelas & Tenaga Pendidik
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Bertugas, {currentUser?.fullName || 'Ustadz'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-2 leading-relaxed">
            Anda ditugaskan membina <strong>Kelas {assignedClass?.className || 'VIII A'}</strong> ({students.length} Santri). Pantau kehadiran santri di kelas dan asrama setiap pagi.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onNavigate('/guru/attendance')}
              className="px-4 py-2.5 bg-[#0E9F6E] hover:bg-[#0c825a] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{isRecordedToday ? 'Ubah / Cek Absensi Hari Ini' : 'Input Absensi Sekarang'}</span>
            </button>
            <button
              onClick={() => onNavigate('/guru/attendance/history')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Riwayat Absensi Kelas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Class Today Presensi Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-[#101A3A]">
              Kehadiran Kelas {assignedClass?.className} ({todayStr})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Status presensi santri binaan hari ini
            </p>
          </div>

          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
            isRecordedToday
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {isRecordedToday ? '✓ Presensi Sudah Tersimpan' : '⚠ Belum Mengisi Presensi'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hadir
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{hadirCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Terlambat
            </span>
            <p className="text-2xl font-black text-amber-700 mt-1">{terlambatCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Izin
            </span>
            <p className="text-2xl font-black text-blue-700 mt-1">{izinCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
            <span className="text-xs font-bold text-purple-800 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-purple-600" /> Sakit
            </span>
            <p className="text-2xl font-black text-purple-700 mt-1">{sakitCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-100">
            <span className="text-xs font-bold text-red-800 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-600" /> Alpa
            </span>
            <p className="text-2xl font-black text-red-700 mt-1">{alpaCount}</p>
          </div>
        </div>
      </div>

      {/* Student list in teacher's class */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#101A3A]">
              Daftar Santri Kelas {assignedClass?.className}
            </h3>
            <p className="text-xs text-slate-400">Total {students.length} santri dalam rombel ini</p>
          </div>
          <button
            onClick={() => onNavigate('/guru/attendance')}
            className="text-xs font-bold text-[#243B9B] hover:underline cursor-pointer"
          >
            Buka Form Absensi Lengkap
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map((s, idx) => (
            <div
              key={s.studentId}
              onClick={() => onSelectStudent(s.studentId)}
              className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#243B9B]">
                    {s.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#243B9B]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
