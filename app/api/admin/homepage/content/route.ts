import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { HomepageContent } from '@/types/homepage';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = getDb();
        const content = db.prepare('SELECT * FROM homepage_content').all();
        return NextResponse.json(content);
    } catch (error) {
        console.error('Error fetching admin homepage content:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const db = getDb();
        const updates: HomepageContent[] = body;

        const updateStmt = db.prepare('INSERT OR REPLACE INTO homepage_content (id, section, content_key, content_value, updated_at) VALUES (COALESCE((SELECT id FROM homepage_content WHERE section = ? AND content_key = ?), ?), ?, ?, ?, CURRENT_TIMESTAMP)');

        const transaction = db.transaction(() => {
            updates.forEach(item => {
                updateStmt.run(item.section, item.content_key, randomUUID(), item.section, item.content_key, item.content_value);
            });
        });

        transaction();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating homepage content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
