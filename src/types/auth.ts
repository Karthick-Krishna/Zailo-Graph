export type UserTier = 'guest' | 'free_registered';

export const PRO_GATED_UTILITIES: string[] = [
  'workflow-recipes',
  'svg-to-png',
  'png-to-svg',
  'camera-raw',
  'watermark',
  'collage-maker',
  'passport-photo',
  'exif-remover',
  'privacy-redact',
  'favicon-studio',
];

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  tier: UserTier;
}

export interface Entitlements {
  maxFileSize: number; // in bytes (e.g. 100 * 1024 * 1024)
  maxBatchQueue: number; // 50 concurrent items
  maxExportResolution: {
    width: number;
    height: number;
  } | null; // null = uncapped
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


