import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, FileCode, CheckCircle2, History } from 'lucide-react';
import { getAuditLogs } from '../../services/firebase/auditService';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getAuditLogs(100);
        setLogs(data);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter as any);
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('ATTENDANCE')) {
      return 'bg-blue-50 text-[#243B9B] border-blue-100';
    }
    if (action.includes('CREATE')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (action.includes('UPDATE')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (action.includes('DELETE')) {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#243B9B]">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#101A3A] tracking-tight">
                Log Audit & Keamanan Sistem
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Catatan rekam jejak aktivitas pengguna untuk transparansi dan kepatuhan sistem
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Aktivitas: {filteredLogs.length}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pelaku, aksi, atau target..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#243B9B]"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#243B9B]"
            >
              <option value="all">Semua Tipe Aksi</option>
              <option value="ATTENDANCE">Aktivitas Presensi (Bulk / Single)</option>
              <option value="STUDENT">Perubahan Data Santri</option>
              <option value="CLASS">Perubahan Data Kelas</option>
              <option value="TEACHER">Perubahan Data Guru</option>
              <option value="SEED">Inisialisasi Data (Seed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-[#243B9B] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-slate-600">Mengambil catatan log audit...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum ada aktivitas yang dicatat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Waktu</th>
                  <th className="py-3.5 px-6">Pengguna</th>
                  <th className="py-3.5 px-6">Aksi Dilakukan</th>
                  <th className="py-3.5 px-6">Entitas Target</th>
                  <th className="py-3.5 px-6">Detail Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map(log => {
                  const dateStr = log.createdAt?.seconds 
                    ? new Date(log.createdAt.seconds * 1000).toLocaleString('id-ID')
                    : 'Baru saja';

                  return (
                    <tr key={log.logId || log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-[#101A3A]">
                        {log.userName || 'Sistem'}
                        <span className="block text-[10px] text-slate-400 font-normal uppercase">
                          Role: {log.role || 'admin'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {log.targetId || '-'}
                      </td>
                      <td className="py-3.5 px-6 text-[11px] text-slate-600 max-w-xs truncate">
                        {log.description || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
