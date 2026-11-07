export type UserTier = 'guest' | 'free_registered';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  tier: UserTier;
}

export interface Entitlements {
  maxFileSize: number; // in bytes (e.g. 10 * 1024 * 1024 for guest, 50 * 1024 * 1024 for registered)
  maxBatchQueue: number; // 3 for guest, 50 for registered
  maxExportResolution: {
    width: number;
    height: number;
  } | null; // null = uncapped; { 1920, 1080 } for guest
  gatedUtilities: string[];
  hasCloudAccess: boolean;
  hasPersistentSessions: boolean;
}

export type AuthModalReason = 
  | 'size_limit'
  | 'batch_limit'
  | 'pro_feature'
  | 'resolution_limit'
  | 'manual';

export interface AuthModalState {
  isOpen: boolean;
  reason: AuthModalReason;
  targetUtilityId?: string;
  customMessage?: string;
}

