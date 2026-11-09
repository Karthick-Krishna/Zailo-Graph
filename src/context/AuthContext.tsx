import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserTier, Entitlements, AuthModalState, AuthModalReason, PRO_GATED_UTILITIES } from '../types/auth';
import { UTILITIES } from '../types/utility';
import { auth, googleProvider } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup, 
  signOut,
  updateProfile,
  deleteUser,
  User as FirebaseUser 
} from 'firebase/auth';

const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB safe browser RAM limit
const DEFAULT_MAX_BATCH = 50; // 50 concurrent queue items

const ANONYMOUS_ENTITLEMENTS: Entitlements = {
  maxFileSize: DEFAULT_MAX_FILE_SIZE,
  maxBatchQueue: DEFAULT_MAX_BATCH,
  maxExportResolution: null, // Uncapped preview & test for all tools
  gatedUtilities: PRO_GATED_UTILITIES,
  hasCloudAccess: false,
  hasPersistentSessions: true,
};

const REGISTERED_ENTITLEMENTS: Entitlements = {
  maxFileSize: DEFAULT_MAX_FILE_SIZE,
  maxBatchQueue: DEFAULT_MAX_BATCH,
  maxExportResolution: null, // Uncapped
  gatedUtilities: [],
  hasCloudAccess: true,
  hasPersistentSessions: true,
};

interface AuthContextType {
  user: User | null;
  tier: UserTier;
  entitlements: Entitlements;
  isAuthenticated: boolean;
  authModal: AuthModalState;
  isLoading: boolean;
  authError: string | null;
  isSettingsOpen: boolean;
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => void;
  signUpWithEmail: (email: string) => void;
  directSignIn: (email?: string, name?: string) => void;
  logout: () => Promise<void>;
  openAuthModal: (reason: AuthModalReason, targetUtilityId?: string, customMessage?: string) => void;
  closeAuthModal: () => void;
  clearAuthError: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  updateUserName: (newName: string) => Promise<boolean>;
  deleteAccount: (confirmationName: string) => Promise<{ success: boolean; error?: string }>;
  
  // Quota Evaluators
  validateFileSize: (sizeInBytes: number) => { allowed: boolean; maxAllowed: number; message?: string };
  validateBatchCount: (currentCount: number, addingCount: number) => { allowed: boolean; maxAllowed: number; allowedCount: number; message?: string };
  isUtilityUnlocked: (utilityId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'zailo_graph_user_session';

const mapFirebaseUser = (fbUser: FirebaseUser): User => {
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'ZailoGraph Creator',
    avatarUrl: fbUser.photoURL || undefined,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    tier: 'free_registered',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    reason: 'manual',
  });

  const tier: UserTier = user ? 'free_registered' : 'guest';
  const entitlements = user ? REGISTERED_ENTITLEMENTS : ANONYMOUS_ENTITLEMENTS;

