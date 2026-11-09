import { UserProfile, User } from '../types/auth';
import { User as FirebaseUser } from 'firebase/auth';

const PROFILE_PREFIX = 'imazora_profile_';
const ACTIVE_SESSION_KEY = 'imazora_user_session';

/**
 * Sanitizes and validates a display name string.
 * - Trims whitespace
 * - Strips unsafe HTML/script tags
 * - Validates length 1..50 characters
 * - Preserves Unicode characters (e.g. international names, accents, emojis)
 */
export const sanitizeDisplayName = (name: string): { isValid: boolean; sanitized: string; error?: string } => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, sanitized: '', error: 'Display name cannot be empty.' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, sanitized: trimmed.slice(0, 50), error: 'Display name cannot exceed 50 characters.' };
  }
  // Strip dangerous HTML/script characters
  const sanitized = trimmed.replace(/[<>]/g, '');
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Display name contains invalid characters.' };
  }
  return { isValid: true, sanitized };
};

/**
 * Retrieve saved profile for a given Firebase User UID
 */
export const getUserProfile = (uid: string): UserProfile | null => {
  try {
    const raw = localStorage.getItem(`${PROFILE_PREFIX}${uid}`);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (err) {
    console.warn('Failed to parse user profile from localStorage:', err);
    return null;
  }
};

/**
 * Save user profile to persistent localStorage
 */
export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(`${PROFILE_PREFIX}${profile.id}`, JSON.stringify(profile));
    // Also update current active session
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(mapProfileToUser(profile)));
  } catch (err) {
    console.warn('Failed to save user profile to localStorage:', err);
  }
};

/**
 * Map a UserProfile object to the runtime User type
 */
export const mapProfileToUser = (profile: UserProfile): User => {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.display_name,
    display_name: profile.display_name,
    google_name: profile.google_name,
    avatarUrl: profile.avatar_url,
    onboarding_completed: profile.onboarding_completed,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    tier: 'free_registered',
  };
};

/**
 * Synchronize Firebase authenticated user with local profile.
 * - If profile exists: preserves existing display_name, updates email and avatar.
 * - If profile does not exist: creates new profile with onboarding_completed: false.
 */
export const createOrSyncProfile = (fbUser: FirebaseUser): { profile: UserProfile; isNewUser: boolean } => {
  const existing = getUserProfile(fbUser.uid);
  const now = new Date().toISOString();

  const googleName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User';
  const realEmail = fbUser.email || '';
  const photoUrl = fbUser.photoURL || undefined;

  if (existing) {
    // Returning user: update latest Google credentials while strictly preserving custom display name
    const updated: UserProfile = {
      ...existing,
      email: realEmail || existing.email,
      google_name: googleName,
      avatar_url: photoUrl || existing.avatar_url,
      updated_at: now,
    };
    saveUserProfile(updated);
    return {
      profile: updated,
      isNewUser: !updated.onboarding_completed,
    };
  }

  // First-time new user: initialize draft profile
  const newProfile: UserProfile = {
    id: fbUser.uid,
    email: realEmail,
    google_name: googleName,
    avatar_url: photoUrl,
    display_name: googleName,
    onboarding_completed: false,
    created_at: fbUser.metadata?.creationTime || now,
    updated_at: now,
  };

  saveUserProfile(newProfile);
  return {
    profile: newProfile,
    isNewUser: true,
  };
};

/**
 * Complete onboarding by setting a custom display name or adopting the Google fallback.
 */
export const completeOnboarding = (uid: string, customName?: string): UserProfile | null => {
  const profile = getUserProfile(uid);
  if (!profile) return null;

  let effectiveName = profile.google_name || profile.email.split('@')[0] || 'Imazora Creator';
  if (customName && customName.trim()) {
    const { isValid, sanitized } = sanitizeDisplayName(customName);
    if (isValid && sanitized) {
      effectiveName = sanitized;
    }
  }

  const updated: UserProfile = {
    ...profile,
    display_name: effectiveName,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  saveUserProfile(updated);
  return updated;
};

/**
 * Update display name for an existing user
 */
export const updateProfileDisplayName = (uid: string, newName: string): UserProfile | null => {
  const profile = getUserProfile(uid);
  if (!profile) return null;

  const { isValid, sanitized, error } = sanitizeDisplayName(newName);
  if (!isValid || !sanitized) {
    throw new Error(error || 'Invalid display name.');
  }

  const updated: UserProfile = {
    ...profile,
    display_name: sanitized,
    updated_at: new Date().toISOString(),
  };

  saveUserProfile(updated);
  return updated;
};

/**
 * Delete profile data when an account is deleted
 */
export const deleteStoredUserProfile = (uid: string): void => {
  try {
    localStorage.removeItem(`${PROFILE_PREFIX}${uid}`);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    // Legacy cleanup
    localStorage.removeItem('zailo_graph_user_session');
  } catch (err) {
    console.warn('Failed to delete user profile from localStorage:', err);
  }
};

/**
 * Retrieve cached active session on app startup
 */
export const getActiveSession = (): User | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem('zailo_graph_user_session');
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};
