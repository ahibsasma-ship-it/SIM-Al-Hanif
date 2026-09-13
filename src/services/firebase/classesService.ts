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
import { SchoolClass, UserProfile } from '../../types';
import { createAuditLog } from './auditService';
import { handleFirestoreError, OperationType } from './firestoreError';

const COLLECTION_NAME = 'classes';

export const mapFirestoreToClass = (id: string, data: any): SchoolClass => {
  return {
    id,
    classId: data.classId || id,
    className: data.namaKelas || data.className || '',
    grade: data.tingkat !== undefined ? Number(data.tingkat) : (data.grade || 7),
    academicYear: data.tahunAjaran || data.academicYear || '2026/2027',
    homeroomTeacherId: data.idWaliKelas || data.homeroomTeacherId || '',
    homeroomTeacherName: data.namaWaliKelas || data.waliKelas || data.homeroomTeacherName || '',
    studentCount: data.jumlahSiswa !== undefined ? Number(data.jumlahSiswa) : (data.studentCount || 0),
    status: data.statusKelas || data.status || 'active',
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.waktuDibuat?.toDate ? data.waktuDibuat.toDate() : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.waktuDiperbarui?.toDate ? data.waktuDiperbarui.toDate() : new Date())
  };
};

export const getClasses = async (): Promise<SchoolClass[]> => {
  try {
    const classesRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(classesRef);
    const list = snapshot.docs.map(doc => mapFirestoreToClass(doc.id, doc.data()));
    list.sort((a, b) => (a.className || '').localeCompare(b.className || '', 'id'));
    return list;
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const getClassById = async (classId: string): Promise<SchoolClass | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, classId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return mapFirestoreToClass(snapshot.id, snapshot.data());
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${classId}`);
    }
    console.error('Error fetching class by ID:', error);
    return null;
  }
};

export const createClass = async (
  classData: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt'>,
  currentUser?: UserProfile | null
): Promise<SchoolClass> => {
  const docRef = doc(db, COLLECTION_NAME, classData.classId);
  const payload = {
    ...classData,
    // Kolom Bahasa Indonesia di Firestore
    namaKelas: classData.className,
    tingkat: classData.grade,
    tahunAjaran: classData.academicYear,
    namaWaliKelas: classData.homeroomTeacherName || '',
    idWaliKelas: classData.homeroomTeacherId || '',
    jumlahSiswa: classData.studentCount || 0,
    statusKelas: classData.status,
    waktuDibuat: serverTimestamp(),
    waktuDiperbarui: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  await setDoc(docRef, payload);
  await createAuditLog(
    'CREATE', 
    'classes', 
    classData.classId, 
    `Menambahkan kelas baru: ${classData.className}`, 
    currentUser
  );

  return {
    id: classData.classId,
    ...classData,
    createdAt: new Date()
  };
};

export const updateClass = async (
  classId: string,
  classData: Partial<SchoolClass>,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, classId);
  const payload: Record<string, any> = {
    ...classData,
    waktuDiperbarui: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  if (classData.className) payload.namaKelas = classData.className;
  if (classData.grade) payload.tingkat = classData.grade;
  if (classData.academicYear) payload.tahunAjaran = classData.academicYear;
  if (classData.homeroomTeacherName !== undefined) payload.namaWaliKelas = classData.homeroomTeacherName;
  if (classData.homeroomTeacherId !== undefined) payload.idWaliKelas = classData.homeroomTeacherId;
  if (classData.studentCount !== undefined) payload.jumlahSiswa = classData.studentCount;
  if (classData.status) payload.statusKelas = classData.status;

  await updateDoc(docRef, payload);

  await createAuditLog(
    'UPDATE',
    'classes',
    classId,
    `Memperbarui data kelas: ${classData.className || classId}`,
    currentUser
  );
};

export const deleteClass = async (
  classId: string,
  className: string,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, classId);
  await deleteDoc(docRef);

  await createAuditLog(
    'DELETE',
    'classes',
    classId,
    `Menghapus kelas: ${className}`,
    currentUser
  );
};
