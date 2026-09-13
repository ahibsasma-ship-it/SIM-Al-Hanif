import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UserRole } from '../../types';
import { createAuditLog } from './auditService';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const syncUserProfile = async (user: FirebaseUser, defaultRole?: UserRole): Promise<UserProfile> => {
  const docRef = doc(db, 'users', user.uid);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    // ensure bootstrapped admin email always has admin role
    if (user.email === 'ahibsasma@gmail.com' && data.role !== 'admin') {
      data.role = 'admin';
      await setDoc(docRef, { role: 'admin', lastLoginAt: serverTimestamp() }, { merge: true });
    } else {
      await setDoc(docRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    }
    return data;
  }

  // Create new profile for first-time login
  let role: UserRole = defaultRole || 'siswa';
  let fullName = user.displayName || user.email?.split('@')[0] || 'Pengguna Al-Hanif';
  
  if (user.email === 'ahibsasma@gmail.com' || user.email?.includes('admin')) {
    role = 'admin';
    fullName = user.displayName || 'Administrator Utama Al-Hanif';
  } else if (user.email?.includes('guru')) {
    role = 'guru';
    fullName = user.displayName || 'Ustadz Pengajar';
  } else if (user.email?.includes('tendik')) {
    role = 'tendik';
    fullName = user.displayName || 'Staff Tata Usaha';
  }

  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    fullName,
    role,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  };

  await setDoc(docRef, newProfile);
  await createAuditLog('LOGIN', 'auth', user.uid, `Pengguna baru mendaftar & login: ${newProfile.email}`, newProfile);
  return newProfile;
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const profile = await syncUserProfile(cred.user, cred.user.email === 'ahibsasma@gmail.com' ? 'admin' : undefined);
  await createAuditLog('LOGIN', 'auth', cred.user.uid, `Login Google berhasil: ${profile.fullName} (${profile.role})`, profile);
  return profile;
};

export const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const profile = await syncUserProfile(cred.user);
  await createAuditLog('LOGIN', 'auth', cred.user.uid, `Login berhasil: ${profile.fullName} (${profile.role})`, profile);
  return profile;
};

export const registerUser = async (email: string, pass: string, fullName: string, role: UserRole): Promise<UserProfile> => {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const docRef = doc(db, 'users', cred.user.uid);
  const profile: UserProfile = {
    uid: cred.user.uid,
    email,
    fullName,
    role,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  };
  await setDoc(docRef, profile);
  await createAuditLog('CREATE', 'users', cred.user.uid, `Akun dibuat oleh Admin/User: ${email} sebagai ${role}`, profile);
  return profile;
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async (currentUser?: UserProfile | null): Promise<void> => {
  if (currentUser) {
    await createAuditLog('UPDATE', 'auth', currentUser.uid, `Pengguna keluar (Logout): ${currentUser.fullName}`, currentUser);
  }
  await fbSignOut(auth);
};

// Demo quick-login handler for testing all 4 roles seamlessly
export const switchDemoRole = async (role: UserRole): Promise<UserProfile> => {
  // Let's obtain a real Firebase Auth session (anonymous or matching email)
  let user = auth.currentUser;
  if (!user) {
    try {
      const anon = await signInAnonymously(auth);
      user = anon.user;
    } catch (e) {
      console.warn('Anonymous auth not enabled or failed, continuing with local Firestore profile link', e);
    }
  }

  const demoUID = user ? user.uid : `demo-${role}-uid`;
  const docRef = doc(db, 'users', demoUID);
  
  let fullName = '';
  let email = '';
  let studentId: string | undefined;
  let teacherId: string | undefined;
  let staffId: string | undefined;
  let classId: string | undefined;

  switch (role) {
    case 'admin':
      fullName = 'Ust. H. Rahmat Hidayat, M.Pd.';
      email = 'admin@alhanif.sch.id';
      break;
    case 'guru':
      fullName = 'Ustadz Ahmad Fauzi, Lc.';
      email = 'guru@alhanif.sch.id';
      teacherId = 'TCH-2026-0001';
      classId = 'CLS-8A-2026';
      break;
    case 'tendik':
      fullName = 'Bambang Sutrisno, S.Kom.';
      email = 'tendik@alhanif.sch.id';
      staffId = 'STF-2026-0002';
      break;
    case 'siswa':
      fullName = 'Ahmad Fauzan Al-Baqir';
      email = 'siswa@alhanif.sch.id';
      studentId = 'STU-2026-0001';
      classId = 'CLS-8A-2026';
      break;
  }

  const profile: UserProfile = {
    uid: demoUID,
    email,
    fullName,
    role,
    status: 'active',
    studentId,
    teacherId,
    staffId,
    classId,
    lastLoginAt: serverTimestamp()
  };

  try {
    await setDoc(docRef, profile, { merge: true });
    await createAuditLog('LOGIN', 'auth', demoUID, `Beralih ke akun demo: ${fullName} (${role})`, profile);
  } catch (err) {
    console.warn('Set doc error for demo switch:', err);
  }

  return profile;
};
