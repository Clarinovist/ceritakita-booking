/**
 * Application-wide constants
 */

/**
 * Upload folder names for file organization
 */
export const UPLOAD_FOLDERS = {
  LOGO: 'logos',
  PORTFOLIO: 'portfolio',
  PAYMENT_PROOF: 'payment_proofs',
  PROFILE: 'profiles',
  GENERAL: 'general'
} as const;

/**
 * File upload constraints
 */
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
} as const;

/**
 * Settings cache configuration
 */
export const SETTINGS_CACHE = {
  KEY: 'system_settings',
  TIME_KEY: 'system_settings_time',
  TTL: 5 * 60 * 1000 // 5 minutes
} as const;
