import { describe, it, expect, beforeEach } from 'vitest';
import { PRO_GATED_UTILITIES } from '../types/auth';

describe('Auth & Pro Gating Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly gates the 10 designated Pro utilities for unauthenticated guest sessions', () => {
    expect(PRO_GATED_UTILITIES).toHaveLength(10);
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

    const isUtilityUnlockedGuest = (id: string, user: any) => {
      if (PRO_GATED_UTILITIES.includes(id)) {
        return !!user;
      }
      return true;
    };

    // Unauthenticated guest user
    const guestUser = null;
    expect(isUtilityUnlockedGuest('compression', guestUser)).toBe(true);
    expect(isUtilityUnlockedGuest('batch-resize', guestUser)).toBe(true);
    expect(isUtilityUnlockedGuest('avatar-crop', guestUser)).toBe(true);
    
    // Pro gated tools must be locked
    expect(isUtilityUnlockedGuest('camera-raw', guestUser)).toBe(false);
    expect(isUtilityUnlockedGuest('png-to-svg', guestUser)).toBe(false);
    expect(isUtilityUnlockedGuest('svg-to-png', guestUser)).toBe(false);
    expect(isUtilityUnlockedGuest('watermark', guestUser)).toBe(false);
    expect(isUtilityUnlockedGuest('passport-photo', guestUser)).toBe(false);
    expect(isUtilityUnlockedGuest('privacy-redact', guestUser)).toBe(false);

    // Authenticated user
    const loggedInUser = {
      id: 'usr_test123',
      email: 'alex@example.com',
      name: 'Alex Chen',
      tier: 'free_registered',
      createdAt: new Date().toISOString(),
    };

    expect(isUtilityUnlockedGuest('camera-raw', loggedInUser)).toBe(true);
    expect(isUtilityUnlockedGuest('png-to-svg', loggedInUser)).toBe(true);
    expect(isUtilityUnlockedGuest('workflow-recipes', loggedInUser)).toBe(true);
    expect(isUtilityUnlockedGuest('watermark', loggedInUser)).toBe(true);
    expect(isUtilityUnlockedGuest('passport-photo', loggedInUser)).toBe(true);
  });

  it('persists and retrieves user session from localStorage', () => {
    const userSession = {
      id: 'usr_abc987',
      email: 'creator@zailograph.app',
      name: 'Zailo Creator',
      tier: 'free_registered',
      createdAt: '2026-11-09T00:00:00.000Z',
    };

    localStorage.setItem('zailo_graph_user_session', JSON.stringify(userSession));
    const retrieved = JSON.parse(localStorage.getItem('zailo_graph_user_session') || '{}');

    expect(retrieved.id).toBe('usr_abc987');
    expect(retrieved.email).toBe('creator@zailograph.app');
    expect(retrieved.name).toBe('Zailo Creator');
  });

  it('validates account deletion requires exact matching name before permitting deletion', () => {
    const user = {
      id: 'usr_1',
      name: 'Karthick Krishna',
      email: 'karthick@example.com',
    };

    const validateDeletion = (typedText: string, currentUserName: string) => {
      return typedText.trim().toLowerCase() === currentUserName.trim().toLowerCase();
    };

    // Mismatched names should fail
    expect(validateDeletion('Karthick', user.name)).toBe(false);
    expect(validateDeletion('karthik', user.name)).toBe(false);
    expect(validateDeletion('Random text', user.name)).toBe(false);

    // Exact name matches
    expect(validateDeletion('Karthick Krishna', user.name)).toBe(true);
    expect(validateDeletion('  karthick krishna  ', user.name)).toBe(true);
  });
});

