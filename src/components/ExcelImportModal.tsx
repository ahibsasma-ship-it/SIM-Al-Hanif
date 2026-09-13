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
import { SchoolClass, Student, UserProfile } from '../types';
import { 
  downloadStudentExcelTemplate, 
  parseStudentExcelFile, 
  ParseExcelResult, 
  ParsedStudentRow 
} from '../utils/excelUtils';
import { createStudent } from '../services/firebase/studentsService';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  currentUser?: UserProfile | null;
  onSuccess: (importedCount: number) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  currentUser,
  onSuccess
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parseResult, setParseResult] = useState<ParseExcelResult | null>(null);
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
    // Validate file type
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
      const result = await parseStudentExcelFile(file, classes);
      if (result.totalRows === 0) {
        setErrorMessage('File Excel kosong atau tidak memiliki baris data.');
      }
      setParseResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file Excel.');
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
    let successCount = 0;
    const validRows = parseResult.rows.filter(r => r.isValid);

    try {
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        await createStudent(row.data, currentUser);
        successCount++;
        setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
      }

      setSuccessMessage(`Alhamdulillah! Berhasil mengimpor ${successCount} data santri ke Firebase Firestore.`);
      setTimeout(() => {
        onSuccess(successCount);
        onClose();
        handleReset();
      }, 1500);
    } catch (err: any) {
      console.error('Error batch importing students:', err);
      setErrorMessage(`Sebagian data gagal diimpor: ${err?.message || 'Koneksi database bermasalah'}. ${successCount} santri tersimpan.`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-left shadow-2xl border border-slate-100 my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-[#101A3A] truncate">
                Impor Data Santri dari Excel
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Unggah file Excel (.xlsx) untuk menambahkan data siswa secara massal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {/* Action to Download Template */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#243B9B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F28C18]" />
                Format Excel Standar Al-Hanif
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Gunakan template resmi agar kolom nama santri, NIS, kelas, dan data asrama terpetakan otomatis.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadStudentExcelTemplate}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#243B9B] border border-blue-200 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Format Excel (.xlsx)</span>
            </button>
          </div>

          {/* Upload Area (Shown if no file selected yet) */}
          {!parseResult && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-[#243B9B] bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Pilih atau Geser File Excel ke Sini
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format <strong>.XLSX</strong>, <strong>.XLS</strong>, atau <strong>.CSV</strong>
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                <span>Pilih File Dari Komputer / HP</span>
              </div>
            </div>
          )}

          {/* Parsing Spinner */}
          {parsing && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
              <p className="text-xs font-bold text-slate-700">Membaca dan memvalidasi file Excel...</p>
            </div>
          )}

          {/* Parse Result Preview */}
          {parseResult && (
            <div className="space-y-3">
              {/* Summary Pill Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
                    {parseResult.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px]">
                    {parseResult.validCount} Siap Impor
                  </span>
                  {parseResult.invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px]">
                      {parseResult.invalidCount} Bermasalah
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={importing}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer ml-1"
                    title="Ganti File"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview List (Mobile First Cards) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 text-[11px] font-bold text-slate-600 flex justify-between">
                  <span>Pratinjau Data Santri ({parseResult.rows.length} Baris)</span>
                  <span>Status Baris</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {parseResult.rows.map((row) => (
                    <div key={row.rowNumber} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#101A3A] truncate">
                            {row.data.fullName || '(Nama Kosong)'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            NIS: {row.data.nis}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#243B9B] font-semibold">
                            {row.data.className}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Ortu: {row.data.parentName || '-'} • Asrama: {row.data.boardingStatus === 'boarding' ? 'Ya' : 'Tidak'}
                        </p>
                        {row.errors.length > 0 && (
                          <p className="text-[10px] text-red-600 font-semibold mt-0.5">
                            {row.errors.join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {row.isValid ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Valid</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Periksa</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar (During import) */}
              {importing && (
                <div className="space-y-1.5 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="flex justify-between text-xs font-bold text-[#243B9B]">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 animate-pulse" />
                      Menyimpan ke Firebase Firestore...
                    </span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#243B9B] h-full rounded-full transition-all duration-200"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Batal
          </button>

          {parseResult && (
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={importing || parseResult.validCount === 0}
              className="px-5 py-2.5 bg-[#0E9F6E] hover:bg-[#0c825a] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              <span>
                {importing ? `Mengimpor (${importProgress}%)...` : `Simpan ${parseResult.validCount} Santri ke Firebase`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
