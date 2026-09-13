import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, BookOpen, Edit3, Trash2, X, CheckCircle2 } from 'lucide-react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/firebase/teachersService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Teacher } from '../../types';

export const TeachersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    nip: '',
    gender: 'L' as 'L' | 'P',
    email: '',
    phone: '',
    address: '',
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
      nip: `19${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
      gender: 'L',
      email: '',
      phone: '',
      address: '',
      subjectsStr: 'Tahfidz Al-Qur\'an, Bahasa Arab'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      fullName: t.fullName,
      nip: t.nip,
      gender: t.gender,
      email: t.email,
      phone: t.phone,
      address: t.address,
      subjectsStr: t.subjects.join(', ')
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    setSubmitting(true);
    try {
      const subjects = formData.subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

      if (editingTeacher) {
        await updateTeacher(
          editingTeacher.teacherId,
          {
            fullName: formData.fullName,
            nip: formData.nip,
            gender: formData.gender,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
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
            fullName: formData.fullName,
            nip: formData.nip,
            gender: formData.gender,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            subjects,
            classIds: [],
            status: 'active'
          },
          currentUser
        );
        setFeedback(`Ustadz baru ${formData.fullName} berhasil ditambahkan.`);
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

  const filteredTeachers = teachers.filter(t =>
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nip.includes(searchQuery) ||
    t.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
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
              Direktori tenaga pendidik dan pembina asrama SMP IT Putra Al-Hanif
            </p>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#243B9B] hover:bg-[#1a2d77] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          )}
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{feedback}</span>
          </div>
        )}

        {/* Search */}
        <div className="pt-4 max-w-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ustadz, NIP, atau mata pelajaran..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            />
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
          </div>
        ) : (
          filteredTeachers.map(t => (
            <div key={t.teacherId} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#243B9B] to-[#101A3A] text-white font-bold text-base flex items-center justify-center shadow-xs">
                    {t.fullName.replace('Ustadz ', '').charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Aktif
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#101A3A] mt-3">{t.fullName}</h3>
                <p className="text-[11px] text-slate-400 font-mono">NIP: {t.nip}</p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{t.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.phone || '-'}</span>
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {t.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-[#243B9B] rounded-md text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {currentUser?.role === 'admin' && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingTeacher(t)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-left shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101A3A]">
                {editingTeacher ? 'Perbarui Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-3">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@alhanif.sch.id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

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
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formData.subjectsStr}
                  onChange={(e) => setFormData({ ...formData, subjectsStr: e.target.value })}
                  placeholder="Tahfidz Al-Qur'an, Bahasa Arab, Fiqih"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#243B9B] rounded-xl hover:bg-[#1a2d77] disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
