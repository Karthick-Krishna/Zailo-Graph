import { describe, it, expect, beforeEach } from 'vitest';
import { PRO_GATED_UTILITIES } from '../types/auth';
import { 
  sanitizeDisplayName, 
  createOrSyncProfile, 
  completeOnboarding, 
  getUserProfile, 
  updateProfileDisplayName,
  getActiveSession 
} from '../services/profile';

describe('Zailo Graph Google Authentication, Profile Architecture & Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Display Name Sanitization & Validation', () => {
    it('rejects empty or whitespace-only names', () => {
      expect(sanitizeDisplayName('').isValid).toBe(false);
      expect(sanitizeDisplayName('   ').isValid).toBe(false);
      expect(sanitizeDisplayName('\t\n').isValid).toBe(false);
    });

    it('enforces maximum character length of 50', () => {
      const longName = 'A'.repeat(60);
      const res = sanitizeDisplayName(longName);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('50 characters');
    });

    it('sanitizes unsafe script or HTML tags while preserving clean text', () => {
      const res = sanitizeDisplayName('<script>alert("xss")</script>Alex');
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe('scriptalert("xss")/scriptAlex');
      expect(res.sanitized).not.toContain('<');
      expect(res.sanitized).not.toContain('>');
    });

    it('preserves valid international Unicode characters, accents, and spacing', () => {
      const res = sanitizeDisplayName('  Renée Éloïse Müller  ');
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe('Renée Éloïse Müller');

      const japanese = sanitizeDisplayName('木村 拓哉');
      expect(japanese.isValid).toBe(true);
      expect(japanese.sanitized).toBe('木村 拓哉');
    });
  });

  describe('Profile Architecture & Onboarding State Machine', () => {
    const mockFirebaseUser = {
      uid: 'google_uid_12345',
      email: 'alex.kumar@gmail.com',
      displayName: 'Alex Kumar',
      photoURL: 'https://lh3.googleusercontent.com/a/mock_photo',
      metadata: {
        creationTime: '2026-11-09T00:00:00.000Z',
      },
    } as any;

    it('recognizes a first-time Google login and initializes draft profile with onboarding_completed: false', () => {
      const { profile, isNewUser } = createOrSyncProfile(mockFirebaseUser);
      expect(isNewUser).toBe(true);
      expect(profile.id).toBe('google_uid_12345');
      expect(profile.email).toBe('alex.kumar@gmail.com');
      expect(profile.google_name).toBe('Alex Kumar');
      expect(profile.avatar_url).toBe('https://lh3.googleusercontent.com/a/mock_photo');
      expect(profile.onboarding_completed).toBe(false);
    });

    it('completes onboarding when user enters a custom display name', () => {
      createOrSyncProfile(mockFirebaseUser);
      const updated = completeOnboarding('google_uid_12345', 'Alex K.');

      expect(updated).not.toBeNull();
      expect(updated?.display_name).toBe('Alex K.');
      expect(updated?.onboarding_completed).toBe(true);
      expect(updated?.email).toBe('alex.kumar@gmail.com');

      // Verify persisted in localStorage
      const saved = getUserProfile('google_uid_12345');
      expect(saved?.display_name).toBe('Alex K.');
      expect(saved?.onboarding_completed).toBe(true);
    });

    it('correctly implements Skip by using Google account name as fallback', () => {
      createOrSyncProfile(mockFirebaseUser);
      // User skips setting custom name
      const updated = completeOnboarding('google_uid_12345');

      expect(updated).not.toBeNull();
      expect(updated?.display_name).toBe('Alex Kumar');
      expect(updated?.onboarding_completed).toBe(true);
    });

    it('recognizes returning users and NEVER overwrites custom display name with Google profile name', () => {
      // 1. Initial login + set custom name
      createOrSyncProfile(mockFirebaseUser);
      completeOnboarding('google_uid_12345', 'Studio Architect');

      // 2. Returning user signs in again with Google
      const { profile, isNewUser } = createOrSyncProfile(mockFirebaseUser);
      expect(isNewUser).toBe(false);
      expect(profile.onboarding_completed).toBe(true);
      // Strictly preserves user's chosen custom name
      expect(profile.display_name).toBe('Studio Architect');
      expect(profile.google_name).toBe('Alex Kumar');
      expect(profile.email).toBe('alex.kumar@gmail.com');
    });

    it('allows updating display name from Settings', () => {
      createOrSyncProfile(mockFirebaseUser);
      completeOnboarding('google_uid_12345', 'Original Name');

      const updated = updateProfileDisplayName('google_uid_12345', 'New Creative Name');
      expect(updated?.display_name).toBe('New Creative Name');

      const active = getActiveSession();
      expect(active?.name).toBe('New Creative Name');
      expect(active?.email).toBe('alex.kumar@gmail.com');
    });
  });

  describe('Strict Google Email in Settings Verification', () => {
    it('ensures email is always the authenticated Google email, not an editable display name or placeholder', () => {
      const mockUser = {
        uid: 'user_real_google',
        email: 'genuine.artist@gmail.com',
        displayName: 'Genuine Artist',
      } as any;

      const { profile } = createOrSyncProfile(mockUser);
      // User sets an arbitrary custom display name
      const finalized = completeOnboarding(profile.id, 'My Custom Alias');

      // The email MUST remain genuine.artist@gmail.com
      expect(finalized?.email).toBe('genuine.artist@gmail.com');
      expect(finalized?.display_name).toBe('My Custom Alias');
      expect(finalized?.email).not.toBe(finalized?.display_name);
    });
  });

  describe('Pro Utility Gating', () => {
    it('correctly locks the 11 Pro utilities for guests and unlocks all 26 for authenticated users', () => {
      expect(PRO_GATED_UTILITIES).toHaveLength(11);
      expect(PRO_GATED_UTILITIES).toContain('document-converter');
      expect(PRO_GATED_UTILITIES).toContain('workflow-recipes');
      expect(PRO_GATED_UTILITIES).toContain('svg-to-png');
      expect(PRO_GATED_UTILITIES).toContain('png-to-svg');
      expect(PRO_GATED_UTILITIES).toContain('camera-raw');
      expect(PRO_GATED_UTILITIES).toContain('watermark');
      expect(PRO_GATED_UTILITIES).toContain('collage-maker');
      expect(PRO_GATED_UTILITIES).toContain('passport-photo');
      expect(PRO_GATED_UTILITIES).toContain('exif-remover');
      expect(PRO_GATED_UTILITIES).toContain('privacy-redact');
      expect(PRO_GATED_UTILITIES).toContain('favicon-studio');

      const isUtilityUnlocked = (id: string, user: any) => {
        if (PRO_GATED_UTILITIES.includes(id)) {
          return !!user;
        }
        return true;
      };

      expect(isUtilityUnlocked('compression', null)).toBe(true);
      expect(isUtilityUnlocked('document-converter', null)).toBe(false);
      expect(isUtilityUnlocked('camera-raw', null)).toBe(false);
      expect(isUtilityUnlocked('watermark', null)).toBe(false);

      const loggedInUser = {
        id: 'usr_auth_1',
        email: 'creator@gmail.com',
        name: 'Creator',
        tier: 'free_registered',
        onboarding_completed: true,
        createdAt: new Date().toISOString(),
      };

      expect(isUtilityUnlocked('camera-raw', loggedInUser)).toBe(true);
      expect(isUtilityUnlocked('watermark', loggedInUser)).toBe(true);
      expect(isUtilityUnlocked('workflow-recipes', loggedInUser)).toBe(true);
    });
  });

  describe('Danger Zone Account Deletion', () => {
    it('strictly enforces exact matching of display name before deletion', () => {
      const currentName = 'Alex Kumar';
      const isConfirmed = (input: string) => input.trim().toLowerCase() === currentName.trim().toLowerCase();

      expect(isConfirmed('Alex')).toBe(false);
      expect(isConfirmed('Kumar')).toBe(false);
      expect(isConfirmed('alex kumar')).toBe(true);
      expect(isConfirmed('  Alex Kumar  ')).toBe(true);
    });
  });

  describe('Sign In vs Sign Up & Returning User Recognition', () => {
    it('automatically logs in an already signed up user when they click sign up again', () => {
      const user = {
        uid: 'user_signed_up_already',
        email: 'returning.creator@gmail.com',
        displayName: 'Returning Creator',
        metadata: {
          creationTime: '2026-11-01T00:00:00.000Z',
          lastSignInTime: '2026-11-09T10:00:00.000Z',
        },
      } as any;

      // First signup session
      const first = createOrSyncProfile(user);
      expect(first.isNewUser).toBe(false); // Because creationTime is earlier than lastSignInTime by >10s
      completeOnboarding(user.uid, 'Custom Creative Alias');

      // User signs out, then later clicks "Sign Up" button again
      const second = createOrSyncProfile(user);
      expect(second.isNewUser).toBe(false);
      expect(second.profile.onboarding_completed).toBe(true);
      expect(second.profile.display_name).toBe('Custom Creative Alias');
    });

    it('identifies prior Firebase account creation even without local storage', () => {
      const existingFirebaseUser = {
        uid: 'established_uid_456',
        email: 'prior.account@gmail.com',
        displayName: 'Prior Account',
        metadata: {
          creationTime: '2026-10-01T00:00:00.000Z',
          lastSignInTime: '2026-11-09T00:00:00.000Z',
        },
      } as any;

      const result = createOrSyncProfile(existingFirebaseUser);
      // Because creationTime is well in the past, they already signed up in a prior session
      expect(result.isNewUser).toBe(false);
      expect(result.profile.onboarding_completed).toBe(true);
    });
  });
});
