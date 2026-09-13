import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  XCircle, 
  Save, 
  RotateCcw, 
  Sparkles,
  Check,
  AlertTriangle,
  ChevronRight,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getClasses } from '../../services/firebase/classesService';
import { getStudentsByClass } from '../../services/firebase/studentsService';
import { getAttendanceByClassAndDate, recordBulkAttendance } from '../../services/firebase/attendanceService';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SchoolClass, Student, AttendanceStatus } from '../../types';

interface StudentAttendanceDraft {
  studentId: string;
  studentName: string;
  nis: string;
  classId: string;
  className: string;
  boardingStatus: string;
  status: AttendanceStatus;
  checkInTime?: string;
  note: string;
}

export const QuickAttendancePage: React.FC = () => {
  const { currentUser } = useAuth();

  // Selected date (default today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Classes list
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Student drafts
  const [attendanceDrafts, setAttendanceDrafts] = useState<StudentAttendanceDraft[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      const cls = await getClasses();
      setClasses(cls);
      if (cls.length > 0) {
        // If guru has a homeroom or assigned class, prefer it
        const preferred = currentUser?.classId 
          ? cls.find(c => c.classId === currentUser.classId)?.classId || cls[0].classId
          : cls[0].classId;
        setSelectedClassId(preferred);
      }
    };
    fetchClasses();
  }, [currentUser]);

  // Load students and existing attendance when class or date changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadClassAttendance = async () => {
      setLoading(true);
      setFeedback(null);
      try {
        const currentClass = classes.find(c => c.classId === selectedClassId);
        const className = currentClass?.className || selectedClassId;

        // 1. Fetch students in this class
        const students = await getStudentsByClass(selectedClassId);
        
        // 2. Fetch existing attendance records for this date & class
        const existingRecords = await getAttendanceByClassAndDate(selectedClassId, selectedDate);
        const existingMap = new Map(existingRecords.map(r => [r.studentId, r]));

        setIsExistingRecord(existingRecords.length > 0);

        // 3. Build drafts (default HADIR if not existing)
        const drafts: StudentAttendanceDraft[] = students.map(s => {
          const recorded = existingMap.get(s.studentId);
          return {
            studentId: s.studentId,
            studentName: s.fullName,
            nis: s.nis,
            classId: s.classId,
            className: s.className || className,
            boardingStatus: s.boardingStatus,
            status: recorded ? recorded.status : 'HADIR',
            checkInTime: recorded?.checkInTime,
            note: recorded?.note || ''
          };
        });

        setAttendanceDrafts(drafts);
      } catch (err) {
        console.error('Error loading attendance drafts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassAttendance();
  }, [selectedClassId, selectedDate, classes]);

  // Update status for single student
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setAttendanceDrafts(prev =>
      prev.map(d => (d.studentId === studentId ? { ...d, status: newStatus } : d))
    );
  };

  // Update note for single student
  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceDrafts(prev =>
      prev.map(d => (d.studentId === studentId ? { ...d, note } : d))
    );
  };

  // Quick Action: Mark all as HADIR
  const handleSetAllHadir = () => {
    setAttendanceDrafts(prev => prev.map(d => ({ ...d, status: 'HADIR' })));
  };

  // Summary counts
  const summaryCounts = attendanceDrafts.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { HADIR: 0, TERLAMBAT: 0, IZIN: 0, SAKIT: 0, ALPA: 0 } as Record<AttendanceStatus, number>
  );

  // Submit bulk attendance
  const handleSaveAttendance = async () => {
    if (!currentUser) return;
    setSaving(true);
    setShowConfirmModal(false);

    try {
      const recordsToSave = attendanceDrafts.map(d => ({
        studentId: d.studentId,
        studentName: d.studentName,
        classId: d.classId,
        className: d.className,
        date: selectedDate,
        status: d.status,
        checkInTime: d.checkInTime,
        note: d.note.trim() ? d.note.trim() : null
      }));

      const res = await recordBulkAttendance(recordsToSave, currentUser);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setIsExistingRecord(true);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan saat menyimpan absensi.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredDrafts = attendanceDrafts.filter(d =>
    d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.nis.includes(searchQuery)
  );

  const selectedClass = classes.find(c => c.classId === selectedClassId);

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
                Absensi Siswa Harian
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Catat kehadiran santri per kelas dengan pencegahan duplikasi otomatis
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Hadir: {summaryCounts.HADIR}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Terlambat: {summaryCounts.TERLAMBAT}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              Izin: {summaryCounts.IZIN}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
              Sakit: {summaryCounts.SAKIT}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Alpa: {summaryCounts.ALPA}
            </span>
          </div>
        </div>

        {/* Date & Class Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tanggal Presensi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            >
              {classes.map(c => (
                <option key={c.classId} value={c.classId}>
                  Kelas {c.className} (Wali: {c.homeroomTeacherName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSetAllHadir}
              disabled={loading || attendanceDrafts.length === 0}
              className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              Set Semua Hadir
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || saving || attendanceDrafts.length === 0}
              className="flex-1 py-2.5 px-4 bg-[#243B9B] hover:bg-[#1a2d77] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </div>
        </div>

        {/* Existing Record Indicator */}
        {isExistingRecord && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Absensi untuk Kelas <strong>{selectedClass?.className}</strong> tanggal <strong>{selectedDate}</strong> sudah pernah tersimpan. Perubahan yang Anda simpan akan memperbarui data sebelumnya secara aman.
              </span>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Search & Student List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama santri atau NIS..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Siswa: {filteredDrafts.length}
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Memuat data santri kelas...</p>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada data santri ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              Silakan periksa pilihan kelas atau tambahkan siswa baru di Data Master.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredDrafts.map((draft, index) => (
              <div
                key={draft.studentId}
                className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#101A3A] truncate">
                        {draft.studentName}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#243B9B] border border-blue-100">
                        NIS: {draft.nis}
                      </span>
                      {draft.boardingStatus === 'boarding' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                          Santri Asrama
                        </span>
                      )}
                    </div>
                    {/* Note input if not Hadir */}
                    {draft.status !== 'HADIR' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={draft.note}
                          onChange={(e) => handleNoteChange(draft.studentId, e.target.value)}
                          placeholder={`Catatan/alasan untuk status ${draft.status.toLowerCase()}...`}
                          className="w-full max-w-md px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#243B9B]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggle Buttons - Fully Responsive Mobile Grid & Desktop Flex */}
                <div className="grid grid-cols-5 gap-1 w-full sm:w-auto sm:flex sm:items-center sm:gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'] as AttendanceStatus[]).map(st => {
                    const isSelected = draft.status === st;
                    const styles = {
                      HADIR: isSelected ? 'bg-[#0E9F6E] text-white shadow-sm ring-1 ring-[#0E9F6E]' : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/60',
                      TERLAMBAT: isSelected ? 'bg-[#F28C18] text-white shadow-sm ring-1 ring-[#F28C18]' : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/60',
                      IZIN: isSelected ? 'bg-[#243B9B] text-white shadow-sm ring-1 ring-[#243B9B]' : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60',
                      SAKIT: isSelected ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-600' : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200/60',
                      ALPA: isSelected ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-600' : 'bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200/60'
                    }[st];

                    // Label: on very narrow mobile screens, show TRLMBT or compact
                    const label = st === 'TERLAMBAT' ? (
                      <>
                        <span className="sm:hidden">TELAT</span>
                        <span className="hidden sm:inline">TERLAMBAT</span>
                      </>
                    ) : st;

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(draft.studentId, st)}
                        className={`py-2 px-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center justify-center flex items-center cursor-pointer ${styles}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Simpan Absensi Kelas"
        message={`Pastikan data kehadiran untuk Kelas ${selectedClass?.className} tanggal ${selectedDate} sudah sesuai:
        • Hadir: ${summaryCounts.HADIR}
        • Terlambat: ${summaryCounts.TERLAMBAT}
        • Izin: ${summaryCounts.IZIN}
        • Sakit: ${summaryCounts.SAKIT}
        • Alpa: ${summaryCounts.ALPA}
        Total siswa: ${attendanceDrafts.length}. Apakah Anda ingin menyimpan sekarang?`}
        confirmText="Simpan Sekarang"
        cancelText="Periksa Lagi"
        isLoading={saving}
        onConfirm={handleSaveAttendance}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
