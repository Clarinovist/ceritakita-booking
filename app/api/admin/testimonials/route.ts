import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = getDb();
        const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all();
        return NextResponse.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { quote, author_name, author_title, is_active } = body;
        const db = getDb();

        const maxOrder = db.prepare('SELECT MAX(display_order) as max FROM testimonials').get() as { max: number };
        const nextOrder = (maxOrder.max || 0) + 1;

        const stmt = db.prepare(`
      INSERT INTO testimonials (id, quote, author_name, author_title, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(randomUUID(), quote, author_name, author_title, nextOrder, is_active ? 1 : 0);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
    }
}
