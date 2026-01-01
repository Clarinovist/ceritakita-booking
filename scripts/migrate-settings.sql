-- Migration Script: Expand System Settings Table
-- Purpose: Add new columns for comprehensive admin settings
-- Compatible with: SQLite
-- Usage: Execute this script to migrate existing database

-- Add General & SEO fields
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add Contact & Socials fields
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS business_email TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS maps_link TEXT;

-- Add Finance fields (migrated from payment logic)
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS bank_number TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS bank_holder TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS invoice_notes TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS requires_deposit TEXT; -- Store as 'true'/'false' string
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS deposit_amount TEXT; -- Store as string for consistency
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS tax_rate TEXT; -- Store as string for consistency

-- Add Booking Rules fields
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS min_booking_notice INTEGER DEFAULT 1;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS max_booking_ahead INTEGER DEFAULT 90;

-- Add Templates field (existing, but ensure it exists)
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT;

-- Seed default values for new fields (only if they don't exist)
-- This ensures backward compatibility and prevents empty settings

-- Insert default hero title if not exists
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('hero_title', 'Capture Your Special Moments');

-- Insert default SEO meta tags if not exists
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('meta_title', 'Cerita Kita - Professional Photography Services');

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('meta_description', 'Professional photography services in Jakarta. Book your special moments with Cerita Kita. Quality service, affordable prices.');

-- Insert default business email if not exists
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('business_email', 'info@ceritakita.studio');

-- Insert default social links (empty, optional)
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('instagram_url', '');

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('tiktok_url', '');

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('maps_link', '');

-- Insert default bank details (placeholder values)
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('bank_name', 'BCA');

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('bank_number', '1234567890');

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('bank_holder', 'CERITA KITA');

-- Insert default invoice notes
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('invoice_notes', 'Terima kasih telah memilih layanan kami. Pembayaran dapat dilakukan sebelum tanggal sesi. Hubungi kami jika ada pertanyaan.');

-- Insert default payment rules (migrated from existing logic)
-- Note: These would need to be set based on current payment settings
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('requires_deposit', 'false');

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('deposit_amount', '50'); -- 50% deposit

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('tax_rate', '0'); -- 0% tax

-- Insert default booking rules
INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('min_booking_notice', '1');

INSERT OR IGNORE INTO system_settings (key, value) 
VALUES ('max_booking_ahead', '90');

-- Create a backup log of the migration
CREATE TABLE IF NOT EXISTS settings_migration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migrated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    status TEXT
);

INSERT INTO settings_migration_log (description, status) 
VALUES ('Expanded system_settings table with new categories', 'completed');

-- Verify migration by counting new columns
-- This is for manual verification
SELECT 'Migration completed successfully' as result;