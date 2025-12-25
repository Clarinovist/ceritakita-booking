import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadToB2 } from '@/lib/b2-s3-client';
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';

// GET - Fetch payment settings
export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM payment_settings ORDER BY updated_at DESC LIMIT 1').get();
    
    return NextResponse.json(settings || {
      id: 'default',
      bank_name: '',
      account_name: '',
      account_number: '',
      qris_image_url: null,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

// POST - Update payment settings
export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (authCheck) return authCheck;

    const formData = await req.formData();
    const bankName = formData.get('bank_name') as string;
    const accountName = formData.get('account_name') as string;
    const accountNumber = formData.get('account_number') as string;
    const qrisFile = formData.get('qris_file') as File | null;

    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json({ error: 'Bank name, account name, and account number required' }, { status: 400 });
    }

    let qrisImageUrl: string | null = null;

    // Upload QRIS image if provided
    if (qrisFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(qrisFile.type)) {
        return NextResponse.json({ error: 'Invalid QRIS file type' }, { status: 400 });
      }

      const bytes = await qrisFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const key = `payment/qris/${randomUUID()}-${qrisFile.name}`;
      qrisImageUrl = await uploadToB2(buffer, key, qrisFile.type);
    }

    const db = getDb();
    const settingsId = randomUUID();
    
    // Check if settings exist
    const existing = db.prepare('SELECT id FROM payment_settings LIMIT 1').get() as { id: string } | null;
    
    if (existing) {
      // Update existing
      db.prepare(`
        UPDATE payment_settings
        SET bank_name = ?, account_name = ?, account_number = ?,
            qris_image_url = COALESCE(?, qris_image_url), updated_at = ?
        WHERE id = ?
      `).run(bankName, accountName, accountNumber, qrisImageUrl, new Date().toISOString(), existing.id);
    } else {
      // Create new
      db.prepare(`
        INSERT INTO payment_settings (id, bank_name, account_name, account_number, qris_image_url, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(settingsId, bankName, accountName, accountNumber, qrisImageUrl, new Date().toISOString());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 });
  }
}