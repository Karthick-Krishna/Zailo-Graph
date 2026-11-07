import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserTier, Entitlements, AuthModalState, AuthModalReason } from '../types/auth';
import { UTILITIES } from '../types/utility';

const ANONYMOUS_MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const REGISTERED_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ANONYMOUS_MAX_BATCH = 5;
const REGISTERED_MAX_BATCH = 50;

const ANONYMOUS_ENTITLEMENTS: Entitlements = {
  maxFileSize: ANONYMOUS_MAX_FILE_SIZE,
  maxBatchQueue: ANONYMOUS_MAX_BATCH,
  maxExportResolution: null, // Uncapped preview & test for all tools
  gatedUtilities: [], // All 25 utilities unlocked for frictionless testing
  hasCloudAccess: false,
  hasPersistentSessions: false,
};

const REGISTERED_ENTITLEMENTS: Entitlements = {
  maxFileSize: REGISTERED_MAX_FILE_SIZE,
  maxBatchQueue: REGISTERED_MAX_BATCH,
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
  
  // Actions
  signInWithEmail: (email: string) => void;
  signUpWithEmail: (email: string) => void;
  logout: () => void;
  openAuthModal: (reason: AuthModalReason, targetUtilityId?: string, customMessage?: string) => void;
  closeAuthModal: () => void;
  
  // Quota Evaluators
  validateFileSize: (sizeInBytes: number) => { allowed: boolean; maxAllowed: number; message?: string };
  validateBatchCount: (currentCount: number, addingCount: number) => { allowed: boolean; maxAllowed: number; allowedCount: number; message?: string };
  isUtilityUnlocked: (utilityId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'zailo_graph_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    reason: 'manual',
  });

  const tier: UserTier = user ? 'free_registered' : 'guest';
  const entitlements = user ? REGISTERED_ENTITLEMENTS : ANONYMOUS_ENTITLEMENTS;

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (reason: AuthModalReason, targetUtilityId?: string, customMessage?: string) => {
    setAuthModal({
      isOpen: true,
      reason,
      targetUtilityId,
      customMessage,
    });
  };

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
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
    closeAuthModal();
  };

  const signInWithEmail = (email: string) => {
    registerEmailSession(email);
  };

  const signUpWithEmail = (email: string) => {
    registerEmailSession(email);
  };

  const logout = () => {
    setUser(null);
  };

  const validateFileSize = (sizeInBytes: number) => {
    const max = entitlements.maxFileSize;
    if (sizeInBytes > max) {
      return {
        allowed: false,
        maxAllowed: max,
        message: !user
          ? `File exceeds size limit (${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB). Sign in with email for free to process files up to 50 MB!`
          : `File exceeds the 50 MB limit (${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB).`,
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
        message: !user
          ? `Batch queue limit reached (${max} images). Sign in with email for free to process up to 50 images concurrently!`
          : `Maximum batch queue capacity reached (50 images).`,
      };
    }
    const allowedCount = Math.min(addingCount, remaining);
    return {
      allowed: allowedCount === addingCount,
      maxAllowed: max,
      allowedCount,
      message: allowedCount < addingCount && !user
        ? `Queued ${allowedCount} images. Sign in with email for free to queue up to 50 images concurrently!`
        : undefined,
    };
  };

  const isUtilityUnlocked = (_utilityId: string) => {
    // All 25 utilities unlocked for live preview & processing
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
        signInWithEmail,
        signUpWithEmail,
        logout,
        openAuthModal,
        closeAuthModal,
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
