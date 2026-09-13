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

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const teachersRef = collection(db, COLLECTION_NAME);
    const q = query(teachersRef, orderBy('fullName', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Teacher, 'id'>)
    }));
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
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Teacher, 'id'>)
    };
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
  const payload = {
    ...teacherData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  await setDoc(docRef, payload);
  await createAuditLog(
    'CREATE',
    'teachers',
    teacherData.teacherId,
    `Menambahkan data guru: ${teacherData.fullName}`,
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
  await updateDoc(docRef, {
    ...teacherData,
    updatedAt: serverTimestamp()
  });

  await createAuditLog(
    'UPDATE',
    'teachers',
    teacherId,
    `Memperbarui data guru: ${teacherData.fullName || teacherId}`,
    currentUser
  );
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
