import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserTier, Entitlements, AuthModalState, AuthModalReason } from '../types/auth';
import { UTILITIES } from '../types/utility';

const GUEST_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const REGISTERED_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const GUEST_MAX_BATCH = 3;
const REGISTERED_MAX_BATCH = 50;

const GUEST_ENTITLEMENTS: Entitlements = {
  maxFileSize: GUEST_MAX_FILE_SIZE,
  maxBatchQueue: GUEST_MAX_BATCH,
  maxExportResolution: { width: 1920, height: 1080 },
  gatedUtilities: UTILITIES.filter(u => u.isCompetitorPaid).map(u => u.id),
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
  loginWithDemo: (email?: string) => void;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  openAuthModal: (reason: AuthModalReason, targetUtilityId?: string, customMessage?: string) => void;
  closeAuthModal: () => void;
  
  // Quota Evaluators
  validateFileSize: (sizeInBytes: number) => { allowed: boolean; maxAllowed: number; message?: string };
  validateBatchCount: (currentCount: number, addingCount: number) => { allowed: boolean; maxAllowed: number; allowedCount: number; message?: string };
  isUtilityUnlocked: (utilityId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'imazora_user_session';

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
  const entitlements = tier === 'free_registered' ? REGISTERED_ENTITLEMENTS : GUEST_ENTITLEMENTS;

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

  const loginWithDemo = (email = 'creator@zorquelz.com') => {
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
      tier: 'free_registered',
    };
    setUser(newUser);
    closeAuthModal();
  };

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    // In production, this dispatches via Supabase Auth / Zorquelz auth endpoint
    loginWithDemo(email);
    return true;
  };

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<void> => {
    loginWithDemo(`user.${provider}@zorquelz.com`);
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
        message: tier === 'guest'
          ? `Guest files are limited to 10 MB (${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB dropped). Log in for free to process files up to 50 MB!`
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
        message: tier === 'guest'
          ? `Guest batch queue limit reached (max ${max} images). Log in for free to process up to 50 images simultaneously!`
          : `Maximum batch queue capacity reached (50 images).`,
      };
    }
    const allowedCount = Math.min(addingCount, remaining);
    return {
      allowed: allowedCount === addingCount,
      maxAllowed: max,
      allowedCount,
      message: allowedCount < addingCount && tier === 'guest'
        ? `Queued ${allowedCount} images. (Guest limit is ${max}). Log in for free to queue up to 50 images simultaneously!`
        : undefined,
    };
  };

  const isUtilityUnlocked = (utilityId: string) => {
    if (tier === 'free_registered') return true;
    return !entitlements.gatedUtilities.includes(utilityId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tier,
        entitlements,
        isAuthenticated: !!user,
        authModal,
        loginWithDemo,
        loginWithMagicLink,
        loginWithOAuth,
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