  // Synchronize Firebase Auth state changes and handle redirect credentials
  useEffect(() => {
    // Process redirect result if returning from OAuth redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const mapped = mapFirebaseUser(result.user);
          setUser(mapped);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
          } catch {}
          closeAuthModal();
          // Clean up redirect query or hash params from URL without reloading
          try {
            if (window.location.search || window.location.hash) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch {}
        }
      })
      .catch((err: any) => {
        console.warn('Redirect auth result warning:', err);
        if (err.code === 'auth/unauthorized-domain') {
          setAuthError('Domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains). Use instant access below.');
        } else if (err.message) {
          setAuthError(err.message);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUser(fbUser);
        setUser(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
        } catch {}
        closeAuthModal();
      } else {
        // If Firebase Auth does not report an active session, preserve and restore local storage session
        try {
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.email || parsed.id)) {
              setUser(parsed);
              return;
            }
          }
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (reason: AuthModalReason, targetUtilityId?: string, customMessage?: string) => {
    setAuthError(null);
    setAuthModal({
      isOpen: true,
      reason,
      targetUtilityId,
      customMessage,
    });
  };

  const closeAuthModal = () => {
    setAuthError(null);
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Direct popup sign-in works best in modern browsers without losing state
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const mapped = mapFirebaseUser(result.user);
        setUser(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
        } catch {}
        closeAuthModal();
      }
    } catch (popupErr: any) {
      console.warn('Google Sign-In Popup error:', popupErr);
      if (popupErr.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          console.error('Redirect fallback failed:', redirectErr);
        }
      }
      
      if (popupErr.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in window was closed before finishing.');
      } else if (popupErr.code === 'auth/cancelled-popup-request') {
        setAuthError('Another sign-in request was opened. Please check other browser tabs.');
      } else if (popupErr.code === 'auth/unauthorized-domain') {
        setAuthError('Domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains). You can also use Instant Google Access below.');
      } else if (popupErr.code === 'auth/operation-not-allowed') {
        setAuthError('Google sign-in is not enabled in Firebase Console. You can use Instant Google Access below.');
      } else {
        setAuthError(popupErr.message || 'Google sign-in failed. Please try again or use direct access.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const directSignIn = (email?: string, name?: string) => {
    const defaultEmail = email && email.includes('@') ? email.trim() : 'creator@zailograph.app';
    const defaultName = name?.trim() || defaultEmail.split('@')[0] || 'ZailoGraph Creator';
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: defaultEmail,
      name: defaultName,
      createdAt: new Date().toISOString(),
      tier: 'free_registered',
    };
    setUser(newUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    } catch {}
    closeAuthModal();
  };

  const registerEmailSession = (email: string) => {
    directSignIn(email);
  };

  const signInWithEmail = (email: string) => {
    registerEmailSession(email);
  };

  const signUpWithEmail = (email: string) => {
    registerEmailSession(email);
  };

  const updateUserName = async (newName: string): Promise<boolean> => {
    const trimmed = newName.trim();
    if (!trimmed || !user) return false;

    const updatedUser: User = {
      ...user,
      name: trimmed,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {}

    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      } catch (err) {
        console.warn('Firebase displayName update note:', err);
      }
    }
    return true;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setIsSettingsOpen(false);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {}
    }
  };

  const deleteAccount = async (confirmationName: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No active user session to delete.' };
    }

    const currentName = (user.name || user.email.split('@')[0]).trim();
    if (confirmationName.trim().toLowerCase() !== currentName.toLowerCase()) {
      return { 
        success: false, 
        error: `Confirmation text does not match "${currentName}". Please type your exact name to confirm.` 
      };
    }

    // Attempt Firebase user deletion if signed in through Firebase
    try {
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch (fbErr: any) {
          console.warn('Firebase user deletion note:', fbErr);
          if (fbErr.code === 'auth/requires-recent-login') {
            await signOut(auth);
          }
        }
      }
    } catch (e) {
      console.warn('Firebase deletion cleanup:', e);
    }

    // Wipe all local sessions and cached workspace data
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('zailo') || key.startsWith('imazora'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}

    setUser(null);
    setIsSettingsOpen(false);
    return { success: true };
  };

  const validateFileSize = (sizeInBytes: number) => {
    const max = entitlements.maxFileSize;
    if (sizeInBytes > max) {
      return {
        allowed: false,
        maxAllowed: max,
        message: `File size exceeds the ${(max / (1024 * 1024)).toFixed(0)} MB browser memory safety limit (${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB). Processing larger files may cause browser tabs to crash.`,
      };
    }
    return { allowed: true, maxAllowed: max };
  };

  const validateBatchCount = (currentCount: number, addingCount: number) => {
    const max = entitlements.maxBatchQueue;
    const remaining = max - currentCount;
    if (remaining <= 0) {
      return {
        allowed: false,
        maxAllowed: max,
        allowedCount: 0,
        message: `Maximum batch queue capacity reached (${max} images). Process or clear items to add more.`,
      };
    }
    const allowedCount = Math.min(addingCount, remaining);
    return {
      allowed: allowedCount === addingCount,
      maxAllowed: max,
      allowedCount,
      message: allowedCount < addingCount
        ? `Queued ${allowedCount} images (Maximum batch queue capacity is ${max} images).`
        : undefined,
    };
  };

  const isUtilityUnlocked = (utilityId: string): boolean => {
    // If utility is in the Pro gated list, require active authenticated session
    if (PRO_GATED_UTILITIES.includes(utilityId)) {
      return !!user;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tier,
        entitlements,
        isAuthenticated: !!user,
        authModal,
        isLoading,
        authError,
        isSettingsOpen,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        directSignIn,
        logout,
        openAuthModal,
        closeAuthModal,
        clearAuthError,
        openSettings,
        closeSettings,
        updateUserName,
        deleteAccount,
        validateFileSize,
        validateBatchCount,
        isUtilityUnlocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

