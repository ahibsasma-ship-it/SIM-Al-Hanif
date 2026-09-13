import React, { useState } from 'react';
import { Database, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { firebaseInfo } from '../services/firebase/config';

export const FirebaseStatusBadge: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block text-xs">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs font-medium cursor-pointer"
        title="Status Koneksi Firebase Firestore"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Database className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Firestore Terhubung</span>
        <span className="sm:hidden">Online</span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white rounded-xl shadow-xl border border-gray-100 z-50 text-left">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <ShieldCheck className="w-4 h-4 text-[#243B9B]" />
            <p className="font-semibold text-gray-900 text-xs">Firebase & Firestore Status</p>
          </div>
          <div className="mt-2 space-y-1.5 text-[11px] text-gray-600">
            <div className="flex justify-between">
              <span>Project ID:</span>
              <span className="font-mono text-gray-900 font-medium truncate max-w-[150px]">{firebaseInfo.projectId}</span>
            </div>
            <div className="flex justify-between">
              <span>Database ID:</span>
              <span className="font-mono text-gray-900 font-medium truncate max-w-[150px]">{firebaseInfo.databaseId}</span>
            </div>
            <div className="flex justify-between">
              <span>Auth Domain:</span>
              <span className="text-gray-900 truncate max-w-[150px]">{firebaseInfo.authDomain}</span>
            </div>
            <div className="flex items-center gap-1 pt-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Security Rules Aktif & Terlindungi</span>
            </div>
            <div className="p-1.5 bg-blue-50 text-[#243B9B] rounded-lg text-[10px] mt-1 font-semibold">
              ✓ Kolom Bahasa Indonesia aktif di Firestore: <code>namaSiswa</code>, <code>namaKelas</code>, <code>tanggalPresensi</code>, dll.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
