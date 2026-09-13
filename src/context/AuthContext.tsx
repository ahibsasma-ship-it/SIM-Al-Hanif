import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase/config';
import { getUserProfile, logoutUser, syncUserProfile, switchDemoRole, loginWithGoogle } from '../services/firebase/authService';
import { isDatabaseInitialized, seedInitialSchoolData } from '../services/firebase/seedService';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: UserRole | null;
  loginAsDemo: (role: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<UserProfile>;
  setCurrentUserProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  role: null,
  loginAsDemo: async () => {},
  signInWithGoogle: async () => ({} as UserProfile),
  setCurrentUserProfile: () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sim_alhanif_active_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-seed database if empty on first load
  useEffect(() => {
    const checkAndInit = async () => {
      try {
        const initialized = await isDatabaseInitialized();
        if (!initialized) {
          console.log('Database empty. Auto-seeding initial school data...');
          await seedInitialSchoolData();
        }
      } catch (e) {
        console.warn('Auto-init check failed:', e);
      }
    };
    checkAndInit();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('sim_alhanif_active_profile', JSON.stringify(profile));
          } else {
            const synced = await syncUserProfile(fbUser);
            setCurrentUser(synced);
            localStorage.setItem('sim_alhanif_active_profile', JSON.stringify(synced));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // If not in Firebase Auth, check if we have a demo profile stored
        const stored = localStorage.getItem('sim_alhanif_active_profile');
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch {
            setCurrentUser(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsDemo = async (targetRole: UserRole) => {
    setLoading(true);
    try {
      const profile = await switchDemoRole(targetRole);
      setCurrentUser(profile);
      localStorage.setItem('sim_alhanif_active_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to login as demo:', e);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await loginWithGoogle();
      setCurrentUser(profile);
      localStorage.setItem('sim_alhanif_active_profile', JSON.stringify(profile));
      return profile;
    } catch (e) {
      console.error('Failed to sign in with Google:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const setCurrentUserProfile = (profile: UserProfile | null) => {
    setCurrentUser(profile);
    if (profile) {
      localStorage.setItem('sim_alhanif_active_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('sim_alhanif_active_profile');
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser(currentUser);
      setCurrentUser(null);
      localStorage.removeItem('sim_alhanif_active_profile');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (currentUser?.uid) {
      const p = await getUserProfile(currentUser.uid);
      if (p) {
        setCurrentUser(p);
        localStorage.setItem('sim_alhanif_active_profile', JSON.stringify(p));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        role: currentUser?.role || null,
        loginAsDemo,
        signInWithGoogle,
        setCurrentUserProfile,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
