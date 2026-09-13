import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { Teacher, UserProfile } from '../types';
import { 
  downloadTeacherExcelTemplate, 
  parseTeacherExcelFile, 
  ParseTeacherExcelResult, 
  ParsedTeacherRow 
} from '../utils/excelUtils';
import { createTeacher } from '../services/firebase/teachersService';

interface ExcelImportTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTeachersCount: number;
  currentUser?: UserProfile | null;
  onSuccess: (importedCount: number) => void;
}

export const ExcelImportTeacherModal: React.FC<ExcelImportTeacherModalProps> = ({
  isOpen,
  onClose,
  existingTeachersCount,
  currentUser,
  onSuccess
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parseResult, setParseResult] = useState<ParseTeacherExcelResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const validExts = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Format file tidak didukung. Harap gunakan file Excel (.xlsx, .xls) atau .csv.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(null);
    setParsing(true);

    try {
      const result = await parseTeacherExcelFile(file, existingTeachersCount);
      if (result.totalRows === 0) {
        setErrorMessage('File Excel kosong atau tidak memiliki baris data.');
      }
      setParseResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file Excel Guru.');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.validCount === 0) return;

    setImporting(true);
    setErrorMessage(null);

    const validRows = parseResult.rows.filter(r => r.isValid);
    let successCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await createTeacher(row.data, currentUser);
        successCount++;
      } catch (err) {
        console.error(`Gagal menyimpan data guru baris ke-${row.rowNumber}:`, err);
      }
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImporting(false);
    setSuccessMessage(`Alhamdulillah! Berhasil mengimpor ${successCount} data guru & asatidz ke database.`);
    
    setTimeout(() => {
      onSuccess(successCount);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#243B9B] text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#101A3A] tracking-tight">
                Impor Data Guru & Asatidz via Excel
              </h3>
              <p className="text-xs text-slate-500">
                Unggah berkas spreadsheet .xlsx dengan format NIY, Jabatan ganda, dan data pengajar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Action Step 1: Download Template */}
          {!parseResult && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Gunakan Format Resmi Excel Guru & Asatidz SMP IT Al-Hanif
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Format sudah disesuaikan dengan kolom NIY, jabatan ganda (Mudir, Wali Kelas, Musyrif, dll), dan email opsional.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadTeacherExcelTemplate}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Format Excel</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Terjadi Kesalahan</p>
                <p className="text-[11px] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="font-bold text-sm">{successMessage}</p>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          {!parseResult && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#243B9B] bg-blue-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-[#243B9B] flex items-center justify-center mb-3 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Pilih atau seret file Excel guru ke sini
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Mendukung format berkas .xlsx, .xls, dan .csv
              </p>
            </div>
          )}

          {/* Parsing State */}
          {parsing && (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-700">Membaca dan memvalidasi struktur berkas Excel...</p>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parseResult && !parsing && (
            <div className="space-y-4">
              {/* Summary Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">
                    File: <span className="font-normal text-slate-600">{parseResult.fileName}</span>
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-[#243B9B]">
                    Total: {parseResult.totalRows} Baris
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                    Valid: {parseResult.validCount}
                  </span>
                  {parseResult.invalidCount > 0 && (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-800">
                      Tidak Valid: {parseResult.invalidCount}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={importing}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ganti File
                </button>
              </div>

              {/* Progress Bar while importing */}
              {importing && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Sedang Menyimpan ke Firestore Database...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#243B9B] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">NIY</th>
                        <th className="py-2.5 px-3">Nama Lengkap & Gelar</th>
                        <th className="py-2.5 px-3">Jabatan</th>
                        <th className="py-2.5 px-3">Mata Pelajaran</th>
                        <th className="py-2.5 px-3">Email (Opsional)</th>
                        <th className="py-2.5 px-3">No WhatsApp</th>
                        <th className="py-2.5 px-3 text-center">Status Validasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.rows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? 'hover:bg-slate-50/60' : 'bg-red-50/50'}
                        >
                          <td className="py-2 px-3 text-slate-400 font-mono">{row.rowNumber}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-700">{row.data.niy}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{row.data.fullName}</td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-1">
                              {row.data.positions.map((p, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-blue-50 text-[#243B9B] text-[10px] font-bold"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[150px]">
                            {row.data.subjects.join(', ')}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {row.data.email || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                            {row.data.phone || '-'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Siap
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-red-600 font-bold text-[11px]"
                                title={row.errors.join(', ')}
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                Error
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <p className="text-xs text-slate-400">
            {parseResult ? `${parseResult.validCount} guru siap disimpan` : 'Pilih berkas Excel terlebih dahulu'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            {parseResult && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing || parseResult.validCount === 0}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#243B9B] hover:bg-[#1a2d77] rounded-xl shadow-md shadow-blue-900/15 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>{importing ? 'Menyimpan...' : `Impor ${parseResult.validCount} Data Guru`}</span>
                {!importing && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
