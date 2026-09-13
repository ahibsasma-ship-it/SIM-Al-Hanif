import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { Student, UserProfile } from '../../types';
import { createAuditLog } from './auditService';
import { handleFirestoreError, OperationType } from './firestoreError';

const COLLECTION_NAME = 'students';

/**
 * Normalizes document from Firestore ensuring both Indonesian field names 
 * (e.g. namaSiswa, namaKelas) and standard TypeScript fields are supported.
 */
export const mapFirestoreToStudent = (id: string, data: any): Student => {
  return {
    id,
    studentId: data.studentId || id,
    fullName: data.namaSiswa || data.namaLengkap || data.fullName || '',
    nis: data.nis || '',
    nisn: data.nisn || '',
    gender: (data.jenisKelamin === 'P' || data.gender === 'P') ? 'P' : 'L',
    birthPlace: data.tempatLahir || data.birthPlace || '',
    birthDate: data.tanggalLahir || data.birthDate || '',
    religion: data.agama || data.religion || 'Islam',
    address: data.alamat || data.address || '',
    phone: data.noHpSiswa || data.noHp || data.phone || '',
    parentName: data.namaOrangTua || data.namaWali || data.parentName || '',
    parentPhone: data.noHpOrangTua || data.noHpOrtu || data.parentPhone || '',
    classId: data.idKelas || data.classId || '',
    className: data.namaKelas || data.className || '',
    status: data.statusSantri || data.status || 'active',
    boardingStatus: (data.statusAsrama === 'non_boarding' || data.boardingStatus === 'non_boarding') ? 'non_boarding' : 'boarding',
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.waktuDibuat?.toDate ? data.waktuDibuat.toDate() : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.waktuDiperbarui?.toDate ? data.waktuDiperbarui.toDate() : new Date())
  };
};

/**
 * Helper to build payload with Indonesian field names for Firebase Console
 */
const buildStudentFirestorePayload = (studentData: Partial<Student>) => {
  const payload: Record<string, any> = {
    ...studentData,
    // Nama-nama kolom bahasa Indonesia di Firestore (Sesuai Permintaan User)
    namaSiswa: studentData.fullName,
    nis: studentData.nis,
    nisn: studentData.nisn || '',
    jenisKelamin: studentData.gender,
    tempatLahir: studentData.birthPlace || '',
    tanggalLahir: studentData.birthDate || '',
    agama: studentData.religion || 'Islam',
    alamat: studentData.address || '',
    noHpSiswa: studentData.phone || '',
    namaOrangTua: studentData.parentName || '',
    noHpOrangTua: studentData.parentPhone || '',
    namaKelas: studentData.className || '',
    idKelas: studentData.classId || '',
    statusSantri: studentData.status || 'active',
    statusAsrama: studentData.boardingStatus,
    waktuDiperbarui: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Clean undefined values
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};

export const getStudents = async (filters?: {
  classId?: string;
  status?: string;
  boardingStatus?: string;
}): Promise<Student[]> => {
  try {
    const studentsRef = collection(db, COLLECTION_NAME);
    let q = query(studentsRef, orderBy('fullName', 'asc'));

    if (filters?.classId && filters.classId !== 'all') {
      q = query(studentsRef, where('classId', '==', filters.classId), orderBy('fullName', 'asc'));
    }

    const snapshot = await getDocs(q);
    let students = snapshot.docs.map(d => mapFirestoreToStudent(d.id, d.data()));

    if (filters?.status && filters.status !== 'all') {
      students = students.filter(s => s.status === filters.status);
    }
    if (filters?.boardingStatus && filters.boardingStatus !== 'all') {
      students = students.filter(s => s.boardingStatus === filters.boardingStatus);
    }

    return students;
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    console.error('Error fetching students:', error);
    return [];
  }
};

export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  try {
    const studentsRef = collection(db, COLLECTION_NAME);
    const q = query(studentsRef, where('classId', '==', classId), orderBy('fullName', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(d => mapFirestoreToStudent(d.id, d.data()));
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    console.error('Error fetching students by class:', error);
    return [];
  }
};

export const getStudentById = async (studentId: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return mapFirestoreToStudent(snapshot.id, snapshot.data());
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${studentId}`);
    }
    console.error('Error fetching student by ID:', error);
    return null;
  }
};

export const createStudent = async (
  studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>,
  currentUser?: UserProfile | null
): Promise<Student> => {
  const docRef = doc(db, COLLECTION_NAME, studentData.studentId);
  const payload = {
    ...buildStudentFirestorePayload(studentData),
    waktuDibuat: serverTimestamp(),
    createdAt: serverTimestamp()
  };
  
  await setDoc(docRef, payload);
  await createAuditLog(
    'CREATE',
    'students',
    studentData.studentId,
    `Menambahkan data siswa: ${studentData.fullName} (${studentData.nis})`,
    currentUser
  );

  return {
    id: studentData.studentId,
    ...studentData,
    createdAt: new Date()
  };
};

export const updateStudent = async (
  studentId: string,
  studentData: Partial<Student>,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, studentId);
  const payload = buildStudentFirestorePayload(studentData);
  await updateDoc(docRef, payload);

  await createAuditLog(
    'UPDATE',
    'students',
    studentId,
    `Memperbarui data siswa: ${studentData.fullName || studentId}`,
    currentUser
  );
};

export const deleteStudent = async (
  studentId: string,
  studentName: string,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, studentId);
  await deleteDoc(docRef);

  await createAuditLog(
    'DELETE',
    'students',
    studentId,
    `Menghapus data siswa: ${studentName} (${studentId})`,
    currentUser
  );
};
