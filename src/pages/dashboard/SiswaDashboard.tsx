import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  GraduationCap, 
  Sparkles, 
  BookOpen,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAttendanceHistory } from '../../services/firebase/attendanceService';
import { getStudentById } from '../../services/firebase/studentsService';
import { AttendanceRecord, Student } from '../../types';

interface SiswaDashboardProps {
  onNavigate: (path: string) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiswaData = async () => {
      setLoading(true);
      try {
        const studentId = currentUser?.studentId || 'STU-2026-0001';
        const [stu, att] = await Promise.all([
          getStudentById(studentId),
          getAttendanceHistory({ studentId })
        ]);
        setStudent(stu);
        setRecords(att);
      } catch (err) {
        console.error('Error fetching siswa data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSiswaData();
  }, [currentUser]);

  const hadirCount = records.filter(r => r.status === 'HADIR').length;
  const terlambatCount = records.filter(r => r.status === 'TERLAMBAT').length;
  const izinCount = records.filter(r => r.status === 'IZIN').length;
  const sakitCount = records.filter(r => r.status === 'SAKIT').length;
  const alpaCount = records.filter(r => r.status === 'ALPA').length;
  const totalMeetings = records.length;
  const attendanceRate = totalMeetings > 0
    ? Math.round(((hadirCount + terlambatCount) / totalMeetings) * 100)
    : 100;

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-r from-[#243B9B] via-[#101A3A] to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-2xl flex items-center justify-center shrink-0">
            {student?.fullName ? student.fullName.charAt(0) : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/30">
              Santri Boarding School Al-Hanif
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {student?.fullName || currentUser?.fullName || 'Ahmad Fauzan Al-Baqir'}
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              NIS: <strong>{student?.nis || '260001'}</strong> • Kelas <strong>{student?.className || 'VIII A'}</strong> • Semester Ganjil 2026/2027
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Stats Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-400 font-semibold">Tingkat Kehadiran</p>
          <p className="text-2xl font-black text-[#243B9B] mt-1">{attendanceRate}%</p>
          <span className="text-[10px] text-emerald-600 font-bold">Sangat Baik</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-400 font-semibold">Hadir Tepat Waktu</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{hadirCount}</p>
          <span className="text-[10px] text-slate-400">Pertemuan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-400 font-semibold">Terlambat</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{terlambatCount}</p>
          <span className="text-[10px] text-slate-400">Pertemuan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-400 font-semibold">Izin & Sakit</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{izinCount + sakitCount}</p>
          <span className="text-[10px] text-slate-400">Tercatat di asrama</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-400 font-semibold">Alpa / Bolos</p>
          <p className="text-2xl font-black text-red-600 mt-1">{alpaCount}</p>
          <span className="text-[10px] text-slate-400">Tanpa keterangan</span>
        </div>
      </div>

      {/* Attendance History Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#101A3A]">
              Riwayat Presensi Harian Saya
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Catatan kehadiran dan ketepatan waktu belajar</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            {records.length} Hari Masuk
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Memuat riwayat kehadiran...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada catatan presensi untuk akun santri ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map(r => (
              <div key={r.attendanceId || r.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{r.date}</p>
                    <p className="text-[11px] text-slate-400">
                      Waktu masuk: {r.checkInTime ? `Pukul ${r.checkInTime} WIB` : 'Tercatat'} • Dicatat oleh: {r.recordedByName}
                    </p>
                    {r.note && (
                      <p className="text-[11px] text-slate-600 italic mt-0.5">"{r.note}"</p>
                    )}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  r.status === 'HADIR' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  r.status === 'TERLAMBAT' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  r.status === 'IZIN' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                  r.status === 'SAKIT' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                  'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tahfidz & Akademik Teaser Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="p-3.5 rounded-2xl bg-amber-50 text-[#F28C18]">
            <Sparkles className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#101A3A]">
              Modul Mutaba'ah Tahfidz & Buku Penghubung
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Fitur setoran hafalan Qur'an juz 30 dan rapor capaian adab santri akan segera aktif di Fase 2.
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#243B9B] text-xs font-bold whitespace-nowrap">
          Fase 2 Segera Hadir
        </span>
      </div>
    </div>
  );
};
