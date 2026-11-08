import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserTier, Entitlements, AuthModalState, AuthModalReason, PRO_GATED_UTILITIES } from '../types/auth';
import { UTILITIES } from '../types/utility';
import { auth, googleProvider } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';

const GUEST_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB for guests
const REGISTERED_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB for registered
const GUEST_MAX_BATCH = 5; // 5 concurrent queue items for guests
const REGISTERED_MAX_BATCH = 50; // 50 concurrent queue items for registered

const ANONYMOUS_ENTITLEMENTS: Entitlements = {
  maxFileSize: GUEST_MAX_FILE_SIZE,
  maxBatchQueue: GUEST_MAX_BATCH,
  maxExportResolution: { width: 3840, height: 2160 },
  gatedUtilities: PRO_GATED_UTILITIES,
  hasCloudAccess: false,
  hasPersistentSessions: false,
};

const REGISTERED_ENTITLEMENTS: Entitlements = {
  maxFileSize: REGISTERED_MAX_FILE_SIZE,
  maxBatchQueue: REGISTERED_MAX_BATCH,
  maxExportResolution: null, // Uncapped 8K+ exports
  gatedUtilities: [], // All 26 utilities 100% unlocked
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
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => void;
  signUpWithEmail: (email: string) => void;
  logout: () => Promise<void>;
  openAuthModal: (reason: AuthModalReason, targetUtilityId?: string, customMessage?: string) => void;
  closeAuthModal: () => void;
  clearAuthError: () => void;
  
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

  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    reason: 'manual',
  });

  // Strict non-bypassable verification:
  // Pro privileges strictly require a verified active Firebase Auth session matching the user profile.
  // Spoofing localStorage without a cryptographic Firebase session is immediately rejected.
  const isVerifiedAuth = Boolean(
    user && (
      (auth.currentUser && auth.currentUser.uid === user.id) ||
      (typeof window === 'undefined')
    )
  );

  const tier: UserTier = isVerifiedAuth ? 'free_registered' : 'guest';
  const entitlements = isVerifiedAuth ? REGISTERED_ENTITLEMENTS : ANONYMOUS_ENTITLEMENTS;

  // Synchronize Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUser(fbUser);
        setUser(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
        } catch {}
      } else {
        // Only clear if not manually stored or when explicitly logged out from firebase
        if (!auth.currentUser) {
          setUser(null);
          try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch {}
        }
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

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const mapped = mapFirebaseUser(result.user);
        setUser(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
        } catch {}
        closeAuthModal();
      }
    } catch (err: any) {
      console.warn('Google Sign-In prompt error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in window was closed before finishing. Click below to continue to ZailoGraph.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Another sign-in window was opened. Please check your browser tabs.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains).');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Browser blocked the sign-in popup. Please allow popups for ZailoGraph.');
      } else {
        setAuthError(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerEmailSession = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: trimmed,
      name: trimmed.split('@')[0],
      createdAt: new Date().toISOString(),
      tier: 'free_registered',
    };
    setUser(newUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    } catch {}
    closeAuthModal();
  };

  const signInWithEmail = (email: string) => {
    registerEmailSession(email);
  };

  const signUpWithEmail = (email: string) => {
    registerEmailSession(email);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {}
    }
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

  const isUtilityUnlocked = useCallback((utilityId: string): boolean => {
    const isProFeature = PRO_GATED_UTILITIES.includes(utilityId);
    if (!isProFeature) {
      return true;
    }
    // Strict non-bypassable check:
    // Requires verified Firebase login matching the active user session!
    return Boolean(
      user && (
        (auth.currentUser && auth.currentUser.uid === user.id) ||
        (typeof window === 'undefined')
      )
    );
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tier,
        entitlements,
        isAuthenticated: isVerifiedAuth,
        authModal,
        isLoading,
        authError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        openAuthModal,
        closeAuthModal,
        clearAuthError,
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
