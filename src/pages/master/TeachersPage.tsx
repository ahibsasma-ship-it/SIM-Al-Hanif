import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  BookOpen, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  Briefcase,
  BadgeCheck,
  Filter
} from 'lucide-react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/firebase/teachersService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ExcelImportTeacherModal } from '../../components/ExcelImportTeacherModal';
import { exportTeachersToExcel, downloadTeacherExcelTemplate } from '../../utils/excelUtils';
import { Teacher, TEACHER_POSITIONS, TeacherPosition } from '../../types';

export const TeachersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>('all');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    niy: '',
    gender: 'L' as 'L' | 'P',
    email: '',
    phone: '',
    address: '',
    positions: ['Guru Mapel'] as string[],
    subjectsStr: ''
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      niy: `YAH-2026-${String(teachers.length + 1).padStart(3, '0')}`,
      gender: 'L',
      email: '',
      phone: '',
      address: '',
      positions: ['Guru Mapel'],
      subjectsStr: 'Tahfidz Al-Qur\'an, Bahasa Arab'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      fullName: t.fullName,
      niy: t.niy || t.nip || '',
      gender: t.gender,
      email: t.email || '',
      phone: t.phone || '',
      address: t.address || '',
      positions: (t.positions && t.positions.length > 0) ? t.positions : ['Guru Mapel'],
      subjectsStr: (t.subjects && t.subjects.length > 0) ? t.subjects.join(', ') : ''
    });
    setShowModal(true);
  };

  const handleTogglePosition = (pos: string) => {
    setFormData(prev => {
      const exists = prev.positions.includes(pos);
      if (exists) {
        // Must keep at least one position
        if (prev.positions.length === 1) return prev;
        return { ...prev, positions: prev.positions.filter(p => p !== pos) };
      } else {
        return { ...prev, positions: [...prev.positions, pos] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.niy.trim()) return;

    setSubmitting(true);
    try {
      const subjects = formData.subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

      if (editingTeacher) {
        await updateTeacher(
          editingTeacher.teacherId,
          {
            fullName: formData.fullName.trim(),
            niy: formData.niy.trim(),
            nip: formData.niy.trim(),
            gender: formData.gender,
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            positions: formData.positions,
            subjects
          },
          currentUser
        );
        setFeedback(`Data ustadz ${formData.fullName} berhasil diperbarui.`);
      } else {
        const teacherId = `TCH-2026-${String(teachers.length + 10).padStart(4, '0')}`;
        await createTeacher(
          {
            teacherId,
            fullName: formData.fullName.trim(),
            niy: formData.niy.trim(),
            nip: formData.niy.trim(),
            gender: formData.gender,
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            positions: formData.positions,
            subjects,
            classIds: [],
            status: 'active'
          },
          currentUser
        );
        setFeedback(`Ustadz baru ${formData.fullName} (NIY: ${formData.niy}) berhasil ditambahkan.`);
      }

      setShowModal(false);
      await fetchTeachers();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTeacher) return;
    setSubmitting(true);
    try {
      await deleteTeacher(deletingTeacher.teacherId, deletingTeacher.fullName, currentUser);
      setDeletingTeacher(null);
      await fetchTeachers();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const q = searchQuery.toLowerCase();
    const niyVal = (t.niy || t.nip || '').toLowerCase();
    const matchesQuery = 
      t.fullName.toLowerCase().includes(q) ||
      niyVal.includes(q) ||
      (t.positions && t.positions.some(p => p.toLowerCase().includes(q))) ||
      (t.subjects && t.subjects.some(s => s.toLowerCase().includes(q)));

    if (!matchesQuery) return false;

    if (selectedPositionFilter !== 'all') {
      return t.positions && t.positions.includes(selectedPositionFilter);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
                Data Guru & Asatidz
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direktori tenaga pendidik, pimpinan, wali kelas, dan pembina asrama/halaqoh SMP IT Putra Al-Hanif
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download template */}
            <button
              type="button"
              onClick={downloadTeacherExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Unduh Format Excel untuk Impor"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Format Excel</span>
            </button>

            {/* Export button */}
            <button
              type="button"
              onClick={() => exportTeachersToExcel(teachers)}
              disabled={teachers.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              title="Ekspor ke Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            {currentUser?.role === 'admin' && (
              <>
                {/* Import Excel */}
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#243B9B] border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Impor Excel</span>
                </button>

                {/* Add Teacher */}
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-[#243B9B] hover:bg-[#1a2d77] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Guru</span>
                </button>
              </>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{feedback}</span>
          </div>
        )}

        {/* Search & Position Filters */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ustadz, NIY, jabatan, atau mata pelajaran..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px] shrink-0">
              <Filter className="w-3.5 h-3.5" /> Jabatan:
            </span>
            <button
              type="button"
              onClick={() => setSelectedPositionFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                selectedPositionFilter === 'all'
                  ? 'bg-[#243B9B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({teachers.length})
            </button>
            {TEACHER_POSITIONS.slice(0, 5).map(pos => {
              const count = teachers.filter(t => t.positions && t.positions.includes(pos)).length;
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSelectedPositionFilter(pos)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedPositionFilter === pos
                      ? 'bg-[#243B9B] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pos} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Memuat data asatidz...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada guru ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter jabatan</p>
          </div>
        ) : (
          filteredTeachers.map(t => (
            <div key={t.teacherId} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#243B9B] to-[#101A3A] text-white font-bold text-base flex items-center justify-center shadow-xs">
                    {t.fullName.replace(/^(Ustadz|Ustadzah|Ust\.|Dr\.|H\.)\s+/i, '').charAt(0) || 'U'}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Aktif
                  </span>
                </div>

                <h3 className="text-sm font-black text-[#101A3A] mt-3 leading-snug">{t.fullName}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">NIY</span>
                  <span className="text-xs font-mono font-bold text-[#243B9B]">{t.niy || t.nip || '-'}</span>
                </div>

                {/* Jabatan (Positions) */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Jabatan:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {t.positions && t.positions.length > 0 ? (
                      t.positions.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-blue-50/80 text-[#243B9B] border border-blue-100 rounded-md text-[10px] font-bold">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[10px]">Guru Mapel</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.email || <span className="text-slate-400 italic">Email belum diisi</span>}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{t.phone || '-'}</span>
                  </p>
                </div>

                {/* Subjects */}
                {t.subjects && t.subjects.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-50 flex flex-wrap gap-1">
                    {t.subjects.map(s => (
                      <span key={s} className="px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {currentUser?.role === 'admin' && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Data Guru"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingTeacher(t)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Data Guru"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 text-left shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-[#101A3A]">
                  {editingTeacher ? 'Perbarui Data Guru & Asatidz' : 'Tambah Guru & Asatidz Baru'}
                </h3>
                <p className="text-xs text-slate-500">Nomor Induk Yayasan (NIY) dan Jabatan ganda</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-3 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Ustadz Ahmad Fauzi, Lc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#243B9B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIY (Nomor Induk Yayasan) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.niy}
                    onChange={(e) => setFormData({ ...formData, niy: e.target.value })}
                    placeholder="Contoh: YAH-1988-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Resmi <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@alhanif.sch.id (opsional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Multi-Jabatan Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Jabatan Struktural & Fungsional *
                  </label>
                  <span className="text-[11px] text-[#243B9B] font-semibold">
                    Dapat memilih lebih dari satu
                  </span>
                </div>
                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {TEACHER_POSITIONS.map(pos => {
                    const isChecked = formData.positions.includes(pos);
                    return (
                      <label
                        key={pos}
                        onClick={() => handleTogglePosition(pos)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer select-none transition-colors border ${
                          isChecked 
                            ? 'bg-blue-50 border-blue-200 text-[#243B9B] font-bold' 
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-100/70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by label click
                          className="w-3.5 h-3.5 text-[#243B9B] rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="truncate">{pos}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="L">Laki-laki (Ikhwan / Ustadz)</option>
                    <option value="P">Perempuan (Akhawat / Ustadzah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formData.subjectsStr}
                  onChange={(e) => setFormData({ ...formData, subjectsStr: e.target.value })}
                  placeholder="Tahfidz Al-Qur'an, Bahasa Arab, Fiqih"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Kompleks Asrama Guru Al-Hanif"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#243B9B] rounded-xl hover:bg-[#1a2d77] disabled:opacity-60 cursor-pointer shadow-md shadow-blue-900/15 transition-all"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ExcelImportTeacherModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          existingTeachersCount={teachers.length}
          currentUser={currentUser}
          onSuccess={(count) => {
            setFeedback(`Alhamdulillah! Berhasil mengimpor ${count} data guru baru dari Excel.`);
            fetchTeachers();
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={Boolean(deletingTeacher)}
        title="Hapus Data Guru"
        message={`Hapus data ${deletingTeacher?.fullName}?`}
        isDanger={true}
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTeacher(null)}
      />
    </div>
  );
};

