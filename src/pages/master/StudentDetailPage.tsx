import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  GraduationCap, 
  User, 
  Phone, 
  Home, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  FileText,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';
import { getStudentById } from '../../services/firebase/studentsService';
import { getAttendanceHistory } from '../../services/firebase/attendanceService';
import { Student, AttendanceRecord, AttendanceStatus } from '../../types';

interface StudentDetailPageProps {
  studentId: string;
  onBack: () => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ studentId, onBack }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profil' | 'absensi' | 'akademik' | 'kesiswaan' | 'kesantrian'>('profil');

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const s = await getStudentById(studentId);
        setStudent(s);

        // Load attendance history for this student
        const history = await getAttendanceHistory({ studentId });
        setAttendanceRecords(history);
      } catch (err) {
        console.error('Error loading student detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [studentId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm text-left">
        <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-semibold text-slate-600">Memuat profil santri...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-left">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Santri Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">Data santri dengan ID {studentId} tidak tersedia.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  // Attendance stats for this student
  const presentCount = attendanceRecords.filter(r => r.status === 'HADIR').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'TERLAMBAT').length;
  const permissionCount = attendanceRecords.filter(r => r.status === 'IZIN').length;
  const sickCount = attendanceRecords.filter(r => r.status === 'SAKIT').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'ALPA').length;
  const totalMeetings = attendanceRecords.length;
  const rate = totalMeetings > 0 ? Math.round(((presentCount + lateCount) / totalMeetings) * 100) : 100;

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#243B9B] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Data Santri</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#243B9B] to-[#101A3A] text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
            {student.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight truncate">
                {student.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#243B9B] border border-blue-100">
                Kelas {student.className}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                student.boardingStatus === 'boarding'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {student.boardingStatus === 'boarding' ? 'Santri Asrama Putra' : 'Non-Boarding'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              ID: {student.studentId} • NIS: {student.nis} • NISN: {student.nisn}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
              <span>Wali: <strong>{student.parentName || '-'}</strong></span>
              <span>No. HP: <strong>{student.parentPhone || '-'}</strong></span>
              <span>Kota Asal: <strong>{student.birthPlace || '-'}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profil')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profil'
                ? 'bg-[#243B9B] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Profil Lengkap
          </button>
          <button
            onClick={() => setActiveTab('absensi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'absensi'
                ? 'bg-[#243B9B] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Riwayat Absensi ({attendanceRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('akademik')}
            className={`px-4 py-2 rounded-xl text-xs font-medium text-slate-400 opacity-60 flex items-center gap-1.5 cursor-pointer`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Akademik</span>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold">Fase 2</span>
          </button>
          <button
            onClick={() => setActiveTab('kesiswaan')}
            className={`px-4 py-2 rounded-xl text-xs font-medium text-slate-400 opacity-60 flex items-center gap-1.5 cursor-pointer`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Kesiswaan</span>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold">Fase 2</span>
          </button>
          <button
            onClick={() => setActiveTab('kesantrian')}
            className={`px-4 py-2 rounded-xl text-xs font-medium text-slate-400 opacity-60 flex items-center gap-1.5 cursor-pointer`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kesantrian & Tahfidz</span>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold">Fase 2</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Profil Content */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#101A3A] pb-3 border-b border-slate-100">
              Informasi Pribadi Santri
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nama Lengkap</span>
                <span className="font-bold text-slate-800">{student.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">NIS / NISN</span>
                <span className="font-mono font-bold text-[#243B9B]">{student.nis} / {student.nisn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Jenis Kelamin</span>
                <span className="font-semibold text-slate-800">{student.gender === 'L' ? 'Laki-laki (Ikhwan)' : 'Perempuan (Akhwat)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Tempat, Tanggal Lahir</span>
                <span className="font-semibold text-slate-800">{student.birthPlace || '-'}, {student.birthDate || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Agama</span>
                <span className="font-semibold text-slate-800">{student.religion || 'Islam'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Status Keaktifan</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {student.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#101A3A] pb-3 border-b border-slate-100">
              Data Orang Tua & Asrama
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nama Orang Tua / Wali</span>
                <span className="font-bold text-slate-800">{student.parentName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Kontak WhatsApp</span>
                <span className="font-mono font-bold text-slate-800">{student.parentPhone || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Status Asrama</span>
                <span className="font-semibold text-emerald-700">
                  {student.boardingStatus === 'boarding' ? 'Tinggal di Asrama Putra' : 'Full Day School'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Alamat Domisili</span>
                <span className="font-semibold text-slate-800 max-w-[220px] text-right">{student.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Absensi Content */}
      {activeTab === 'absensi' && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold">Tingkat Kehadiran</span>
              <p className="text-xl font-black text-[#243B9B] mt-1">{rate}%</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold">Hadir</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{presentCount}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold">Terlambat</span>
              <p className="text-xl font-black text-amber-600 mt-1">{lateCount}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold">Izin & Sakit</span>
              <p className="text-xl font-black text-blue-600 mt-1">{permissionCount + sickCount}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold">Alpa</span>
              <p className="text-xl font-black text-red-600 mt-1">{absentCount}</p>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Semua Catatan Absensi Terdaftar
              </h4>
            </div>

            {attendanceRecords.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs">
                Belum ada rekaman presensi untuk santri ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendanceRecords.map(r => (
                  <div key={r.attendanceId || r.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">{r.date}</span>
                      <span className="text-[11px] text-slate-400 block">
                        Pukul {r.checkInTime || '-'} • Dicatat oleh: {r.recordedByName}
                      </span>
                      {r.note && (
                        <p className="text-xs text-slate-600 italic mt-1">"{r.note}"</p>
                      )}
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
        </div>
      )}

      {/* Tabs 3, 4, 5: Segera Hadir Banner */}
      {(activeTab === 'akademik' || activeTab === 'kesiswaan' || activeTab === 'kesantrian') && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-2xs">
          <Sparkles className="w-10 h-10 text-[#F28C18] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#101A3A] capitalize">
            Modul {activeTab}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Fitur ini dijadwalkan pada Fase 2 pengembangan SIM AL-HANIF setelah fondasi sistem absensi dan master data stabil.
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-[#243B9B] rounded-full text-xs font-bold">
            Status: Segera Hadir
          </span>
        </div>
      )}
    </div>
  );
};
