import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = getDb();
        const valueProps = db.prepare('SELECT * FROM value_propositions ORDER BY display_order ASC').all();
        return NextResponse.json(valueProps);
    } catch (error) {
        console.error('Error fetching value props:', error);
        return NextResponse.json({ error: 'Failed to fetch value props' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, icon, is_active } = body;
        const db = getDb();

        const maxOrder = db.prepare('SELECT MAX(display_order) as max FROM value_propositions').get() as { max: number };
        const nextOrder = (maxOrder.max || 0) + 1;

        const stmt = db.prepare(`
      INSERT INTO value_propositions (id, title, description, icon, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(randomUUID(), title, description, icon, nextOrder, is_active ? 1 : 0);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating value prop:', error);
        return NextResponse.json({ error: 'Failed to create value prop' }, { status: 500 });
    }
}
