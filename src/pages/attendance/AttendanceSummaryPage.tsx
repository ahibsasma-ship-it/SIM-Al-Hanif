import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar, 
  School, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  HelpCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { getClasses } from '../../services/firebase/classesService';
import { getStudentsByClass } from '../../services/firebase/studentsService';
import { getAttendanceHistory, calculateAttendanceSummaries, exportAttendanceToCSV } from '../../services/firebase/attendanceService';
import { SchoolClass, AttendanceSummary } from '../../types';

export const AttendanceSummaryPage: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Selected month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // Month names in Indonesian
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  useEffect(() => {
    const fetchClasses = async () => {
      const cls = await getClasses();
      setClasses(cls);
      if (cls.length > 0) {
        setSelectedClassId(cls[0].classId);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;

    const loadSummary = async () => {
      setLoading(true);
      try {
        const students = await getStudentsByClass(selectedClassId);
        
        // Month boundary formatted as YYYY-MM
        const monthStr = String(selectedMonth).padStart(2, '0');
        const startDate = `${selectedYear}-${monthStr}-01`;
        const endDate = `${selectedYear}-${monthStr}-31`;

        const records = await getAttendanceHistory({
          classId: selectedClassId,
          startDate,
          endDate
        });

        const studentList = students.map(s => ({
          studentId: s.studentId,
          fullName: s.fullName,
          nis: s.nis,
          classId: s.classId,
          className: s.className
        }));

        const result = calculateAttendanceSummaries(records, studentList);
        setSummaries(result);
      } catch (err) {
        console.error('Error calculating attendance summary:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [selectedClassId, selectedMonth, selectedYear]);

  const currentClass = classes.find(c => c.classId === selectedClassId);
  const className = currentClass?.className || 'VIII A';
  const periodLabel = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

  // Class overall average attendance rate
  const classAvgRate = summaries.length > 0
    ? Math.round(summaries.reduce((acc, s) => acc + s.attendanceRate, 0) / summaries.length)
    : 0;

  const totalHadirAll = summaries.reduce((acc, s) => acc + s.totalPresent, 0);
  const totalTerlambatAll = summaries.reduce((acc, s) => acc + s.totalLate, 0);
  const totalIzinAll = summaries.reduce((acc, s) => acc + s.totalPermission, 0);
  const totalSakitAll = summaries.reduce((acc, s) => acc + s.totalSick, 0);
  const totalAlpaAll = summaries.reduce((acc, s) => acc + s.totalAbsent, 0);

  const handleExport = () => {
    exportAttendanceToCSV(summaries, `Kelas-${className}`, `${monthNames[selectedMonth - 1]}-${selectedYear}`);
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
                Rekapitulasi Absensi Siswa
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Perhitungan persentase kehadiran: <code>(Hadir + Terlambat) / Total Pertemuan × 100%</code>
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={summaries.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0E9F6E] hover:bg-[#0c825a] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            >
              {classes.map(c => (
                <option key={c.classId} value={c.classId}>Kelas {c.className}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tahun Ajaran
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* Highlights Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-500 font-semibold">Tingkat Kehadiran Kelas</p>
          <p className="text-2xl font-black text-[#243B9B] mt-1">{classAvgRate}%</p>
          <span className="text-[11px] text-slate-400">Rata-rata bulan {monthNames[selectedMonth - 1]}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-500 font-semibold">Total Presensi Hadir</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalHadirAll}</p>
          <span className="text-[11px] text-slate-400">Santri tepat waktu</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-500 font-semibold">Terlambat / Izin</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalTerlambatAll + totalIzinAll}</p>
          <span className="text-[11px] text-slate-400">{totalTerlambatAll} terlambat, {totalIzinAll} izin</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-500 font-semibold">Sakit & Alpa</p>
          <p className="text-2xl font-black text-red-600 mt-1">{totalSakitAll + totalAlpaAll}</p>
          <span className="text-[11px] text-slate-400">{totalSakitAll} sakit, {totalAlpaAll} alpa</span>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#101A3A]">
              Rekapitulasi Santri Kelas {className}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Periode: {periodLabel}</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            {summaries.length} Santri Terdaftar
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Menghitung rekapitulasi data kehadiran...</p>
          </div>
        ) : summaries.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum ada data absensi untuk periode ini</p>
            <p className="text-xs text-slate-400 mt-1">
              Catat absensi terlebih dahulu pada halaman Absensi Siswa.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12">No</th>
                    <th className="py-3 px-4">Nama Santri</th>
                    <th className="py-3 px-4">NIS</th>
                    <th className="py-3 px-3 text-center text-emerald-700">Hadir</th>
                    <th className="py-3 px-3 text-center text-amber-700">Terlambat</th>
                    <th className="py-3 px-3 text-center text-blue-700">Izin</th>
                    <th className="py-3 px-3 text-center text-purple-700">Sakit</th>
                    <th className="py-3 px-3 text-center text-red-700">Alpa</th>
                    <th className="py-3 px-3 text-center">Total Hari</th>
                    <th className="py-3 px-4 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {summaries.map((s, idx) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-[#101A3A]">{s.studentName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.nis}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600 bg-emerald-50/30">{s.totalPresent}</td>
                      <td className="py-3 px-3 text-center font-semibold text-amber-600">{s.totalLate}</td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-600">{s.totalPermission}</td>
                      <td className="py-3 px-3 text-center font-semibold text-purple-600">{s.totalSick}</td>
                      <td className="py-3 px-3 text-center font-bold text-red-600">{s.totalAbsent}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{s.totalMeetings}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-extrabold ${
                            s.attendanceRate >= 90 ? 'text-emerald-600' :
                            s.attendanceRate >= 75 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {s.attendanceRate}%
                          </span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                s.attendanceRate >= 90 ? 'bg-emerald-500' :
                                s.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${s.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Zero horizontal scroll) */}
            <div className="md:hidden divide-y divide-slate-100">
              {summaries.map((s, idx) => (
                <div key={s.studentId} className="p-3.5 space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-[#101A3A] truncate">
                        {s.studentName}
                      </span>
                    </div>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md shrink-0 ${
                      s.attendanceRate >= 90 ? 'bg-emerald-50 text-emerald-700' :
                      s.attendanceRate >= 75 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {s.attendanceRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">NIS: {s.nis}</span>
                    <span>Total: {s.totalMeetings} Hari</span>
                  </div>

                  {/* 5-Column Mini Metrics Grid */}
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px] pt-1">
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg py-1 px-0.5">
                      <p className="font-extrabold text-emerald-800">{s.totalPresent}</p>
                      <p className="text-emerald-600 text-[9px]">Hadir</p>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-100 rounded-lg py-1 px-0.5">
                      <p className="font-extrabold text-amber-800">{s.totalLate}</p>
                      <p className="text-amber-600 text-[9px]">Telat</p>
                    </div>
                    <div className="bg-blue-50/70 border border-blue-100 rounded-lg py-1 px-0.5">
                      <p className="font-extrabold text-blue-800">{s.totalPermission}</p>
                      <p className="text-blue-600 text-[9px]">Izin</p>
                    </div>
                    <div className="bg-purple-50/70 border border-purple-100 rounded-lg py-1 px-0.5">
                      <p className="font-extrabold text-purple-800">{s.totalSick}</p>
                      <p className="text-purple-600 text-[9px]">Sakit</p>
                    </div>
                    <div className="bg-red-50/70 border border-red-100 rounded-lg py-1 px-0.5">
                      <p className="font-extrabold text-red-800">{s.totalAbsent}</p>
                      <p className="text-red-600 text-[9px]">Alpa</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
