import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import appletConfig from '../../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: appletConfig?.apiKey || (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
  authDomain: appletConfig?.authDomain || (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: appletConfig?.projectId || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: appletConfig?.storageBucket || (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: appletConfig?.messagingSenderId || (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: appletConfig?.appId || (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// If firestoreDatabaseId is present and not default, pass it as second parameter
const databaseId = appletConfig?.firestoreDatabaseId && appletConfig.firestoreDatabaseId !== '(default)'
  ? appletConfig.firestoreDatabaseId
  : undefined;

export const db: Firestore = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth: Auth = getAuth(app);

export const firebaseInfo = {
  projectId: firebaseConfig.projectId,
  databaseId: databaseId || '(default)',
  authDomain: firebaseConfig.authDomain,
  isConfigured: Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
};
