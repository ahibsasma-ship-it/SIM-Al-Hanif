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

export const getRecentAuditLogs = async (limitCount = 50): Promise<AuditLog[]> => {
  try {
    const logsRef = collection(db, 'audit_logs');
    const snapshot = await getDocs(logsRef);
    
    const logs = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : (d.createdAt || new Date())
      } as AuditLog;
    });

    logs.sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime() || 0;
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    return logs.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

export const getAuditLogs = async (limitCount = 50): Promise<AuditLog[]> => {
  return getRecentAuditLogs(limitCount);
};
