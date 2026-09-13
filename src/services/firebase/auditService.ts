import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { AuditLog, UserProfile } from '../../types';

export const createAuditLog = async (
  action: AuditLog['action'],
  module: AuditLog['module'],
  targetId: string,
  description: string,
  user?: UserProfile | null
): Promise<void> => {
  try {
    const logsRef = collection(db, 'audit_logs');
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    await addDoc(logsRef, {
      logId,
      userId: user?.uid || 'system',
      userName: user?.fullName || 'Sistem Otomatis',
      role: user?.role || 'admin',
      action,
      module,
      targetId,
      description,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

export const getRecentAuditLogs = async (limitCount = 10): Promise<AuditLog[]> => {
  try {
    const logsRef = collection(db, 'audit_logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<AuditLog, 'id'>)
    }));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

export const getAuditLogs = async (limitCount = 50): Promise<AuditLog[]> => {
  return getRecentAuditLogs(limitCount);
};
