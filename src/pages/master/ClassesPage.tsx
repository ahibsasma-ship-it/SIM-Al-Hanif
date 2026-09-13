import React, { useState, useEffect } from 'react';
import { School, Plus, Users, UserCheck, Edit3, Trash2, X, CheckCircle2, Search } from 'lucide-react';
import { getClasses, createClass, updateClass, deleteClass } from '../../services/firebase/classesService';
import { getTeachers } from '../../services/firebase/teachersService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SchoolClass, Teacher } from '../../types';

export const ClassesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [deletingClass, setDeletingClass] = useState<SchoolClass | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    className: '',
    grade: 8,
    academicYear: '2026/2027',
    homeroomTeacherId: '',
    homeroomTeacherName: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cls, tchs] = await Promise.all([getClasses(), getTeachers()]);
      setClasses(cls);
      setTeachers(tchs);
      if (tchs.length > 0 && !formData.homeroomTeacherId) {
        setFormData(prev => ({
          ...prev,
          homeroomTeacherId: tchs[0].teacherId,
          homeroomTeacherName: tchs[0].fullName
        }));
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      className: 'VII C',
      grade: 7,
      academicYear: '2026/2027',
      homeroomTeacherId: teachers[0]?.teacherId || '',
      homeroomTeacherName: teachers[0]?.fullName || ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: SchoolClass) => {
    setEditingClass(c);
    setFormData({
      className: c.className,
      grade: c.grade,
      academicYear: c.academicYear,
      homeroomTeacherId: c.homeroomTeacherId,
      homeroomTeacherName: c.homeroomTeacherName
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className) return;

    setSubmitting(true);
    try {
      const teacher = teachers.find(t => t.teacherId === formData.homeroomTeacherId);
      const teacherName = teacher?.fullName || formData.homeroomTeacherName;

      if (editingClass) {
        await updateClass(
          editingClass.classId,
          {
            className: formData.className,
            grade: formData.grade,
            academicYear: formData.academicYear,
            homeroomTeacherId: formData.homeroomTeacherId,
            homeroomTeacherName: teacherName
          },
          currentUser
        );
        setFeedback(`Kelas ${formData.className} berhasil diperbarui.`);
      } else {
        const classId = `CLS-${formData.className.replace(/\s+/g, '')}-2026`;
        await createClass(
          {
            classId,
            className: formData.className,
            grade: formData.grade,
            academicYear: formData.academicYear,
            homeroomTeacherId: formData.homeroomTeacherId,
            homeroomTeacherName: teacherName,
            studentCount: 0,
            status: 'active'
          },
          currentUser
        );
        setFeedback(`Kelas baru ${formData.className} berhasil dibuat.`);
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      console.error('Class submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClass) return;
    setSubmitting(true);
    try {
      await deleteClass(deletingClass.classId, deletingClass.className, currentUser);
      setDeletingClass(null);
      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
                <School className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
                Data Rombongan Belajar (Kelas)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Daftar kelas santri SMP IT Putra Al-Hanif tahun ajaran 2026/2027
            </p>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#243B9B] hover:bg-[#1a2d77] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas Baru</span>
            </button>
          )}
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{feedback}</span>
          </div>
        )}
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Memuat data rombel kelas...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100">
            <School className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum ada data kelas</p>
          </div>
        ) : (
          classes.map(c => (
            <div key={c.classId} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#243B9B] border border-blue-100">
                    Tingkat {c.grade}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    TA: {c.academicYear}
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#101A3A] mt-3">
                  Kelas {c.className}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#243B9B]" />
                  <span>Wali: <strong>{c.homeroomTeacherName || 'Belum ditentukan'}</strong></span>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Kapasitas Terisi
                  </span>
                  <span className="font-bold text-slate-800">
                    {c.studentCount || 30} Santri
                  </span>
                </div>
              </div>

              {currentUser?.role === 'admin' && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingClass(c)}
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
                {editingClass ? 'Perbarui Rombel Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="Contoh: VII A, VIII B, IX A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat / Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value={7}>Kelas 7</option>
                    <option value={8}>Kelas 8</option>
                    <option value={9}>Kelas 9</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wali Kelas (Asatidz)</label>
                <select
                  value={formData.homeroomTeacherId}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Pilih Wali Kelas --</option>
                  {teachers.map(t => (
                    <option key={t.teacherId} value={t.teacherId}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
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
        isOpen={Boolean(deletingClass)}
        title="Hapus Kelas"
        message={`Hapus kelas ${deletingClass?.className}?`}
        isDanger={true}
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingClass(null)}
      />
    </div>
  );
};
