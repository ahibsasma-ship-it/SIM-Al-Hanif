import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { AttendanceRecord, AttendanceStatus, AttendanceSummary, UserProfile } from '../../types';
import { createAuditLog } from './auditService';
import { handleFirestoreError, OperationType } from './firestoreError';

const COLLECTION_NAME = 'attendance';

export const mapFirestoreToAttendance = (id: string, data: any): AttendanceRecord => ({
  id,
  attendanceId: data.attendanceId || id,
  studentId: data.studentId || '',
  studentName: data.namaSiswa || data.studentName || '',
  classId: data.idKelas || data.classId || '',
  className: data.namaKelas || data.className || '',
  date: data.tanggalPresensi || data.date || '',
  status: data.statusKehadiran || data.status || 'HADIR',
  checkInTime: data.waktuPresensi || data.checkInTime,
  note: data.catatan || data.note || null,
  recordedBy: data.recordedBy || '',
  recordedByName: data.namaPencatat || data.recordedByName || '',
  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.waktuDibuat?.toDate ? data.waktuDibuat.toDate() : new Date()),
  updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.waktuDiperbarui?.toDate ? data.waktuDiperbarui.toDate() : new Date())
});

export const generateAttendanceId = (date: string, studentId: string): string => {
  // date in YYYY-MM-DD format -> sanitize to YYYYMMDD
  const sanitizedDate = date.replace(/-/g, '');
  return `ATT-${sanitizedDate}-${studentId}`;
};

export const getAttendanceByClassAndDate = async (
  classId: string, 
  date: string
): Promise<AttendanceRecord[]> => {
  try {
    const attendanceRef = collection(db, COLLECTION_NAME);
    const q = query(
      attendanceRef, 
      where('classId', '==', classId),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => mapFirestoreToAttendance(doc.id, doc.data()));
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    console.error('Error fetching attendance by class and date:', error);
    return [];
  }
};

export const recordBulkAttendance = async (
  records: Array<{
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    note?: string | null;
  }>,
  currentUser: UserProfile
): Promise<{ success: boolean; count: number; message: string }> => {
  if (!records.length) {
    return { success: false, count: 0, message: 'Tidak ada data siswa untuk disimpan' };
  }

  try {
    const batch = writeBatch(db);
    const now = new Date();
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    records.forEach(item => {
      const attId = generateAttendanceId(item.date, item.studentId);
      const docRef = doc(db, COLLECTION_NAME, attId);
      const checkInTime = item.checkInTime || (item.status === 'HADIR' || item.status === 'TERLAMBAT' ? defaultTime : undefined);
      
      const payload: Record<string, any> = {
        attendanceId: attId,
        studentId: item.studentId,
        studentName: item.studentName,
        classId: item.classId,
        className: item.className,
        date: item.date,
        status: item.status,
        checkInTime: checkInTime || null,
        note: item.note || null,
        recordedBy: currentUser.uid,
        recordedByName: currentUser.fullName,
        // Kolom Bahasa Indonesia di Firestore
        namaSiswa: item.studentName,
        namaKelas: item.className,
        idKelas: item.classId,
        tanggalPresensi: item.date,
        statusKehadiran: item.status,
        waktuPresensi: checkInTime || null,
        catatan: item.note || null,
        namaPencatat: currentUser.fullName,
        waktuDibuat: serverTimestamp(),
        waktuDiperbarui: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(docRef, payload, { merge: true });
    });

    await batch.commit();

    // Summary counts for audit log
    const counts = records.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryStr = `Hadir: ${counts.HADIR || 0}, Terlambat: ${counts.TERLAMBAT || 0}, Izin: ${counts.IZIN || 0}, Sakit: ${counts.SAKIT || 0}, Alpa: ${counts.ALPA || 0}`;

    await createAuditLog(
      'ATTENDANCE_SUBMIT',
      'attendance',
      records[0].classId,
      `Menyimpan absensi kelas ${records[0].className} tanggal ${records[0].date}. (${summaryStr})`,
      currentUser
    );

    return { 
      success: true, 
      count: records.length, 
      message: `Berhasil menyimpan absensi ${records.length} siswa.` 
    };
  } catch (error: any) {
    console.error('Error saving bulk attendance:', error);
    return { 
      success: false, 
      count: 0, 
      message: 'Absensi gagal disimpan. Silakan periksa koneksi dan coba lagi.' 
    };
  }
};

export const updateSingleAttendance = async (
  attendanceId: string,
  updates: {
    status: AttendanceStatus;
    note?: string | null;
    checkInTime?: string;
  },
  currentUser: UserProfile
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, attendanceId);
  await updateDoc(docRef, {
    status: updates.status,
    note: updates.note || null,
    ...(updates.checkInTime ? { checkInTime: updates.checkInTime } : {}),
    updatedAt: serverTimestamp()
  });

  await createAuditLog(
    'UPDATE',
    'attendance',
    attendanceId,
    `Mengubah status absensi menjadi ${updates.status}`,
    currentUser
  );
};

