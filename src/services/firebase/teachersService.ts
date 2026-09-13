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
  orderBy 
} from 'firebase/firestore';
import { db } from './config';
import { Teacher, UserProfile } from '../../types';
import { createAuditLog } from './auditService';
import { handleFirestoreError, OperationType } from './firestoreError';

const COLLECTION_NAME = 'teachers';

export const mapFirestoreToTeacher = (id: string, data: any): Teacher => {
  let positions: string[] = [];
  if (Array.isArray(data.positions)) {
    positions = data.positions;
  } else if (Array.isArray(data.jabatan)) {
    positions = data.jabatan;
  } else if (typeof data.jabatan === 'string' && data.jabatan.trim()) {
    positions = data.jabatan.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (typeof data.position === 'string' && data.position.trim()) {
    positions = [data.position.trim()];
  }

  let subjects: string[] = [];
  if (Array.isArray(data.subjects)) {
    subjects = data.subjects;
  } else if (Array.isArray(data.mataPelajaran)) {
    subjects = data.mataPelajaran;
  } else if (typeof data.mataPelajaran === 'string' && data.mataPelajaran.trim()) {
    subjects = data.mataPelajaran.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const niy = data.niy || data.nip || data.nomorInduk || '';

  return {
    id,
    teacherId: data.teacherId || id,
    niy,
    nip: data.nip || niy,
    fullName: data.namaGuru || data.namaLengkap || data.fullName || '',
    gender: (data.jenisKelamin === 'P' || data.gender === 'P') ? 'P' : 'L',
    email: data.email || data.surel || '',
    phone: data.noHp || data.phone || data.telepon || '',
    address: data.alamat || data.address || '',
    positions,
    subjects,
    classIds: Array.isArray(data.classIds) ? data.classIds : [],
    status: data.statusGuru || data.status || 'active',
    photoUrl: data.photoUrl || '',
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.waktuDibuat?.toDate ? data.waktuDibuat.toDate() : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.waktuDiperbarui?.toDate ? data.waktuDiperbarui.toDate() : new Date())
  };
};

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const teachersRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(teachersRef);
    
    const list = snapshot.docs.map(doc => mapFirestoreToTeacher(doc.id, doc.data()));
    list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'id'));
    return list;
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    console.error('Error fetching teachers:', error);
    return [];
  }
};

export const getTeacherById = async (teacherId: string): Promise<Teacher | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, teacherId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return mapFirestoreToTeacher(snapshot.id, snapshot.data());
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${teacherId}`);
    }
    console.error('Error fetching teacher by ID:', error);
    return null;
  }
};

export const createTeacher = async (
  teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>,
  currentUser?: UserProfile | null
): Promise<Teacher> => {
  const docRef = doc(db, COLLECTION_NAME, teacherData.teacherId);
  const payload: Record<string, any> = {
    ...teacherData,
    niy: teacherData.niy,
    nip: teacherData.nip || teacherData.niy,
    positions: teacherData.positions || [],
    jabatan: teacherData.positions || [],
    namaGuru: teacherData.fullName,
    jenisKelamin: teacherData.gender,
    surel: teacherData.email || '',
    noHp: teacherData.phone || '',
    alamat: teacherData.address || '',
    statusGuru: teacherData.status || 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    waktuDibuat: serverTimestamp(),
    waktuDiperbarui: serverTimestamp()
  };
  
  await setDoc(docRef, payload);
  await createAuditLog(
    'CREATE',
    'teachers',
    teacherData.teacherId,
    `Menambahkan data guru: ${teacherData.fullName} (NIY: ${teacherData.niy})`,
    currentUser
  );

  return {
    id: teacherData.teacherId,
    ...teacherData,
    createdAt: new Date()
  };
};

export const updateTeacher = async (
  teacherId: string,
  teacherData: Partial<Teacher>,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, teacherId);
  const payload: Record<string, any> = {
    ...teacherData,
    updatedAt: serverTimestamp(),
    waktuDiperbarui: serverTimestamp()
  };

  if (teacherData.niy) {
    payload.niy = teacherData.niy;
    payload.nip = teacherData.nip || teacherData.niy;
  }
  if (teacherData.fullName) payload.namaGuru = teacherData.fullName;
  if (teacherData.positions) {
    payload.positions = teacherData.positions;
    payload.jabatan = teacherData.positions;
  }
  if (teacherData.phone !== undefined) payload.noHp = teacherData.phone;
  if (teacherData.address !== undefined) payload.alamat = teacherData.address;

  await updateDoc(docRef, payload);

  await createAuditLog(
    'UPDATE',
    'teachers',
    teacherId,
    `Memperbarui data guru: ${teacherData.fullName || teacherId}`,
    currentUser
  );
};

export const batchCreateTeachers = async (
  teachersList: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[],
  currentUser?: UserProfile | null
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const t of teachersList) {
    try {
      await createTeacher(t, currentUser);
      success++;
    } catch (err) {
      console.error(`Gagal import guru ${t.fullName}:`, err);
      failed++;
    }
  }

  return { success, failed };
};

export const deleteTeacher = async (
  teacherId: string,
  teacherName: string,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, teacherId);
  await deleteDoc(docRef);

  await createAuditLog(
    'DELETE',
    'teachers',
    teacherId,
    `Menghapus data guru: ${teacherName}`,
    currentUser
  );
};
