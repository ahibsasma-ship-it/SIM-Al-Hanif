import React, { useState, useEffect } from 'react';
import { UserSquare2, Plus, Search, Mail, Phone, Edit3, Trash2, X, CheckCircle2 } from 'lucide-react';
import { getStaffList, createStaff, updateStaff, deleteStaff } from '../../services/firebase/staffService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Staff } from '../../types';

export const StaffPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    nip: '',
    position: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await getStaffList();
      setStaffList(data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      nip: `19${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
      position: 'Staff Tata Usaha',
      email: '',
      phone: '',
      address: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      fullName: s.fullName,
      nip: s.nip,
      position: s.position,
      email: s.email,
      phone: s.phone,
      address: s.address
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.position) return;

    setSubmitting(true);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.staffId, formData, currentUser);
        setFeedback(`Data tendik ${formData.fullName} berhasil diperbarui.`);
      } else {
        const staffId = `STF-2026-${String(staffList.length + 10).padStart(4, '0')}`;
        await createStaff(
          {
            staffId,
            ...formData,
            status: 'active'
          },
          currentUser
        );
        setFeedback(`Tenaga kependidikan ${formData.fullName} berhasil ditambahkan.`);
      }
      setShowModal(false);
      await fetchStaff();
    } catch (err) {
      console.error('Staff submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;
    setSubmitting(true);
    try {
      await deleteStaff(deletingStaff.staffId, deletingStaff.fullName, currentUser);
      setDeletingStaff(null);
      await fetchStaff();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nip.includes(searchQuery)
  );

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
                <UserSquare2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
                Tenaga Kependidikan (Tendik)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data staf tata usaha, pengelola dapodik, mudir asrama, dan administrasi
            </p>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#243B9B] hover:bg-[#1a2d77] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tendik Baru</span>
            </button>
          )}
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{feedback}</span>
          </div>
        )}

        <div className="pt-4 max-w-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tendik, jabatan, NIP..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#243B9B]"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Memuat data tenaga kependidikan...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100">
            <UserSquare2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada staf ditemukan</p>
          </div>
        ) : (
          filteredStaff.map(s => (
            <div key={s.staffId} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-950 text-white font-bold text-base flex items-center justify-center shadow-xs">
                    {s.fullName.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {s.position}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#101A3A] mt-3">{s.fullName}</h3>
                <p className="text-[11px] text-slate-400 font-mono">NIP: {s.nip}</p>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email || '-'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone || '-'}</span>
                  </p>
                </div>
              </div>

              {currentUser?.role === 'admin' && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingStaff(s)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-left shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101A3A]">
                {editingStaff ? 'Perbarui Data Tendik' : 'Tambah Tendik Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nama & Gelar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Bagian *</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Contoh: Kepala Tata Usaha, Operator Dapodik"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@alhanif.sch.id"
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
                  placeholder="0813xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
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

      <ConfirmModal
        isOpen={Boolean(deletingStaff)}
        title="Hapus Data Tendik"
        message={`Hapus data ${deletingStaff?.fullName}?`}
        isDanger={true}
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingStaff(null)}
      />
    </div>
  );
};
