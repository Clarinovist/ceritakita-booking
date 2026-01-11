import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { bulkUpdateLeadStatus, bulkDeleteLeads } from '@/lib/leads';
import type { BulkActionRequest } from '@/lib/types';

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: BulkActionRequest = await request.json();
        const { ids, action, data } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs' }, { status: 400 });
        }

        let affectedCount = 0;

        if (action === 'update_status') {
            if (!data?.status) {
                return NextResponse.json({ error: 'Missing status for update' }, { status: 400 });
            }
            affectedCount = await bulkUpdateLeadStatus(ids, data.status);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            count: affectedCount,
            message: `Successfully updated ${affectedCount} leads`
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        return NextResponse.json({ error: 'Failed to process bulk request' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: BulkActionRequest = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs' }, { status: 400 });
        }

        const affectedCount = await bulkDeleteLeads(ids);

        return NextResponse.json({
            success: true,
            count: affectedCount,
            message: `Successfully deleted ${affectedCount} leads`
        });
    } catch (error) {
        console.error('Error in bulk delete:', error);
        return NextResponse.json({ error: 'Failed to process bulk delete' }, { status: 500 });
    }
}
