import React, { useState } from 'react';
import { Settings, Database, RefreshCw, Server, Shield, CheckCircle2, AlertTriangle, School } from 'lucide-react';
import { seedInitialData } from '../../services/firebase/seedService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleReSeed = async () => {
    setSeeding(true);
    setShowSeedModal(false);
    try {
      const res = await seedInitialData();
      if (res.success) {
        setSeedResult(res.message);
      } else {
        setSeedResult('Gagal inisialisasi: ' + res.message);
      }
    } catch (err: any) {
      setSeedResult('Terjadi kesalahan: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
            <Settings className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
              Pengaturan Sistem SIM AL-HANIF
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Konfigurasi sekolah, status basis data cloud Firestore, dan utilitas sistem
            </p>
          </div>
        </div>
      </div>

      {seedResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Inisialisasi Berhasil</p>
            <p className="mt-0.5">{seedResult}</p>
          </div>
        </div>
      )}

      {/* Grid Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <School className="w-5 h-5 text-[#243B9B]" />
            <h3 className="text-sm font-bold text-[#101A3A]">Profil Sekolah</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Nama Sekolah</span>
              <span className="font-bold text-slate-800">SMP IT Putra Al-Hanif</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">NPSN</span>
              <span className="font-mono font-bold text-slate-800">69987214</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Tahun Ajaran Aktif</span>
              <span className="font-bold text-[#243B9B]">2026/2027 (Semester Ganjil)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Alamat Kampus</span>
              <span className="font-medium text-slate-700 text-right max-w-xs">
                Jl. Al-Hanif No. 1, Cibeber, Cilegon, Banten
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Kepala Sekolah</span>
              <span className="font-bold text-slate-800">Ustadz Muhammad Yusuf, S.Pd.I</span>
            </div>
          </div>
        </div>

        {/* Database & Firebase Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-5 h-5 text-[#243B9B]" />
            <h3 className="text-sm font-bold text-[#101A3A]">Status Basis Data Cloud</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Layanan Database</span>
              <span className="font-bold text-slate-800">Google Cloud Firestore</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Konektivitas</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Terhubung (Aktif)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Aturan Keamanan (Rules)</span>
              <span className="font-mono text-emerald-700 font-semibold">Tersinkronisasi RBAC</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Pencegahan Duplikasi</span>
              <span className="font-bold text-[#243B9B]">ID Deterministik Aktif</span>
            </div>
          </div>
        </div>

        {/* Admin Maintenance / Re-Seed Card */}
        {currentUser?.role === 'admin' && (
          <div className="col-span-full bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#101A3A] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#F28C18]" />
                  Inisialisasi & Reset Data Contoh (Seed Data)
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Memperbarui dan menyinkronkan data master rombel (Kelas 7, 8, 9), data santri Al-Hanif, dan daftar asatidz ke Google Firestore secara bersih.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSeedModal(true)}
                disabled={seeding}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                <span>{seeding ? 'Menyinkronkan...' : 'Reset & Re-Seed Data'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showSeedModal}
        title="Konfirmasi Inisialisasi Ulang Data"
        message="Tindakan ini akan memeriksa dan memuat ulang data santri, rombel kelas, dan asatidz bawaan sistem ke Google Firestore. Apakah Anda ingin melanjutkan?"
        confirmText="Ya, Mulai Inisialisasi"
        isLoading={seeding}
        onConfirm={handleReSeed}
        onCancel={() => setShowSeedModal(false)}
      />
    </div>
  );
};
