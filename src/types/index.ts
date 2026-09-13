export type UserRole = 'admin' | 'guru' | 'tendik' | 'siswa';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  username?: string;
  photoUrl?: string;
  phone?: string;
  address?: string;
  status: UserStatus;
  studentId?: string;
  teacherId?: string;
  staffId?: string;
  classId?: string;
  niy?: string;
  nis?: string;
  positions?: string[];
  dormitoryName?: string;
  halaqoh?: string;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type BoardingStatus = 'boarding' | 'non_boarding';

export interface Student {
  id?: string;
  studentId: string; // STU-2026-0001
  nis: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion: string;
  address: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  classId: string; // CLS-8A-2026
  className: string; // VIII A
  status: StudentStatus;
  photoUrl?: string;
  boardingStatus: BoardingStatus;
  dormitoryName?: string; // Asrama / Gedung Kamar (misal: Asrama Abu Bakar Shiddiq)
  halaqoh?: string; // Kelompok Halaqoh (misal: Halaqoh Ustadz Ahmad Fauzi, Lc.)
  createdAt?: any;
  updatedAt?: any;
}

export const TEACHER_POSITIONS = [
  'Mudir',
  'Kepala Sekolah',
  'Kabid Kesantrian',
  'Kabid TU',
  'Kabid Kepala Rumah Tangga',
  'Waka Kurikulum',
  'Wali Kelas',
  'Guru Mapel',
  'Musyrif Asrama',
  'Musyrif Halaqoh'
] as const;

export type TeacherPosition = (typeof TEACHER_POSITIONS)[number] | string;

export interface Teacher {
  id?: string;
  teacherId: string; // TCH-2026-0001
  niy: string; // Nomor Induk Yayasan (NIY)
  nip?: string; // Alias kompatibilitas NIP lama
  fullName: string;
  gender: 'L' | 'P';
  email?: string; // Email tidak wajib / opsional
  phone: string;
  address: string;
  positions: string[]; // Satu orang bisa mengemban lebih dari satu jabatan
  subjects: string[];
  classIds: string[];
  status: 'active' | 'inactive';
  photoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Staff {
  id?: string;
  staffId: string; // STF-2026-0001
  nip: string;
  fullName: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  photoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SchoolClass {
  id?: string;
  classId: string; // CLS-8A-2026
  className: string; // VIII A
  grade: number; // 7, 8, 9
  academicYear: string; // 2026/2027
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount: number;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

export interface Subject {
  id?: string;
  subjectId: string; // SUB-PAI-001
  subjectCode: string; // PAI
  subjectName: string; // Pendidikan Agama Islam
  teacherIds: string[];
  classIds: string[];
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA';

export interface AttendanceRecord {
  id?: string;
  attendanceId: string; // ATT-YYYYMMDD-studentId
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  note?: string | null;
  recordedBy: string; // UID
  recordedByName: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  nis: string;
  classId: string;
  className: string;
  totalPresent: number;
  totalLate: number;
  totalPermission: number;
  totalSick: number;
  totalAbsent: number;
  totalMeetings: number;
  attendanceRate: number; // percentage (0-100)
}

export interface AuditLog {
  id?: string;
  logId: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ATTENDANCE_SUBMIT';
  module: 'auth' | 'users' | 'students' | 'teachers' | 'staff' | 'classes' | 'attendance' | 'settings';
  targetId: string;
  description: string;
  createdAt?: any;
}

export interface NotificationItem {
  id?: string;
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt?: any;
}

export interface AttendanceRulesSettings {
  allowLate: boolean;
  lateThreshold: string; // e.g. "07:30"
  allowEdit: boolean;
  maxEditDays: number;
  defaultStatus: AttendanceStatus;
  requiredNoteForPermission: boolean;
}
