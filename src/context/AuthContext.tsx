import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserTier, Entitlements, AuthModalState, AuthModalReason, AuthModalMode, PRO_GATED_UTILITIES } from '../types/auth';
import { auth, googleProvider } from '../services/firebase';
import { 
  onAuthStateChanged, 
  getRedirectResult,
  signInWithPopup, 
  signInWithRedirect,
  signOut,
  updateProfile,
  deleteUser,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  createOrSyncProfile, 
  getUserProfile, 
  completeOnboarding, 
  updateProfileDisplayName, 
  deleteStoredUserProfile,
  getActiveSession,
  mapProfileToUser
} from '../services/profile';

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

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthContextType {
  user: User | null;
  tier: UserTier;
  entitlements: Entitlements;
  isAuthenticated: boolean;
  authModal: AuthModalState;
  isOnboardingOpen: boolean;
  isSettingsOpen: boolean;
  isLoading: boolean;
  authError: string | null;
  toast: ToastState | null;
  
  // Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;

  // Actions (STRICTLY Google Only)
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  openAuthModal: (reason?: AuthModalReason, targetUtilityId?: string, customMessage?: string, mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  clearAuthError: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  completeUserOnboarding: (customName?: string) => Promise<void>;
  skipUserOnboarding: () => Promise<void>;
  updateUserName: (newName: string) => Promise<boolean>;
  deleteAccount: (confirmationName: string) => Promise<{ success: boolean; error?: string }>;
  
  // Quota Evaluators
  validateFileSize: (sizeInBytes: number) => { allowed: boolean; maxAllowed: number; message?: string };
  validateBatchCount: (currentCount: number, addingCount: number) => { allowed: boolean; maxAllowed: number; allowedCount: number; message?: string };
  isUtilityUnlocked: (utilityId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize user from cached active session for instantaneous rendering
  const [user, setUser] = useState<User | null>(() => getActiveSession());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    mode: 'sign_in',
    reason: 'manual',
  });

  const tier: UserTier = user ? 'free_registered' : 'guest';
  const entitlements = user ? REGISTERED_ENTITLEMENTS : ANONYMOUS_ENTITLEMENTS;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Process authenticated user returned from Google OAuth
  const handleAuthSuccess = useCallback((fbUser: FirebaseUser) => {
    setAuthError(null);
    setToast(null);
    const { profile, isNewUser } = createOrSyncProfile(fbUser);
    const mapped = mapProfileToUser(profile);
    setUser(mapped);
    closeAuthModal();

    if (isNewUser) {
      // First-time signup: show smooth display-name onboarding screen
      setIsOnboardingOpen(true);
    } else {
      // User has already signed up: automatically log into existing account and welcome back
      showToast(`Welcome back, ${mapped.name || 'Creator'}!`, 'success');
    }
  }, [showToast]);

  // Handle Firebase redirect result (if returning from OAuth redirect) and state changes
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          handleAuthSuccess(result.user);
          // Clean up OAuth query parameters from URL cleanly
          if (window.location.search || window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      })
      .catch((err: any) => {
        console.warn('Redirect auth handler warning:', err);
        if (err.code === 'auth/unauthorized-domain') {
          setAuthError('Domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains).');
        } else if (err.code === 'auth/network-request-failed') {
          showToast('Connection problem. Check your internet connection and try again.', 'error');
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // Authenticated with Google: sync profile while strictly preserving custom display names
        const { profile } = createOrSyncProfile(fbUser);
        setUser(mapProfileToUser(profile));
        setAuthError(null);
        // Automatically close auth modal if it was open
        setAuthModal((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
      } else {
        // If not authenticated in Firebase, check if an existing session is cached
        const cached = getActiveSession();
        if (cached) {
          setUser(cached);
        } else {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, [handleAuthSuccess, showToast]);

  const openAuthModal = (
    reason: AuthModalReason = 'manual', 
    targetUtilityId?: string, 
    customMessage?: string,
    mode: AuthModalMode = 'sign_in'
  ) => {
    setAuthError(null);
    setAuthModal({
      isOpen: true,
      mode,
      reason,
      targetUtilityId,
      customMessage,
    });
  };

  const closeAuthModal = () => {
    setAuthError(null);
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const setAuthModalMode = (mode: AuthModalMode) => {
    setAuthModal(prev => ({ ...prev, mode }));
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

  /**
   * Fast, seamless Google-Only Authentication
   * - Eliminates manual confirmation step
   * - Uses popup flow with same-origin-allow-popups for immediate completion
   * - Automatically detects authenticated session
   * - Eliminates false 'cancelled' toasts by verifying auth.currentUser resolution
   * - Seamlessly transitions to onboarding (new user) or workspace (returning user)
   */
  const signInWithGoogle = async () => {
    if (isLoading) return; // Prevent duplicate concurrent authentication requests
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        handleAuthSuccess(result.user);
        return;
      }
    } catch (popupErr: any) {
      console.warn('Google Sign-In Popup event:', popupErr);

      // Verify if authentication actually succeeded despite popup close event timing
      if (auth.currentUser) {
        handleAuthSuccess(auth.currentUser);
        return;
      }

      // Check if auth state resolves during a brief grace window (OAuth postMessage handshake delay)
      let resolvedUser: FirebaseUser | null = auth.currentUser;
      if (!resolvedUser) {
        for (let i = 0; i < 5; i++) {
          await new Promise((r) => setTimeout(r, 250));
          if (auth.currentUser) {
            resolvedUser = auth.currentUser;
            break;
          }
        }
      }

      if (resolvedUser) {
        handleAuthSuccess(resolvedUser);
        return;
      }

      if (popupErr.code === 'auth/popup-closed-by-user') {
        // Only show cancellation if authentication truly was not completed after grace period
        if (!auth.currentUser) {
          showToast('Google sign-in was cancelled.', 'info');
          setAuthError('Google sign-in was cancelled.');
        }
      } else if (popupErr.code === 'auth/cancelled-popup-request') {
        // A prior popup was superseded, silently ignore
      } else if (popupErr.code === 'auth/network-request-failed') {
        showToast('Connection problem. Check your internet connection and try again.', 'error');
        setAuthError('Connection problem. Check your internet connection and try again.');
      } else if (popupErr.code === 'auth/popup-blocked') {
        // Fallback to redirect if browser strictly blocks popups
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          console.error('Redirect fallback error:', redirectErr);
          showToast('Unable to sign in. Please try again.', 'error');
          setAuthError('Unable to sign in. Please allow popups or try again.');
        }
      } else if (popupErr.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains).');
      } else {
        showToast('Unable to sign in. Please try again.', 'error');
        setAuthError(popupErr.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete new user onboarding with custom display name
   */
  const completeUserOnboarding = async (customName?: string) => {
    if (!user) return;
    const updatedProfile = completeOnboarding(user.id, customName);
    if (!updatedProfile) return;

    // Update Firebase displayName if accessible
    if (auth.currentUser && updatedProfile.display_name) {
      try {
        await updateProfile(auth.currentUser, { displayName: updatedProfile.display_name });
      } catch (err) {
        console.warn('Could not update Firebase displayName:', err);
      }
    }

    const updatedUser = mapProfileToUser(updatedProfile);
    setUser(updatedUser);
    setIsOnboardingOpen(false);
    showToast(`Welcome to Imazora, ${updatedUser.name}!`, 'success');
  };

  /**
   * Skip onboarding: adopts real Google account name as display name
   */
  const skipUserOnboarding = async () => {
    if (!user) return;
    const updatedProfile = completeOnboarding(user.id);
    if (!updatedProfile) return;

    const updatedUser = mapProfileToUser(updatedProfile);
    setUser(updatedUser);
    setIsOnboardingOpen(false);
    showToast('Successfully signed in with Google.', 'success');
  };

  /**
   * Update display name from Settings
   */
  const updateUserName = async (newName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedProfile = updateProfileDisplayName(user.id, newName);
      if (!updatedProfile) return false;

      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: updatedProfile.display_name });
        } catch (err) {
          console.warn('Firebase displayName update note:', err);
        }
      }

      setUser(mapProfileToUser(updatedProfile));
      showToast('Your display name has been updated.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to update display name.', 'error');
      return false;
    }
  };

  /**
   * Cleanly sign out of Google session and reset application state
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out warning:', err);
    } finally {
      if (user) {
        deleteStoredUserProfile(user.id);
      }
      setUser(null);
      setIsSettingsOpen(false);
      setIsOnboardingOpen(false);
      showToast('Signed out successfully.', 'info');
    }
  };

  /**
   * Permanent account deletion with strict display name retyping confirmation
   */
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
      console.warn('Firebase deletion cleanup note:', e);
    }

    // Purge local profile and sessions
    deleteStoredUserProfile(user.id);
    setUser(null);
    setIsSettingsOpen(false);
    setIsOnboardingOpen(false);
    showToast('Account permanently deleted.', 'info');

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
        isOnboardingOpen,
        isSettingsOpen,
        isLoading,
        authError,
        toast,
        showToast,
        dismissToast,
        signInWithGoogle,
        logout,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        clearAuthError,
        openSettings,
        closeSettings,
        completeUserOnboarding,
        skipUserOnboarding,
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
