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
import { Staff, UserProfile } from '../../types';
import { createAuditLog } from './auditService';
import { handleFirestoreError, OperationType } from './firestoreError';

const COLLECTION_NAME = 'staff';

export const getStaffList = async (): Promise<Staff[]> => {
  try {
    const staffRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(staffRef);
    
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Staff, 'id'>)
    }));
    list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'id'));
    return list;
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    console.error('Error fetching staff list:', error);
    return [];
  }
};

export const getStaffById = async (staffId: string): Promise<Staff | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, staffId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Staff, 'id'>)
    };
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${staffId}`);
    }
    console.error('Error fetching staff by ID:', error);
    return null;
  }
};

export const createStaff = async (
  staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>,
  currentUser?: UserProfile | null
): Promise<Staff> => {
  const docRef = doc(db, COLLECTION_NAME, staffData.staffId);
  const payload = {
    ...staffData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  await setDoc(docRef, payload);
  await createAuditLog(
    'CREATE',
    'staff',
    staffData.staffId,
    `Menambahkan tenaga kependidikan: ${staffData.fullName} (${staffData.position})`,
    currentUser
  );

  return {
    id: staffData.staffId,
    ...staffData,
    createdAt: new Date()
  };
};

export const updateStaff = async (
  staffId: string,
  staffData: Partial<Staff>,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, staffId);
  await updateDoc(docRef, {
    ...staffData,
    updatedAt: serverTimestamp()
  });

  await createAuditLog(
    'UPDATE',
    'staff',
    staffId,
    `Memperbarui data tendik: ${staffData.fullName || staffId}`,
    currentUser
  );
};

export const deleteStaff = async (
  staffId: string,
  staffName: string,
  currentUser?: UserProfile | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, staffId);
  await deleteDoc(docRef);

  await createAuditLog(
    'DELETE',
    'staff',
    staffId,
    `Menghapus data tendik: ${staffName}`,
    currentUser
  );
};
