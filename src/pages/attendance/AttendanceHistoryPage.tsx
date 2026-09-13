import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertCircle,
  FileText,
  Edit2
} from 'lucide-react';
import { getAttendanceHistory, updateSingleAttendance } from '../../services/firebase/attendanceService';
import { getClasses } from '../../services/firebase/classesService';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, AttendanceStatus, SchoolClass } from '../../types';

export const AttendanceHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Edit status modal
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('HADIR');
  const [newNote, setNewNote] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const cls = await getClasses();
      setClasses(cls);

      const records = await getAttendanceHistory({
        classId: classFilter,
        status: statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setHistory(records);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [classFilter, statusFilter, startDate, endDate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !currentUser) return;

    setEditing(true);
    try {
      await updateSingleAttendance(
        selectedRecord.attendanceId,
        {
          status: newStatus,
          note: newNote.trim() || null
        },
        currentUser
      );
      setSelectedRecord(null);
      await fetchHistory();
    } catch (err) {
      console.error('Error updating attendance:', err);
    } finally {
      setEditing(false);
    }
  };

  const filteredHistory = history.filter(item =>
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: AttendanceStatus) => {
    const map = {
      HADIR: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
      TERLAMBAT: { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: <Clock className="w-3.5 h-3.5 text-amber-600" /> },
      IZIN: { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> },
      SAKIT: { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: <AlertCircle className="w-3.5 h-3.5 text-purple-600" /> },
      ALPA: { bg: 'bg-red-50 text-red-800 border-red-200', icon: <XCircle className="w-3.5 h-3.5 text-red-600" /> }
    }[status] || { bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: null };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${map.bg}`}>
        {map.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Title & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
              Riwayat Absensi Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Catatan historis presensi siswa SMP IT Putra Al-Hanif
            </p>
          </div>
          <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Rekaman: {filteredHistory.length}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cari Santri</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama atau ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Filter Kelas</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.classId} value={c.classId}>Kelas {c.className}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Kehadiran</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            >
              <option value="all">Semua Status</option>
              <option value="HADIR">HADIR</option>
              <option value="TERLAMBAT">TERLAMBAT</option>
              <option value="IZIN">IZIN</option>
              <option value="SAKIT">SAKIT</option>
              <option value="ALPA">ALPA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            />
          </div>
        </div>
      </div>

      {/* List / Table Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Memuat riwayat absensi...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada riwayat absensi yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">
              Sesuaikan filter pencarian atau rekam absensi pada halaman Catat Absensi.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Tanggal & Waktu</th>
                    <th className="py-3.5 px-6">Nama Santri</th>
                    <th className="py-3.5 px-6">Kelas</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Catatan / Alasan</th>
                    <th className="py-3.5 px-6">Petugas</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredHistory.map((rec) => (
                    <tr key={rec.attendanceId || rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {rec.date}
                        {rec.checkInTime && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            Pukul {rec.checkInTime} WIB
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-[#101A3A]">
                        {rec.studentName}
                        <span className="block text-[10px] font-normal text-slate-400 font-mono">
                          {rec.studentId}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        Kelas {rec.className}
                      </td>
                      <td className="py-3.5 px-6">
                        {getStatusBadge(rec.status)}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 italic">
                        {rec.note || '-'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-[11px]">
                        {rec.recordedByName || 'Guru'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {(currentUser?.role === 'admin' || currentUser?.role === 'guru') && (
                          <button
                            onClick={() => {
                              setSelectedRecord(rec);
                              setNewStatus(rec.status);
                              setNewNote(rec.note || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#243B9B] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (Responsive, zero horizontal overflow) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredHistory.map((rec) => (
                <div key={rec.attendanceId || rec.id} className="p-3.5 space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{rec.date}</span>
                    <div className="shrink-0">
                      {getStatusBadge(rec.status)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#101A3A] truncate">{rec.studentName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kelas {rec.className} {rec.checkInTime ? `• Pukul ${rec.checkInTime} WIB` : ''}
                    </p>
                  </div>
                  {rec.note && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic break-words">
                      "{rec.note}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="truncate">Oleh: {rec.recordedByName || 'Petugas'}</span>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'guru') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecord(rec);
                          setNewStatus(rec.status);
                          setNewNote(rec.note || '');
                        }}
                        className="text-xs font-semibold text-[#243B9B] hover:text-blue-800 flex items-center gap-1 cursor-pointer shrink-0 ml-2 py-1 px-2 rounded-md bg-blue-50/60"
                      >
                        <Edit2 className="w-3 h-3" /> Ubah
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-left shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-[#101A3A]">Ubah Catatan Kehadiran</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Santri: <strong>{selectedRecord.studentName}</strong> • Tanggal {selectedRecord.date}
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status Presensi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'] as AttendanceStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        newStatus === st
                          ? 'bg-[#243B9B] text-white border-[#243B9B] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan / Keterangan Tambahan
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Contoh: Alasan izin sakit di klinik asrama..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  disabled={editing}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#243B9B] rounded-xl hover:bg-[#1a2d77] cursor-pointer disabled:opacity-60"
                >
                  {editing ? 'Menyimpan...' : 'Perbarui Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
