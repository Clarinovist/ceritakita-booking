import { getDb } from '@/lib/db';

export interface PaymentSettings {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  qris_image_url?: string;
  updated_at: string;
}

export function getPaymentSettings(): PaymentSettings | null {
  const db = getDb();
  return db.prepare('SELECT * FROM payment_settings ORDER BY updated_at DESC LIMIT 1').get() as PaymentSettings | null;
}

export function updatePaymentSettings(data: {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  qris_image_url?: string;
}): void {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM payment_settings LIMIT 1').get();

  if (existing) {
    db.prepare(`
      UPDATE payment_settings
      SET bank_name = ?, account_name = ?, account_number = ?,
          qris_image_url = COALESCE(?, qris_image_url), updated_at = ?
      WHERE id = ?
    `).run(
      data.bank_name,
      data.account_name,
      data.account_number,
      data.qris_image_url,
      new Date().toISOString(),
      data.id
    );
  } else {
    db.prepare(`
      INSERT INTO payment_settings (id, bank_name, account_name, account_number, qris_image_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.bank_name,
      data.account_name,
      data.account_number,
      data.qris_image_url,
      new Date().toISOString()
    );
  }
}
