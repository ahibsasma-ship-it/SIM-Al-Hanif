import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  User, 
  Home, 
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload
} from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/firebase/studentsService';
import { getClasses } from '../../services/firebase/classesService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ExcelImportModal } from '../../components/ExcelImportModal';
import { downloadStudentExcelTemplate, exportStudentsToExcel } from '../../utils/excelUtils';
import { Student, SchoolClass } from '../../types';

interface StudentsPageProps {
  onSelectStudent?: (studentId: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ onSelectStudent }) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classFilter, setClassFilter] = useState('all');
  const [boardingFilter, setBoardingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    nis: '',
    nisn: '',
    gender: 'L' as 'L' | 'P',
    birthPlace: '',
    birthDate: '',
    religion: 'Islam',
    address: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    classId: '',
    boardingStatus: 'boarding' as 'boarding' | 'non_boarding',
    dormitoryName: '',
    halaqoh: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const cls = await getClasses();
      setClasses(cls);
      if (cls.length > 0 && !formData.classId) {
        setFormData(prev => ({ ...prev, classId: cls[0].classId }));
      }

      const res = await getStudents({
        classId: classFilter,
        boardingStatus: boardingFilter
      });
      setStudents(res);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classFilter, boardingFilter]);

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      nis: `260${String(students.length + 1).padStart(4, '0')}`,
      nisn: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      gender: 'L',
      birthPlace: 'Bandung',
      birthDate: '2012-05-15',
      religion: 'Islam',
      address: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      classId: classes[0]?.classId || 'CLS-8A-2026',
      boardingStatus: 'boarding',
      dormitoryName: 'Asrama Abu Bakar',
      halaqoh: 'Halaqoh Ustadz Ahmad Fauzi, Lc.'
    });
    setEditingStudent(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      nis: student.nis,
      nisn: student.nisn,
      gender: student.gender,
      birthPlace: student.birthPlace || '',
      birthDate: student.birthDate || '',
      religion: student.religion || 'Islam',
      address: student.address || '',
      phone: student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      classId: student.classId,
      boardingStatus: student.boardingStatus,
      dormitoryName: student.dormitoryName || '',
      halaqoh: student.halaqoh || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.nis || !formData.classId) return;

    setSubmitting(true);
    try {
      const targetClass = classes.find(c => c.classId === formData.classId);
      const className = targetClass?.className || 'VIII A';

      if (editingStudent) {
        await updateStudent(
          editingStudent.studentId,
          {
            ...formData,
            className
          },
          currentUser
        );
        setFeedback({ type: 'success', message: `Data santri ${formData.fullName} berhasil diperbarui.` });
      } else {
        const studentId = `STU-2026-${String(students.length + 100).padStart(4, '0')}`;
        await createStudent(
          {
            studentId,
            ...formData,
            className,
            status: 'active'
          },
          currentUser
        );
        setFeedback({ type: 'success', message: `Santri baru ${formData.fullName} berhasil didaftarkan.` });
      }

      setShowAddModal(false);
      setEditingStudent(null);
      await fetchStudents();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Gagal menyimpan data santri.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setSubmitting(true);
    try {
      await deleteStudent(deletingStudent.studentId, deletingStudent.fullName, currentUser);
      setFeedback({ type: 'success', message: `Santri ${deletingStudent.fullName} berhasil dihapus.` });
      setDeletingStudent(null);
      await fetchStudents();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Gagal menghapus santri.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.includes(searchQuery) ||
    s.nisn.includes(searchQuery)
  );

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
                Data Santri Al-Hanif
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manajemen buku induk siswa dan santri boarding school SMP IT Putra Al-Hanif
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadStudentExcelTemplate}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Unduh format template Excel untuk impor data santri"
            >
              <Download className="w-3.5 h-3.5 text-[#243B9B]" />
              <span>Format Excel</span>
            </button>

            {(currentUser?.role === 'admin' || currentUser?.role === 'tendik') && (
              <>
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0E9F6E] hover:bg-[#0b8259] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  title="Unggah file Excel untuk menambah banyak santri sekaligus"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Impor Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#243B9B] hover:bg-[#1a2d77] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Santri</span>
                </button>
              </>
            )}

            {filteredStudents.length > 0 && (
              <button
                type="button"
                onClick={() => exportStudentsToExcel(filteredStudents)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="Ekspor santri yang tampil ke file Excel"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Ekspor</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span className="font-semibold">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cari Santri</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama, NIS, atau NISN..."
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Asrama</label>
            <select
              value={boardingFilter}
              onChange={(e) => setBoardingFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
            >
              <option value="all">Semua Status</option>
              <option value="boarding">Santri Boarding (Asrama)</option>
              <option value="non_boarding">Non-Boarding (Pulang-Pergi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Memuat data santri...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada santri ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau tambahkan santri baru.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">ID & NIS</th>
                    <th className="py-3.5 px-6">Nama Lengkap</th>
                    <th className="py-3.5 px-6">Kelas</th>
                    <th className="py-3.5 px-6">Status Asrama</th>
                    <th className="py-3.5 px-6">Wali Santri & Kontak</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredStudents.map((s) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <span className="font-mono font-bold text-[#243B9B] block">{s.nis}</span>
                        <span className="text-[10px] text-slate-400 font-mono">NISN: {s.nisn}</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => onSelectStudent && onSelectStudent(s.studentId)}
                          className="font-bold text-[#101A3A] hover:text-[#243B9B] transition-colors text-left cursor-pointer"
                        >
                          {s.fullName}
                        </button>
                        <span className="block text-[11px] text-slate-400">
                          {s.birthPlace}, {s.birthDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        Kelas {s.className}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          s.boardingStatus === 'boarding'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.boardingStatus === 'boarding' ? 'Boarding (Asrama)' : 'Full Day'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="font-semibold text-slate-800">{s.parentName || '-'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{s.parentPhone || '-'}</p>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudent && onSelectStudent(s.studentId)}
                            className="p-1.5 text-slate-500 hover:text-[#243B9B] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Profil & Absensi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentUser?.role === 'admin' || currentUser?.role === 'tendik') && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(s)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Data"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {currentUser?.role === 'admin' && (
                                <button
                                  onClick={() => setDeletingStudent(s)}
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Data"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (100% responsive, fits perfectly on any mobile screen) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <div key={s.studentId} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#243B9B] bg-blue-50 px-2 py-0.5 rounded-md">
                      NIS: {s.nis}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Kelas {s.className}
                    </span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectStudent && onSelectStudent(s.studentId)}
                      className="text-sm font-bold text-[#101A3A] hover:text-[#243B9B] transition-colors text-left block"
                    >
                      {s.fullName}
                    </button>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Wali: {s.parentName || '-'} • Telp: {s.parentPhone || '-'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      s.boardingStatus === 'boarding'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {s.boardingStatus === 'boarding' ? 'Asrama Putra' : 'Full Day'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectStudent && onSelectStudent(s.studentId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Detail
                      </button>

                      {(currentUser?.role === 'admin' || currentUser?.role === 'tendik') && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#243B9B] rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                      )}

                      {currentUser?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => setDeletingStudent(s)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 text-left shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#101A3A]">
                {editingStudent ? 'Perbarui Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Contoh: Muhammad Rayhan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  >
                    {classes.map(c => (
                      <option key={c.classId} value={c.classId}>Kelas {c.className}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Induk Siswa (NIS) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  >
                    <option value="L">Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Nama Ayah / Ibu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Wali</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="0812xxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Asrama / Boarding</label>
                  <select
                    value={formData.boardingStatus}
                    onChange={(e) => setFormData({ ...formData, boardingStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  >
                    <option value="boarding">Santri Boarding (Tinggal di Asrama)</option>
                    <option value="non_boarding">Non-Boarding (Full Day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Asal</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Kota / Alamat domisili"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#243B9B]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#243B9B] rounded-xl hover:bg-[#1a2d77] cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : editingStudent ? 'Simpan Perubahan' : 'Daftarkan Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingStudent)}
        title="Hapus Data Santri"
        message={`Apakah Anda yakin ingin menghapus data santri "${deletingStudent?.fullName}" (NIS: ${deletingStudent?.nis})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        isDanger={true}
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingStudent(null)}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        classes={classes}
        currentUser={currentUser}
        onSuccess={(count) => {
          fetchStudents();
          setFeedback({
            type: 'success',
            message: `Alhamdulillah! Berhasil mengimpor ${count} santri ke database Firebase.`
          });
        }}
      />
    </div>
  );
};
