/**
 * Shared types for System Settings
 * Prevents duplicate type definitions across the application
 */

export interface SystemSettings {
  site_name: string;
  site_logo: string;
  business_phone: string;
  business_address: string;
}

export interface SettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

export interface SettingsAuditLog {
  id: number;
  key: string;
  old_value: string | null;
  new_value: string;
  updated_by: string;
  updated_at: string;
}