export const getAttendanceHistory = async (filters?: {
  classId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<AttendanceRecord[]> => {
  try {
    const attendanceRef = collection(db, COLLECTION_NAME);
    let q = query(attendanceRef, orderBy('date', 'desc'));

    if (filters?.classId && filters.classId !== 'all') {
      q = query(attendanceRef, where('classId', '==', filters.classId), orderBy('date', 'desc'));
    }

    const snapshot = await getDocs(q);
    let list = snapshot.docs.map(doc => mapFirestoreToAttendance(doc.id, doc.data()));

    if (filters?.studentId && filters.studentId !== 'all') {
      list = list.filter(item => item.studentId === filters.studentId);
    }
    if (filters?.startDate) {
      list = list.filter(item => item.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter(item => item.date <= filters.endDate!);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(item => item.status === filters.status);
    }

    return list;
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    console.error('Error fetching attendance history:', error);
    return [];
  }
};

export const calculateAttendanceSummaries = (
  records: AttendanceRecord[],
  studentList: Array<{ studentId: string; fullName: string; nis: string; classId: string; className: string }>
): AttendanceSummary[] => {
  const map: Record<string, {
    studentName: string;
    nis: string;
    classId: string;
    className: string;
    present: number;
    late: number;
    permission: number;
    sick: number;
    absent: number;
  }> = {};

  // Initialize with all students in the list
  studentList.forEach(s => {
    map[s.studentId] = {
      studentName: s.fullName,
      nis: s.nis,
      classId: s.classId,
      className: s.className,
      present: 0,
      late: 0,
      permission: 0,
      sick: 0,
      absent: 0
    };
  });

  // Tally records
  records.forEach(r => {
    if (!map[r.studentId]) {
      map[r.studentId] = {
        studentName: r.studentName,
        nis: '',
        classId: r.classId,
        className: r.className,
        present: 0,
        late: 0,
        permission: 0,
        sick: 0,
        absent: 0
      };
    }

    if (r.status === 'HADIR') map[r.studentId].present += 1;
    else if (r.status === 'TERLAMBAT') map[r.studentId].late += 1;
    else if (r.status === 'IZIN') map[r.studentId].permission += 1;
    else if (r.status === 'SAKIT') map[r.studentId].sick += 1;
    else if (r.status === 'ALPA') map[r.studentId].absent += 1;
  });

  return Object.keys(map).map(studentId => {
    const item = map[studentId];
    const totalMeetings = item.present + item.late + item.permission + item.sick + item.absent;
    // Formula: ((HADIR + TERLAMBAT) / Total Pertemuan) * 100 with zero division guard
    const attendanceRate = totalMeetings > 0
      ? Math.round(((item.present + item.late) / totalMeetings) * 100)
      : 0;

    return {
      studentId,
      studentName: item.studentName,
      nis: item.nis,
      classId: item.classId,
      className: item.className,
      totalPresent: item.present,
      totalLate: item.late,
      totalPermission: item.permission,
      totalSick: item.sick,
      totalAbsent: item.absent,
      totalMeetings,
      attendanceRate
    };
  });
};

export const exportAttendanceToCSV = (
  summaries: AttendanceSummary[],
  className: string,
  period: string
): void => {
  const headers = ['No', 'ID Siswa', 'NIS', 'Nama Siswa', 'Kelas', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpa', 'Total Hari', 'Persentase Kehadiran (%)'];
  
  const rows = summaries.map((s, idx) => [
    idx + 1,
    s.studentId,
    s.nis,
    `"${s.studentName.replace(/"/g, '""')}"`,
    s.className,
    s.totalPresent,
    s.totalLate,
    s.totalPermission,
    s.totalSick,
    s.totalAbsent,
    s.totalMeetings,
    `${s.attendanceRate}%`
  ]);

  const csvContent = [
    `SIM AL-HANIF - SMP IT Putra Al-Hanif`,
    `Laporan Rekapitulasi Absensi Siswa`,
    `Kelas: ${className}, Periode: ${period}`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const sanitizedClass = className.replace(/\s+/g, '-');
  const sanitizedPeriod = period.replace(/\s+/g, '-');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Absensi_${sanitizedClass}_${sanitizedPeriod}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
